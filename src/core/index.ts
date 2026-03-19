export type { ModuleFrontmatter, ComposeModule, ComposeConfig, ComposeResult, GitHubContentResponse, GitHubRateLimitInfo, CacheEntry } from './types';
export { ComposeError } from './types';
export { parseConfig, resolvePreset, buildConfig } from './config';
export { GitHubFetcher, parseModule, clearCache } from './fetcher';
export { compose } from './composer';
export { diffInstructions } from './differ';
export type { DiffResult } from './differ';
