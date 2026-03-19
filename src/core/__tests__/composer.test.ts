/**
 * Composer Tests
 *
 * Tests for composing modules into the final copilot-instructions.md output.
 * Covers single/multi module composition, headers, overrides, path-specific
 * modules, ordering, empty edge cases, and frontmatter stripping.
 */
import { describe, it, expect } from 'vitest';
import { compose } from '../composer';
import type { ComposeConfig, ComposeModule, ComposeResult, ModuleFrontmatter } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeModule(
  overrides: Partial<ComposeModule> & { frontmatter: Partial<ModuleFrontmatter> },
): ComposeModule {
  const fm: ModuleFrontmatter = {
    id: 'test-module',
    name: 'Test Module',
    description: 'A test module',
    tags: [],
    version: '1.0.0',
    author: 'tester',
    requires: [],
    conflicts: [],
    scope: 'repo-wide',
    ...overrides.frontmatter,
  };
  return {
    frontmatter: fm,
    content: overrides.content ?? '# Test Module\n\nSome instructions.',
    rawContent:
      overrides.rawContent ??
      `---\nid: ${fm.id}\n---\n${overrides.content ?? '# Test Module\n\nSome instructions.'}`,
  };
}

function defaultConfig(overrides?: Partial<ComposeConfig>): ComposeConfig {
  return {
    source: { repo: 'thomasiverson/copilot-instructions', ref: 'main' },
    modules: ['coding-standards'],
    sync: { strategy: 'merge', header: true, separator: '---' },
    ...overrides,
  };
}

// ─── Test Suites ────────────────────────────────────────────────────────────

describe('Composer', () => {
  describe('single module composition', () => {
    it('should compose a single module into output', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'coding-standards',
        makeModule({
          frontmatter: { id: 'coding-standards', name: 'Coding Standards' },
          content: '# Coding Standards\n\nUse camelCase for variables.',
        }),
      );

      const result = compose(modules, defaultConfig());

      expect(result.mainFile).toContain('Coding Standards');
      expect(result.mainFile).toContain('Use camelCase for variables');
    });
  });

  describe('multiple module composition', () => {
    it('should compose multiple modules with separator between sections', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'coding-standards',
        makeModule({
          frontmatter: { id: 'coding-standards' },
          content: '# Coding Standards\n\nRule one.',
        }),
      );
      modules.set(
        'security',
        makeModule({
          frontmatter: { id: 'security' },
          content: '# Security\n\nRule two.',
        }),
      );

      const config = defaultConfig({ modules: ['coding-standards', 'security'] });
      const result = compose(modules, config);

      expect(result.mainFile).toContain('Rule one.');
      expect(result.mainFile).toContain('Rule two.');
      // Separator should appear between sections
      expect(result.mainFile).toContain('---');
    });

    it('should respect module ordering from config', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'alpha',
        makeModule({
          frontmatter: { id: 'alpha' },
          content: '# Alpha Module',
        }),
      );
      modules.set(
        'beta',
        makeModule({
          frontmatter: { id: 'beta' },
          content: '# Beta Module',
        }),
      );

      // Order: beta before alpha
      const config = defaultConfig({ modules: ['beta', 'alpha'] });
      const result = compose(modules, config);

      const betaIdx = result.mainFile.indexOf('Beta Module');
      const alphaIdx = result.mainFile.indexOf('Alpha Module');
      expect(betaIdx).toBeLessThan(alphaIdx);
    });
  });

  describe('header comment', () => {
    it('should include HTML comment header with provenance metadata when header=true', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'coding-standards',
        makeModule({
          frontmatter: { id: 'coding-standards' },
          content: '# Standards',
        }),
      );

      const config = defaultConfig();
      const result = compose(modules, config);

      expect(result.mainFile).toContain('<!-- DO NOT EDIT');
      expect(result.mainFile).toContain('thomasiverson/copilot-instructions');
    });

    it('should NOT include header when header=false', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'coding-standards',
        makeModule({
          frontmatter: { id: 'coding-standards' },
          content: '# Standards',
        }),
      );

      const config = defaultConfig({
        sync: { strategy: 'merge', header: false, separator: '---' },
      });
      const result = compose(modules, config);

      expect(result.mainFile).not.toContain('<!-- DO NOT EDIT');
    });
  });

  describe('overrides', () => {
    it('should apply prepend override before module content', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'security',
        makeModule({
          frontmatter: { id: 'security' },
          content: '# Security Checklist',
        }),
      );

      const config = defaultConfig({
        modules: ['security'],
        overrides: {
          security: { prepend: '> **WARNING**: Read carefully!' },
        },
      });
      const result = compose(modules, config);

      const prependIdx = result.mainFile.indexOf('WARNING');
      const contentIdx = result.mainFile.indexOf('Security Checklist');
      expect(prependIdx).toBeLessThan(contentIdx);
    });

    it('should apply append override after module content', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'security',
        makeModule({
          frontmatter: { id: 'security' },
          content: '# Security Checklist',
        }),
      );

      const config = defaultConfig({
        modules: ['security'],
        overrides: {
          security: { append: '---\n_See also: internal wiki._' },
        },
      });
      const result = compose(modules, config);

      const contentIdx = result.mainFile.indexOf('Security Checklist');
      const appendIdx = result.mainFile.indexOf('internal wiki');
      expect(contentIdx).toBeLessThan(appendIdx);
    });

    it('should apply both prepend and append on the same module', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'security',
        makeModule({
          frontmatter: { id: 'security' },
          content: '# Security Checklist',
        }),
      );

      const config = defaultConfig({
        modules: ['security'],
        overrides: {
          security: {
            prepend: 'BEFORE-MARKER',
            append: 'AFTER-MARKER',
          },
        },
      });
      const result = compose(modules, config);

      const beforeIdx = result.mainFile.indexOf('BEFORE-MARKER');
      const contentIdx = result.mainFile.indexOf('Security Checklist');
      const afterIdx = result.mainFile.indexOf('AFTER-MARKER');
      expect(beforeIdx).toBeLessThan(contentIdx);
      expect(contentIdx).toBeLessThan(afterIdx);
    });
  });

  describe('path-specific modules', () => {
    it('should produce separate path files for path-specific modules', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'sql-tips',
        makeModule({
          frontmatter: {
            id: 'sql-tips',
            scope: 'path-specific',
            applyTo: '**/*.sql',
          },
          content: '# SQL Tips\n\nAlways use parameterized queries.',
        }),
      );

      const config = defaultConfig({
        modules: [],
        pathInstructions: [{ id: 'sql-tips', applyTo: '**/*.sql' }],
      });
      const result = compose(modules, config);

      expect(result.pathFiles.length).toBeGreaterThanOrEqual(1);
      const sqlFile = result.pathFiles.find((f) =>
        f.content.includes('SQL Tips'),
      );
      expect(sqlFile).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty module list gracefully', () => {
      const modules = new Map<string, ComposeModule>();
      const config = defaultConfig({ modules: [] });
      const result = compose(modules, config);

      // Should produce a valid (possibly header-only) result without throwing
      expect(result).toBeDefined();
      expect(result.mainFile).toBeDefined();
    });

    it('should handle modules with no body content', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'empty-body',
        makeModule({
          frontmatter: { id: 'empty-body' },
          content: '',
        }),
      );

      const config = defaultConfig({ modules: ['empty-body'] });
      const result = compose(modules, config);

      // Should not throw; result should still be valid
      expect(result).toBeDefined();
    });

    it('should strip YAML frontmatter from output (only body goes in)', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'has-frontmatter',
        makeModule({
          frontmatter: { id: 'has-frontmatter', version: '2.0.0' },
          content: '# Clean Content',
          rawContent: '---\nid: has-frontmatter\nversion: "2.0.0"\n---\n# Clean Content',
        }),
      );

      const config = defaultConfig({ modules: ['has-frontmatter'] });
      const result = compose(modules, config);

      // The mainFile should contain the body but NOT raw frontmatter delimiters
      // (other than the HTML comment header which is different)
      expect(result.mainFile).toContain('Clean Content');
      // Should not contain the YAML frontmatter block
      expect(result.mainFile).not.toMatch(/^---\s*\nid: has-frontmatter/m);
    });
  });

  describe('metadata', () => {
    it('should include provenance metadata in result', () => {
      const modules = new Map<string, ComposeModule>();
      modules.set(
        'coding-standards',
        makeModule({
          frontmatter: { id: 'coding-standards' },
          content: '# Standards',
        }),
      );

      const config = defaultConfig();
      const result = compose(modules, config);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.source).toBe('thomasiverson/copilot-instructions@main');
      expect(result.metadata.modules).toContain('coding-standards');
      expect(result.metadata.generatedAt).toBeDefined();
    });
  });
});
