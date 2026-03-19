import * as YAML from 'yaml';
import type { ComposeConfig } from './types';
import { ComposeError } from './types';

/** Default config values applied when fields are missing */
const CONFIG_DEFAULTS: Pick<ComposeConfig, 'sync'> & { ref: string } = {
  ref: 'main',
  sync: {
    strategy: 'merge',
    header: true,
    separator: '---',
  },
};

/**
 * Parse and validate a copilot-compose.yaml string into a ComposeConfig.
 */
export function parseConfig(yamlContent: string): ComposeConfig {
  let raw: Record<string, unknown>;
  try {
    raw = YAML.parse(yamlContent) as Record<string, unknown>;
  } catch (err) {
    throw new ComposeError(
      `Failed to parse copilot-compose.yaml: ${err instanceof Error ? err.message : String(err)}`,
      'CONFIG_INVALID',
      err
    );
  }

  if (!raw || typeof raw !== 'object') {
    throw new ComposeError('Config file is empty or not a valid YAML object', 'CONFIG_INVALID');
  }

  // Validate required fields
  const source = raw.source as Record<string, unknown> | undefined;
  if (!source || typeof source !== 'object' || !source.repo) {
    throw new ComposeError('Config must include source.repo', 'CONFIG_INVALID');
  }

  const modules = raw.modules;
  if (!Array.isArray(modules)) {
    if (!raw.preset) {
      throw new ComposeError('Config must include at least one module or a preset', 'CONFIG_INVALID');
    }
  }

  // Build normalized sync config
  const rawSync = (raw.sync as Record<string, unknown>) ?? {};
  const sync: ComposeConfig['sync'] = {
    strategy: (rawSync.strategy as 'merge' | 'replace') ?? CONFIG_DEFAULTS.sync.strategy,
    header: rawSync.header !== undefined ? Boolean(rawSync.header) : CONFIG_DEFAULTS.sync.header,
    separator: (rawSync.separator as string) ?? CONFIG_DEFAULTS.sync.separator,
  };

  // Build normalized config
  const config: ComposeConfig = {
    source: {
      repo: String(source.repo),
      ref: source.ref ? String(source.ref) : CONFIG_DEFAULTS.ref,
    },
    modules: Array.isArray(modules) ? modules.map(String) : [],
    sync,
  };

  if (raw.preset) {
    config.preset = String(raw.preset);
  }

  const rawPathInstructions = raw.pathInstructions ?? raw['path-instructions'] ?? raw['path_instructions'];
  if (Array.isArray(rawPathInstructions)) {
    config.pathInstructions = (rawPathInstructions as Array<Record<string, unknown>>).map((pi) => ({
      id: String(pi.id),
      applyTo: String(pi.applyTo),
    }));
  } else if (rawPathInstructions && typeof rawPathInstructions === 'object') {
    // Map format: { "glob": [{ id: "x" }] } → convert to array
    config.pathInstructions = [];
    for (const [glob, entries] of Object.entries(rawPathInstructions as Record<string, Array<Record<string, unknown>>>)) {
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          config.pathInstructions.push({
            id: String(entry.id),
            applyTo: glob,
          });
        }
      }
    }
  }

  if (raw.overrides && typeof raw.overrides === 'object') {
    config.overrides = {};
    for (const [key, val] of Object.entries(raw.overrides as Record<string, Record<string, unknown>>)) {
      config.overrides[key] = {
        ...(val.append ? { append: String(val.append) } : {}),
        ...(val.prepend ? { prepend: String(val.prepend) } : {}),
      };
    }
  }

  return config;
}

/**
 * Resolve a preset name to a list of module IDs.
 * Presets are fetched from the master repo's presets/ directory.
 */
export function resolvePreset(presetContent: string): string[] {
  let raw: Record<string, unknown>;
  try {
    raw = YAML.parse(presetContent) as Record<string, unknown>;
  } catch {
    return [];
  }

  if (raw && Array.isArray(raw.modules)) {
    return raw.modules.map(String);
  }
  return [];
}

/**
 * Read config from a raw YAML string, applying defaults and resolving presets.
 * If presetModules are provided, they are merged with explicitly listed modules.
 */
export function buildConfig(yamlContent: string, presetModules?: string[]): ComposeConfig {
  const config = parseConfig(yamlContent);

  if (presetModules && presetModules.length > 0) {
    // Merge preset modules with explicit modules, preserving explicit order first
    const seen = new Set(config.modules);
    for (const mod of presetModules) {
      if (!seen.has(mod)) {
        config.modules.push(mod);
        seen.add(mod);
      }
    }
  }

  return config;
}
