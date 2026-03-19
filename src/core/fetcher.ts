import matter from 'gray-matter';
import type { ComposeModule, ModuleFrontmatter, CacheEntry, GitHubContentResponse } from './types';
import { ComposeError } from './types';

// ─── In-memory cache ────────────────────────────────────────────────────────

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) {return undefined;}
  if (Date.now() - entry.fetchedAt > entry.ttl * 1000) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, fetchedAt: Date.now(), ttl });
}

export function clearCache(): void {
  cache.clear();
}

// ─── GitHub Fetcher ─────────────────────────────────────────────────────────

export class GitHubFetcher {
  private readonly baseUrl = 'https://api.github.com';

  constructor(
    private readonly token: string,
    private readonly cacheTtl: number = 3600
  ) {}

  private get headers(): Record<string, string> {
    return {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${this.token}`,
      'User-Agent': 'copilot-compose-vscode',
    };
  }

  /**
   * Fetch raw content of a file from a GitHub repo.
   */
  async fetchFile(owner: string, repo: string, path: string, ref: string): Promise<string> {
    const cacheKey = `file:${owner}/${repo}/${path}@${ref}`;
    const cached = getCached<string>(cacheKey);
    if (cached !== undefined) {return cached;}

    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`;
    let response: Response;
    try {
      response = await fetch(url, { headers: this.headers });
    } catch (err) {
      throw new ComposeError(
        `Network error fetching ${owner}/${repo}/${path}: ${err instanceof Error ? err.message : String(err)}`,
        'NETWORK_ERROR',
        err
      );
    }

    if (response.status === 401 || response.status === 403) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        const resetAt = response.headers.get('x-ratelimit-reset');
        throw new ComposeError(
          `GitHub API rate limit exceeded. Resets at ${resetAt ? new Date(Number(resetAt) * 1000).toISOString() : 'unknown'}`,
          'RATE_LIMITED'
        );
      }
      throw new ComposeError('GitHub authentication failed. Check your token permissions.', 'AUTH_FAILED');
    }

    if (response.status === 404) {
      throw new ComposeError(`File not found: ${owner}/${repo}/${path}@${ref}`, 'MODULE_NOT_FOUND');
    }

    if (!response.ok) {
      throw new ComposeError(
        `GitHub API error (${response.status}): ${response.statusText}`,
        'NETWORK_ERROR'
      );
    }

    const data = (await response.json()) as GitHubContentResponse;
    if (data.type !== 'file' || !data.content) {
      throw new ComposeError(`Path is not a file: ${path}`, 'MODULE_NOT_FOUND');
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    setCache(cacheKey, content, this.cacheTtl);
    return content;
  }

  /**
   * List directory contents from a GitHub repo.
   */
  async listDirectory(owner: string, repo: string, path: string, ref: string): Promise<GitHubContentResponse[]> {
    const cacheKey = `dir:${owner}/${repo}/${path}@${ref}`;
    const cached = getCached<GitHubContentResponse[]>(cacheKey);
    if (cached !== undefined) {return cached;}

    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`;
    let response: Response;
    try {
      response = await fetch(url, { headers: this.headers });
    } catch (err) {
      throw new ComposeError(
        `Network error listing ${owner}/${repo}/${path}: ${err instanceof Error ? err.message : String(err)}`,
        'NETWORK_ERROR',
        err
      );
    }

    if (response.status === 404) {
      throw new ComposeError(`Repository or path not found: ${owner}/${repo}/${path}`, 'REPO_NOT_FOUND');
    }

    if (response.status === 401 || response.status === 403) {
      throw new ComposeError('GitHub authentication failed.', 'AUTH_FAILED');
    }

    if (!response.ok) {
      throw new ComposeError(`GitHub API error (${response.status})`, 'NETWORK_ERROR');
    }

    const data = (await response.json()) as GitHubContentResponse[];
    setCache(cacheKey, data, this.cacheTtl);
    return data;
  }

  /**
   * Fetch and parse a module file (Markdown with YAML frontmatter).
   */
  async fetchModule(owner: string, repo: string, modulePath: string, ref: string): Promise<ComposeModule> {
    const rawContent = await this.fetchFile(owner, repo, modulePath, ref);
    return parseModule(rawContent);
  }

  /**
   * Fetch multiple modules by ID, searching in the modules/ directory.
   */
  async fetchModules(
    owner: string,
    repo: string,
    moduleIds: string[],
    ref: string
  ): Promise<Map<string, ComposeModule>> {
    const results = new Map<string, ComposeModule>();

    // First, list the modules directory to build an index
    const index = await this.buildModuleIndex(owner, repo, ref);

    for (const id of moduleIds) {
      const modulePath = index.get(id);
      if (!modulePath) {
        throw new ComposeError(`Module '${id}' not found in ${owner}/${repo}@${ref}`, 'MODULE_NOT_FOUND');
      }
      const mod = await this.fetchModule(owner, repo, modulePath, ref);
      results.set(id, mod);
    }

    return results;
  }

  /**
   * Build an index of module ID → file path by scanning the modules/ directory.
   */
  async buildModuleIndex(owner: string, repo: string, ref: string): Promise<Map<string, string>> {
    const cacheKey = `index:${owner}/${repo}@${ref}`;
    const cached = getCached<Map<string, string>>(cacheKey);
    if (cached !== undefined) {return cached;}

    const index = new Map<string, string>();
    await this.scanModulesDir(owner, repo, 'modules', ref, index);
    setCache(cacheKey, index, this.cacheTtl);
    return index;
  }

  private async scanModulesDir(
    owner: string,
    repo: string,
    path: string,
    ref: string,
    index: Map<string, string>
  ): Promise<void> {
    let entries: GitHubContentResponse[];
    try {
      entries = await this.listDirectory(owner, repo, path, ref);
    } catch {
      return; // Directory might not exist
    }

    for (const entry of entries) {
      if (entry.type === 'dir') {
        await this.scanModulesDir(owner, repo, entry.path, ref, index);
      } else if (entry.type === 'file' && entry.name.endsWith('.md')) {
        // Use filename without extension as the module ID
        const id = entry.name.replace(/\.md$/, '');
        index.set(id, entry.path);
      }
    }
  }
}

// ─── Module Parser ──────────────────────────────────────────────────────────

/**
 * Parse a raw module file (Markdown with YAML frontmatter) into a ComposeModule.
 */
export function parseModule(rawContent: string): ComposeModule {
  const parsed = matter(rawContent);

  const data = parsed.data as Partial<ModuleFrontmatter>;
  const frontmatter: ModuleFrontmatter = {
    id: data.id ?? '',
    name: data.name ?? '',
    description: data.description ?? '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    version: data.version ?? '0.0.0',
    author: data.author ?? '',
    requires: Array.isArray(data.requires) ? data.requires : [],
    conflicts: Array.isArray(data.conflicts) ? data.conflicts : [],
    scope: data.scope === 'path-specific' ? 'path-specific' : 'repo-wide',
    ...(data.applyTo ? { applyTo: data.applyTo } : {}),
  };

  return {
    frontmatter,
    content: parsed.content.trim(),
    rawContent,
  };
}
