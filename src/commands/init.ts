import * as vscode from 'vscode';
import * as YAML from 'yaml';
import { GitHubFetcher, parseModule } from '../core';
import type { ComposeConfig } from '../core';
import { getGitHubToken } from '../github/auth';

/**
 * Init command: Interactively create a copilot-compose.yaml config file.
 */
export async function initCommand(): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    const workspaceFolder = workspaceFolders[0];

    // Check if config already exists
    const configUri = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-compose.yaml');
    try {
      await vscode.workspace.fs.stat(configUri);
      const overwrite = await vscode.window.showWarningMessage(
        'A copilot-compose.yaml already exists. Overwrite?',
        'Yes',
        'No'
      );
      if (overwrite !== 'Yes') {return;}
    } catch {
      // File doesn't exist — good
    }

    // Prompt for master repo
    const settings = vscode.workspace.getConfiguration('copilotCompose');
    const defaultRepo = settings.get<string>('defaultMasterRepo', '');

    const repoInput = await vscode.window.showInputBox({
      prompt: 'Master repo for copilot instructions (owner/repo)',
      value: defaultRepo,
      placeHolder: 'e.g. thomasiverson/copilot-instructions',
      validateInput: (value) => {
        if (!value || !value.includes('/')) {
          return 'Please enter a valid owner/repo format';
        }
        return undefined;
      },
    });

    if (!repoInput) {return;}

    const [owner, repo] = repoInput.split('/');
    const token = await getGitHubToken();
    const fetcher = new GitHubFetcher(token);

    // Fetch available modules
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Fetching available modules...' },
      async () => {
        const moduleIndex = await fetcher.buildModuleIndex(owner, repo, 'main');

        if (moduleIndex.size === 0) {
          vscode.window.showWarningMessage(`No modules found in ${repoInput}. Make sure the repo has a modules/ directory.`);
          return;
        }

        // Fetch module metadata for QuickPick descriptions
        const quickPickItems: vscode.QuickPickItem[] = [];
        for (const [id, modulePath] of moduleIndex) {
          try {
            const rawContent = await fetcher.fetchFile(owner, repo, modulePath, 'main');
            const mod = parseModule(rawContent);
            quickPickItems.push({
              label: mod.frontmatter.name || id,
              description: mod.frontmatter.tags.join(', '),
              detail: mod.frontmatter.description || `Module: ${id}`,
              picked: false,
            });
          } catch {
            quickPickItems.push({
              label: id,
              description: '',
              detail: `Module: ${id}`,
            });
          }
        }

        // Let user pick modules
        const selected = await vscode.window.showQuickPick(quickPickItems, {
          canPickMany: true,
          placeHolder: 'Select modules to include',
          title: 'Copilot Compose: Select Modules',
        });

        if (!selected || selected.length === 0) {return;}

        // Map selected labels back to module IDs
        const moduleIds = selected.map((item) => {
          for (const [id, modulePath] of moduleIndex) {
            try {
              const idFromLabel = id;
              if (item.label === idFromLabel || item.detail === `Module: ${id}`) {
                return id;
              }
            } catch {
              // skip
            }
          }
          // Fallback: use label as ID
          return item.label;
        });

        // Generate config YAML
        const config: Partial<ComposeConfig> = {
          source: {
            repo: repoInput,
            ref: 'main',
          },
          modules: moduleIds,
          sync: {
            strategy: 'merge',
            header: true,
            separator: '---',
          },
        };

        const yamlContent = YAML.stringify(config);
        const fileContent = `# Copilot Compose Configuration\n# See: https://github.com/${repoInput}\n\n${yamlContent}`;

        // Ensure .github directory exists
        const githubDir = vscode.Uri.joinPath(workspaceFolder.uri, '.github');
        try {
          await vscode.workspace.fs.createDirectory(githubDir);
        } catch {
          // may already exist
        }

        await vscode.workspace.fs.writeFile(configUri, Buffer.from(fileContent, 'utf-8'));

        // Open the config file
        const doc = await vscode.workspace.openTextDocument(configUri);
        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage(
          `✅ Created copilot-compose.yaml with ${moduleIds.length} module${moduleIds.length !== 1 ? 's' : ''}`
        );
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Copilot Compose init failed: ${message}`);
  }
}
