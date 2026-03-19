import type { GitHubContentResponse } from '../core/types';

/**
 * Typed wrapper around fetch for GitHub REST API calls.
 */
export class GitHubApiClient {
  private readonly baseUrl = 'https://api.github.com';

  constructor(private readonly token: string) {}

  private get headers(): Record<string, string> {
    return {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${this.token}`,
      'User-Agent': 'copilot-compose-vscode',
    };
  }

  /**
   * Get file/directory contents from a repository.
   */
  async getContents(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubContentResponse | GitHubContentResponse[]> {
    const params = ref ? `?ref=${encodeURIComponent(ref)}` : '';
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}${params}`;

    const response = await fetch(url, { headers: this.headers });
    await this.handleErrors(response, `${owner}/${repo}/${path}`);

    return (await response.json()) as GitHubContentResponse | GitHubContentResponse[];
  }

  /**
   * Get file content as a decoded string.
   */
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const data = (await this.getContents(owner, repo, path, ref)) as GitHubContentResponse;
    if (!data.content) {
      throw new Error(`No content returned for ${path}`);
    }
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }

  /**
   * Check remaining rate limit.
   */
  async getRateLimit(): Promise<{ remaining: number; limit: number; resetAt: Date }> {
    const response = await fetch(`${this.baseUrl}/rate_limit`, {
      headers: this.headers,
    });
    const data = (await response.json()) as { rate: { remaining: number; limit: number; reset: number } };
    return {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      resetAt: new Date(data.rate.reset * 1000),
    };
  }

  private async handleErrors(response: Response, context: string): Promise<void> {
    if (response.ok) {return;}

    const remaining = response.headers.get('x-ratelimit-remaining');
    if (response.status === 403 && remaining === '0') {
      throw new Error('GitHub API rate limit exceeded. Please wait and try again.');
    }

    if (response.status === 401) {
      throw new Error('GitHub authentication failed. Please sign in again.');
    }

    if (response.status === 404) {
      throw new Error(`Not found: ${context}`);
    }

    throw new Error(`GitHub API error (${response.status}): ${response.statusText} for ${context}`);
  }
}
