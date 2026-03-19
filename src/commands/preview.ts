import * as vscode from 'vscode';
import { GitHubFetcher, compose, parseConfig, buildConfig, resolvePreset } from '../core';
import { getGitHubToken } from '../github/auth';

/**
 * Preview command: Show a diff of current vs. composed instructions.
 */
export async function previewCommand(): Promise<void> {
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
      vscode.window.showErrorMessage('No .github/copilot-compose.yaml found. Run "Copilot Compose: Initialize Config" first.');
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
    const modules = await fetcher.fetchModules(owner, repo, config.modules, config.source.ref);
    const result = compose(modules, config);

    // Open existing file (or create a placeholder)
    const instructionsUri = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-instructions.md');
    let existingUri: vscode.Uri;

    try {
      await vscode.workspace.fs.stat(instructionsUri);
      existingUri = instructionsUri;
    } catch {
      // File doesn't exist — create a virtual empty doc
      const emptyDoc = await vscode.workspace.openTextDocument({ content: '', language: 'markdown' });
      existingUri = emptyDoc.uri;
    }

    // Show composed content in a virtual document
    const composedDoc = await vscode.workspace.openTextDocument({
      content: result.mainFile,
      language: 'markdown',
    });

    await vscode.commands.executeCommand(
      'vscode.diff',
      existingUri,
      composedDoc.uri,
      'Copilot Instructions: Current ↔ Composed (Preview)'
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Copilot Compose preview failed: ${message}`);
  }
}
