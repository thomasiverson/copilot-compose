import * as vscode from 'vscode';
import { syncCommand } from './commands/sync';
import { previewCommand } from './commands/preview';
import { initCommand } from './commands/init';
import { checkCommand } from './commands/check';
import { browseCommand } from './commands/browse';
import { createStatusBarItem, disposeStatusBar, setOutOfDate } from './ui/statusBar';
import { parseConfig, GitHubFetcher, compose, diffInstructions } from './core';
import { getGitHubTokenSilent } from './github/auth';

export function activate(context: vscode.ExtensionContext): void {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('copilot-compose.sync', syncCommand),
    vscode.commands.registerCommand('copilot-compose.preview', previewCommand),
    vscode.commands.registerCommand('copilot-compose.init', initCommand),
    vscode.commands.registerCommand('copilot-compose.check', checkCommand),
    vscode.commands.registerCommand('copilot-compose.browse', browseCommand)
  );

  // Create status bar item
  const statusBar = createStatusBarItem();
  context.subscriptions.push(statusBar);

  // Auto-check on workspace open if config exists
  const settings = vscode.workspace.getConfiguration('copilotCompose');
  if (settings.get<boolean>('autoSyncOnOpen', true)) {
    autoCheckOnOpen().catch(() => {
      // Silent failure for auto-check
    });
  }
}

/**
 * Automatically check for instruction drift when workspace opens.
 */
async function autoCheckOnOpen(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {return;}

  const workspaceFolder = workspaceFolders[0];
  const configUri = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-compose.yaml');

  // Check if config file exists
  try {
    await vscode.workspace.fs.stat(configUri);
  } catch {
    return; // No config file — nothing to do
  }

  // Get token silently (don't prompt on workspace open)
  const token = await getGitHubTokenSilent();
  if (!token) {return;}

  try {
    const configBytes = await vscode.workspace.fs.readFile(configUri);
    const configContent = Buffer.from(configBytes).toString('utf-8');
    const config = parseConfig(configContent);
    const [owner, repo] = config.source.repo.split('/');

    const settings = vscode.workspace.getConfiguration('copilotCompose');
    const cacheTtl = settings.get<number>('cacheTimeout', 3600);
    const fetcher = new GitHubFetcher(token, cacheTtl);

    const modules = await fetcher.fetchModules(owner, repo, config.modules, config.source.ref);
    const result = compose(modules, config);

    // Read existing instructions
    const instructionsUri = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-instructions.md');
    let existingContent: string | null = null;
    try {
      const existingBytes = await vscode.workspace.fs.readFile(instructionsUri);
      existingContent = Buffer.from(existingBytes).toString('utf-8');
    } catch {
      // File doesn't exist
    }

    const diff = diffInstructions(existingContent, result.mainFile);

    if (diff.isDifferent) {
      setOutOfDate();
      const choice = await vscode.window.showWarningMessage(
        'Copilot instructions are out of date.',
        'Sync Now',
        'Dismiss'
      );
      if (choice === 'Sync Now') {
        await vscode.commands.executeCommand('copilot-compose.sync');
      }
    }
  } catch {
    // Silent failure for background auto-check
  }
}

export function deactivate(): void {
  disposeStatusBar();
}
