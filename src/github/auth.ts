import * as vscode from 'vscode';

/**
 * Get a GitHub authentication token via the VS Code authentication API.
 */
export async function getGitHubToken(): Promise<string> {
  const session = await vscode.authentication.getSession('github', ['repo'], {
    createIfNone: true,
  });
  return session.accessToken;
}

/**
 * Get a GitHub token silently (don't prompt the user).
 * Returns undefined if not authenticated.
 */
export async function getGitHubTokenSilent(): Promise<string | undefined> {
  const session = await vscode.authentication.getSession('github', ['repo'], {
    createIfNone: false,
  });
  return session?.accessToken;
}
