import * as vscode from 'vscode';
import { parseConfig, buildConfig, resolvePreset, GitHubFetcher, compose, diffInstructions } from '../core';
import { getGitHubToken } from '../github/auth';
import { setInSync, setOutOfDate, setError } from '../ui/statusBar';

/**
 * Check command: Check whether local instructions are in sync with master repo.
 */
export async function checkCommand(): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    const workspaceFolder = workspaceFolders[0];
    const configUri = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-compose.yaml');

    let configContent: string;
    try {
      const configBytes = await vscode.workspace.fs.readFile(configUri);
      configContent = Buffer.from(configBytes).toString('utf-8');
    } catch {
      vscode.window.showInformationMessage('No copilot-compose.yaml found in this workspace.');
      return;
    }

    const token = await getGitHubToken();
    const settings = vscode.workspace.getConfiguration('copilotCompose');
    const cacheTtl = settings.get<number>('cacheTimeout', 3600);
    const fetcher = new GitHubFetcher(token, cacheTtl);

    let config = parseConfig(configContent);

    // Resolve preset
    if (config.preset) {
      const [owner, repo] = config.source.repo.split('/');
      try {
        const presetContent = await fetcher.fetchFile(owner, repo, `presets/${config.preset}.yaml`, config.source.ref);
        const presetModules = resolvePreset(presetContent);
        config = buildConfig(configContent, presetModules);
      } catch {
        // Continue without preset
      }
    }

    const [owner, repo] = config.source.repo.split('/');

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Checking sync status...' },
      async () => {
        const modules = await fetcher.fetchModules(owner, repo, config.modules, config.source.ref);
        const result = compose(modules, config);

        // Read existing file
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
            diff.summary,
            'Sync Now',
            'Preview',
            'Dismiss'
          );
          if (choice === 'Sync Now') {
            await vscode.commands.executeCommand('copilot-compose.sync');
          } else if (choice === 'Preview') {
            await vscode.commands.executeCommand('copilot-compose.preview');
          }
        } else {
          setInSync();
          vscode.window.showInformationMessage(diff.summary);
        }
      }
    );
  } catch (err) {
    setError();
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Copilot Compose check failed: ${message}`);
  }
}
