import * as vscode from 'vscode';
import * as YAML from 'yaml';
import { GitHubFetcher, parseModule } from '../core';
import type { ComposeModule } from '../core';
import { getGitHubToken } from '../github/auth';

/**
 * Browse command: List available modules from the master repo and add to config.
 */
export async function browseCommand(): Promise<void> {
  try {
    const settings = vscode.workspace.getConfiguration('copilotCompose');

    // Try to read existing config for default repo
    let defaultRepo = settings.get<string>('defaultMasterRepo', '');

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const configUri = vscode.Uri.joinPath(workspaceFolders[0].uri, '.github', 'copilot-compose.yaml');
      try {
        const configBytes = await vscode.workspace.fs.readFile(configUri);
        const configContent = Buffer.from(configBytes).toString('utf-8');
        const parsed = YAML.parse(configContent) as Record<string, unknown>;
        const source = parsed.source as Record<string, unknown> | undefined;
        if (source?.repo) {
          defaultRepo = String(source.repo);
        }
      } catch {
        // No config file
      }
    }

    const repoInput = await vscode.window.showInputBox({
      prompt: 'Master repo to browse (owner/repo)',
      value: defaultRepo,
      placeHolder: 'e.g. thomasiverson/copilot-instructions',
    });

    if (!repoInput || !repoInput.includes('/')) {return;}

    const [owner, repo] = repoInput.split('/');
    const token = await getGitHubToken();
    const fetcher = new GitHubFetcher(token);

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Fetching modules...' },
      async () => {
        const moduleIndex = await fetcher.buildModuleIndex(owner, repo, 'main');

        if (moduleIndex.size === 0) {
          vscode.window.showWarningMessage(`No modules found in ${repoInput}`);
          return;
        }

        // Fetch metadata for each module
        const items: Array<vscode.QuickPickItem & { moduleId: string; module?: ComposeModule }> = [];
        for (const [id, modulePath] of moduleIndex) {
          try {
            const rawContent = await fetcher.fetchFile(owner, repo, modulePath, 'main');
            const mod = parseModule(rawContent);
            items.push({
              label: `$(file) ${mod.frontmatter.name || id}`,
              description: `v${mod.frontmatter.version} • ${mod.frontmatter.tags.join(', ')}`,
              detail: mod.frontmatter.description,
              moduleId: id,
              module: mod,
            });
          } catch {
            items.push({
              label: `$(file) ${id}`,
              description: '',
              detail: `Module: ${id}`,
              moduleId: id,
            });
          }
        }

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: 'Select a module to add to your config',
          title: 'Copilot Compose: Browse Modules',
        });

        if (!selected) {return;}

        // Add to config if workspace has one
        if (workspaceFolders && workspaceFolders.length > 0) {
          const configUri = vscode.Uri.joinPath(workspaceFolders[0].uri, '.github', 'copilot-compose.yaml');
          try {
            const configBytes = await vscode.workspace.fs.readFile(configUri);
            const configContent = Buffer.from(configBytes).toString('utf-8');
            const parsed = YAML.parse(configContent) as Record<string, unknown>;

            const modules = Array.isArray(parsed.modules) ? parsed.modules.map(String) : [];
            if (modules.includes(selected.moduleId)) {
              vscode.window.showInformationMessage(`Module '${selected.moduleId}' is already in your config.`);
              return;
            }

            modules.push(selected.moduleId);
            parsed.modules = modules;

            const updatedYaml = YAML.stringify(parsed);
            await vscode.workspace.fs.writeFile(configUri, Buffer.from(updatedYaml, 'utf-8'));

            vscode.window.showInformationMessage(
              `✅ Added '${selected.moduleId}' to copilot-compose.yaml`
            );
          } catch {
            vscode.window.showInformationMessage(
              `Module: ${selected.moduleId}\nRun "Copilot Compose: Initialize Config" to create a config file first.`
            );
          }
        }
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Copilot Compose browse failed: ${message}`);
  }
}
