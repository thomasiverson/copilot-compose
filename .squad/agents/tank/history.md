# Project Context

- **Owner:** Tom Iverson
- **Project:** VSExtension — A VS Code extension for sharing composable copilot-instructions across selected GitHub repos via a master repo pattern
- **Stack:** TypeScript, VS Code Extension API, GitHub Actions, GitHub API
- **Org:** thomasiverson
- **Created:** 2026-03-19

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-03-19 — Phase 1 MVP Complete — All 58 Tests Passing

**Team Status Update:**
Phase 1 MVP build complete. Full VS Code extension scaffold, core composition engine, comprehensive test suite (58/58 passing), schema-validated YAML config, 9 example modules with 2 presets, and complete documentation suite.

**Key Deliverables:**
- **Extension Engine (`src/core/`):** 5 core modules (types, config, fetcher, composer, differ) implementing composition pipeline
- **Extension UI (`src/commands/`, `src/ui/`):** 5 commands (sync, preview, init, check, browse), status bar, GitHub auth integration
- **Bundling:** esbuild produces single dist/extension.js (185KB), builds in <1 second
- **Tests:** Vitest infrastructure with TDD strategy, 58 tests spanning config, composer, fetcher, differ; all passing
- **Schema & Modules:** JSON Schema (oneOf constraint), 9 example modules across 4 categories, 2 presets, 3 config variants
- **Documentation:** README (290 lines, problem-solution-architecture), MARKETPLACE.md (VS Code listing), CHANGELOG.md (roadmap)

**Key File Paths:**
- **Engine:** `src/core/` (types, config, fetcher, composer, differ)
- **Commands:** `src/commands/` (sync, preview, init, check, browse)
- **UI:** `src/ui/` (statusBar, github), `src/` (extension.ts entry point)
- **Schema:** `schemas/copilot-compose.schema.json`
- **Examples:** `examples/master-repo/` (modules, presets), `examples/target-repo/` (configs, output)
- **Tests:** `src/core/__tests__/` (58 tests)
- **Docs:** README.md, MARKETPLACE.md, CHANGELOG.md

**Next:** Phase 2 (GitHub Action for CI enforcement, automated composition in workflows)

### 2026-03-19 — Architecture Plan Delivered

**Architecture decisions made:**
- Hybrid approach: VS Code Extension (Phase 1) + GitHub Action (Phase 2), with shared core library
- Master repo: `thomasiverson/copilot-instructions` with `modules/` (categorized) + `presets/` + `schemas/`
- Module format: Markdown with YAML frontmatter (id, version, tags, scope, dependencies, conflicts)
- Target repo config: `.github/copilot-compose.yaml` (YAML, supports modules, presets, overrides, version pinning)
- Composed output: `.github/copilot-instructions.md` — committed to repo, not gitignored
- Shared composition engine: `@thomasiverson/copilot-compose-core` npm package (config parse → fetch → compose)
- Test strategy required: composition engine validation, extension integration tests, action CI tests

### 2026-03-19 — Test Infrastructure & Core Library Tests

**Test infrastructure set up:**
- Vitest configured as test runner (`vitest.config.ts` at root)
- Scripts added: `test`, `test:watch`, `test:coverage`
- V8 coverage provider targeting `src/core/**/*.ts`
- Tests co-located in `src/core/__tests__/` (mirroring src structure)

**58 tests written across 4 test files (TDD — ahead of implementation):**
- `config.test.ts` — 19 tests: parsing, defaults, validation, overrides, path-instructions, presets
- `composer.test.ts` — 13 tests: single/multi module, headers, overrides, path-specific, edge cases
- `fetcher.test.ts` — 14 tests: parsing, mock GitHub API, caching, TTL, error codes (404/401/403/429)
- `differ.test.ts` — 12 tests: identical, changed, header stripping, missing file, edge cases

**Current status:** 18 pass (fetcher tests with inline mock/stubs), 40 pending implementation.
All failures are "not implemented yet" — expected TDD behavior. Tests will pass once Neo builds the core modules.

**Key decisions:**
- Tests use dynamic `require()` with try/catch — gracefully stubs missing implementations
- MockGitHubApi class in fetcher tests avoids real network calls
- Inline types defined in test files (will switch to imports from `src/core/types.ts` once available)
- tsconfig.json already excludes `**/*.test.ts` from compilation — no conflicts with build
