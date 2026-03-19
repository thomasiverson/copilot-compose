// ─── Module Frontmatter ─────────────────────────────────────────────────────

export interface ModuleFrontmatter {
  id: string;
  name: string;
  description: string;
  tags: string[];
  version: string;
  author: string;
  requires: string[];
  conflicts: string[];
  scope: 'repo-wide' | 'path-specific';
  applyTo?: string;
}

// ─── Compose Module ─────────────────────────────────────────────────────────

export interface ComposeModule {
  /** Parsed YAML frontmatter */
  frontmatter: ModuleFrontmatter;
  /** Markdown body (without frontmatter) */
  content: string;
  /** Full file content including frontmatter */
  rawContent: string;
}

// ─── Compose Config (.github/copilot-compose.yaml) ─────────────────────────

export interface ComposeConfig {
  source: {
    /** e.g. "thomasiverson/copilot-instructions" */
    repo: string;
    /** branch, tag, or commit SHA */
    ref: string;
  };
  /** Module IDs to include */
  modules: string[];
  /** Optional preset name that expands to a module list */
  preset?: string;
  /** Path-specific instruction modules */
  pathInstructions?: Array<{
    id: string;
    applyTo: string;
  }>;
  /** Per-module content overrides */
  overrides?: Record<string, { append?: string; prepend?: string }>;
  sync: {
    strategy: 'merge' | 'replace';
    /** Include auto-generated header comment */
    header: boolean;
    /** Separator between module sections */
    separator: string;
  };
}

// ─── Compose Result ─────────────────────────────────────────────────────────

export interface ComposeResult {
  /** Content for .github/copilot-instructions.md */
  mainFile: string;
  /** Path-specific instruction files */
  pathFiles: Array<{ path: string; content: string }>;
  /** Provenance metadata */
  metadata: {
    source: string;
    modules: string[];
    generatedAt: string;
  };
}

// ─── GitHub API Types ───────────────────────────────────────────────────────

export interface GitHubContentResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  download_url: string | null;
}

export interface GitHubRateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
}

// ─── Cache Entry ────────────────────────────────────────────────────────────

export interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  ttl: number;
}

// ─── Errors ─────────────────────────────────────────────────────────────────

export class ComposeError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'CONFIG_NOT_FOUND'
      | 'CONFIG_INVALID'
      | 'MODULE_NOT_FOUND'
      | 'REPO_NOT_FOUND'
      | 'AUTH_FAILED'
      | 'RATE_LIMITED'
      | 'NETWORK_ERROR'
      | 'COMPOSE_ERROR',
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ComposeError';
  }
}
