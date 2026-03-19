import * as vscode from 'vscode';
import * as path from 'path';
import { parseConfig, buildConfig, resolvePreset, GitHubFetcher, compose, diffInstructions } from '../core';
import { getGitHubToken } from '../github/auth';
import { setSyncing, setInSync, setError } from '../ui/statusBar';

/**
 * Read the copilot-compose.yaml from the workspace.
 */
async function readWorkspaceConfig(): Promise<{ config: ReturnType<typeof parseConfig>; workspaceFolder: vscode.WorkspaceFolder }> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    throw new Error('No workspace folder open');
  }

  const workspaceFolder = workspaceFolders[0];
  const configUri = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-compose.yaml');

  let configContent: string;
  try {
    const configBytes = await vscode.workspace.fs.readFile(configUri);
    configContent = Buffer.from(configBytes).toString('utf-8');
  } catch {
    throw new Error('No .github/copilot-compose.yaml found in workspace. Run "Copilot Compose: Initialize Config" first.');
  }

  const token = await getGitHubToken();
  const fetcher = new GitHubFetcher(token);
  let config = parseConfig(configContent);

  // Resolve preset if specified
  if (config.preset) {
    const [owner, repo] = config.source.repo.split('/');
    try {
      const presetContent = await fetcher.fetchFile(owner, repo, `presets/${config.preset}.yaml`, config.source.ref);
      const presetModules = resolvePreset(presetContent);
      config = buildConfig(configContent, presetModules);
    } catch {
      // Preset not found, continue without it
    }
  }

  return { config, workspaceFolder };
}

/**
 * Sync command: Fetch modules and write composed instructions.
 */
export async function syncCommand(): Promise<void> {
  try {
    setSyncing();

    const { config, workspaceFolder } = await readWorkspaceConfig();
    const token = await getGitHubToken();
    const settings = vscode.workspace.getConfiguration('copilotCompose');
    const cacheTtl = settings.get<number>('cacheTimeout', 3600);
    const showPreview = settings.get<boolean>('showPreviewBeforeSync', true);

    const fetcher = new GitHubFetcher(token, cacheTtl);
    const [owner, repo] = config.source.repo.split('/');

    // Fetch all modules
    const modules = await fetcher.fetchModules(owner, repo, config.modules, config.source.ref);

    // Compose the final content
    const result = compose(modules, config);

    // Read existing file for diff
    const instructionsUri = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-instructions.md');
    let existingContent: string | null = null;
    try {
      const existingBytes = await vscode.workspace.fs.readFile(instructionsUri);
      existingContent = Buffer.from(existingBytes).toString('utf-8');
    } catch {
      // File doesn't exist yet
    }

    const diff = diffInstructions(existingContent, result.mainFile);

    if (!diff.isDifferent) {
      setInSync();
      vscode.window.showInformationMessage('✅ Copilot instructions are already in sync.');
      return;
    }

    // Show preview if enabled
    if (showPreview) {
      const choice = await vscode.window.showWarningMessage(
        diff.summary,
        { modal: false },
        'Apply Changes',
        'Preview Diff',
        'Cancel'
      );

      if (choice === 'Preview Diff') {
        await showDiffPreview(workspaceFolder, existingContent, result.mainFile);
        return;
      }

      if (choice !== 'Apply Changes') {
        return;
      }
    }

    // Write the main file
    await writeInstructionFile(workspaceFolder, '.github/copilot-instructions.md', result.mainFile);

    // Write path-specific files
    for (const pathFile of result.pathFiles) {
      await writeInstructionFile(workspaceFolder, pathFile.path, pathFile.content);
    }

    setInSync();
    const moduleCount = result.metadata.modules.length;
    vscode.window.showInformationMessage(
      `✅ Synced ${moduleCount} module${moduleCount !== 1 ? 's' : ''} from ${config.source.repo}`
    );
  } catch (err) {
    setError();
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Copilot Compose sync failed: ${message}`);
  }
}

async function writeInstructionFile(workspaceFolder: vscode.WorkspaceFolder, relativePath: string, content: string): Promise<void> {
  const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, relativePath);
  const dirUri = vscode.Uri.joinPath(workspaceFolder.uri, path.dirname(relativePath));

  // Ensure directory exists
  try {
    await vscode.workspace.fs.createDirectory(dirUri);
  } catch {
    // Directory may already exist
  }

  await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf-8'));
}

async function showDiffPreview(
  workspaceFolder: vscode.WorkspaceFolder,
  existingContent: string | null,
  composedContent: string
): Promise<void> {
  const existingUri = existingContent !== null
    ? vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-instructions.md')
    : vscode.Uri.parse('untitled:current-copilot-instructions.md');

  // Write composed content to a temp untitled doc for preview
  const composedDoc = await vscode.workspace.openTextDocument({
    content: composedContent,
    language: 'markdown',
  });

  await vscode.commands.executeCommand(
    'vscode.diff',
    existingContent !== null ? existingUri : composedDoc.uri,
    composedDoc.uri,
    'Copilot Instructions: Current ↔ Composed'
  );
}

export { readWorkspaceConfig };
