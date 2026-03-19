/**
 * Config Parser Tests
 *
 * Tests for parsing copilot-compose.yaml configuration files.
 * Validates defaults, required fields, presets, overrides, and path-instructions.
 */
import { describe, it, expect } from 'vitest';
import { parseConfig, resolvePreset, buildConfig } from '../config';
import type { ComposeConfig } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const MINIMAL_YAML = `
source:
  repo: thomasiverson/copilot-instructions
modules:
  - coding-standards
`;

const FULL_YAML = `
source:
  repo: thomasiverson/copilot-instructions
  ref: v2.0.0
modules:
  - coding-standards
  - security-checklist
  - typescript-patterns
overrides:
  security-checklist:
    prepend: |
      # Project-Specific Security Notes
      - All API keys must be in GitHub Secrets.
    append: |
      - Contact security@example.com for breach reports.
path_instructions:
  "**/*.sql":
    - id: sql-performance-tips
  "**/*.tf":
    - id: terraform-patterns
sync:
  strategy: replace
  header: false
  separator: "==="
`;

// ─── Test Suites ────────────────────────────────────────────────────────────

describe('Config Parser', () => {
  describe('parseConfig — valid YAML', () => {
    it('should parse a valid minimal copilot-compose.yaml', () => {
      const config = parseConfig(MINIMAL_YAML);

      expect(config.source.repo).toBe('thomasiverson/copilot-instructions');
      expect(config.modules).toEqual(['coding-standards']);
    });

    it('should parse a fully-specified config', () => {
      const config = parseConfig(FULL_YAML);

      expect(config.source.repo).toBe('thomasiverson/copilot-instructions');
      expect(config.source.ref).toBe('v2.0.0');
      expect(config.modules).toEqual([
        'coding-standards',
        'security-checklist',
        'typescript-patterns',
      ]);
      expect(config.sync.strategy).toBe('replace');
      expect(config.sync.header).toBe(false);
      expect(config.sync.separator).toBe('===');
    });
  });

  describe('parseConfig — default values', () => {
    it('should default ref to "main"', () => {
      const config = parseConfig(MINIMAL_YAML);
      expect(config.source.ref).toBe('main');
    });

    it('should default sync.strategy to "merge"', () => {
      const config = parseConfig(MINIMAL_YAML);
      expect(config.sync.strategy).toBe('merge');
    });

    it('should default sync.header to true', () => {
      const config = parseConfig(MINIMAL_YAML);
      expect(config.sync.header).toBe(true);
    });

    it('should default sync.separator to "---"', () => {
      const config = parseConfig(MINIMAL_YAML);
      expect(config.sync.separator).toBe('---');
    });
  });

  describe('parseConfig — invalid configs', () => {
    it('should reject config missing source', () => {
      const yaml = `
modules:
  - coding-standards
`;
      expect(() => parseConfig(yaml)).toThrow();
    });

    it('should reject config missing source.repo', () => {
      const yaml = `
source:
  ref: main
modules:
  - coding-standards
`;
      expect(() => parseConfig(yaml)).toThrow();
    });

    it('should reject completely empty YAML', () => {
      expect(() => parseConfig('')).toThrow();
    });

    it('should reject non-object YAML (e.g. a plain string)', () => {
      expect(() => parseConfig('just-a-string')).toThrow();
    });
  });

  describe('parseConfig — overrides', () => {
    it('should parse overrides with append and prepend', () => {
      const config = parseConfig(FULL_YAML);

      expect(config.overrides).toBeDefined();
      expect(config.overrides!['security-checklist']).toBeDefined();
      expect(config.overrides!['security-checklist'].prepend).toContain(
        'Project-Specific Security Notes',
      );
      expect(config.overrides!['security-checklist'].append).toContain(
        'security@example.com',
      );
    });

    it('should handle config with no overrides', () => {
      const config = parseConfig(MINIMAL_YAML);
      // overrides should be undefined or an empty object
      expect(
        config.overrides === undefined ||
          Object.keys(config.overrides).length === 0,
      ).toBe(true);
    });
  });

  describe('parseConfig — path instructions', () => {
    it('should parse path_instructions into pathInstructions array', () => {
      const config = parseConfig(FULL_YAML);

      expect(config.pathInstructions).toBeDefined();
      expect(config.pathInstructions!.length).toBeGreaterThanOrEqual(2);

      const sqlModule = config.pathInstructions!.find(
        (p) => p.id === 'sql-performance-tips',
      );
      expect(sqlModule).toBeDefined();
      expect(sqlModule!.applyTo).toBe('**/*.sql');

      const tfModule = config.pathInstructions!.find(
        (p) => p.id === 'terraform-patterns',
      );
      expect(tfModule).toBeDefined();
      expect(tfModule!.applyTo).toBe('**/*.tf');
    });
  });

  describe('parseConfig — empty / minimal', () => {
    it('should handle config with just source and modules', () => {
      const config = parseConfig(MINIMAL_YAML);

      expect(config.source.repo).toBe('thomasiverson/copilot-instructions');
      expect(config.modules).toEqual(['coding-standards']);
      expect(config.sync).toBeDefined();
    });

    it('should handle empty modules list', () => {
      const yaml = `
source:
  repo: thomasiverson/copilot-instructions
modules: []
`;
      const config = parseConfig(yaml);
      expect(config.modules).toEqual([]);
    });
  });
});

describe('Preset Resolution', () => {
  it('should resolve a preset YAML into a module list', () => {
    const presetYaml = `
name: team-frontend
modules:
  - coding-standards
  - react-patterns
  - accessibility-guidelines
`;
    const modules = resolvePreset(presetYaml);
    expect(modules).toEqual([
      'coding-standards',
      'react-patterns',
      'accessibility-guidelines',
    ]);
  });

  it('should return an empty list for a preset with no modules', () => {
    const presetYaml = `
name: empty-preset
modules: []
`;
    const modules = resolvePreset(presetYaml);
    expect(modules).toEqual([]);
  });
});

describe('buildConfig — preset + modules combined', () => {
  it('should merge preset modules with config-specified modules', () => {
    const yaml = `
source:
  repo: thomasiverson/copilot-instructions
modules:
  - extra-module
preset: team-frontend
`;
    const presetModules = ['coding-standards', 'react-patterns'];
    const config = buildConfig(yaml, presetModules);

    // Preset modules should be included along with the explicitly listed module
    expect(config.modules).toContain('coding-standards');
    expect(config.modules).toContain('react-patterns');
    expect(config.modules).toContain('extra-module');
  });

  it('should deduplicate modules when preset overlaps with explicit list', () => {
    const yaml = `
source:
  repo: thomasiverson/copilot-instructions
modules:
  - coding-standards
  - extra-module
preset: team-frontend
`;
    const presetModules = ['coding-standards', 'react-patterns'];
    const config = buildConfig(yaml, presetModules);

    const codingCount = config.modules.filter(
      (m) => m === 'coding-standards',
    ).length;
    expect(codingCount).toBe(1);
  });
});
