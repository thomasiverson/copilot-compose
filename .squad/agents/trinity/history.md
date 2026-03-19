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
- Phase 2: GitHub Action for CI enforcement and automated composition

### 2026-03-19 — Schema & Example Content Created

**Deliverables:**
- `schemas/copilot-compose.schema.json` — JSON Schema (draft-07) validating `.github/copilot-compose.yaml`. Enforces `oneOf` constraint (modules XOR preset), pattern validation on IDs and repo format, defaults for sync options.
- `examples/master-repo/` — 9 module files across 4 categories (languages, frameworks, practices, tooling), 2 presets (fullstack-typescript, dotnet-api), and a README catalog.
- `examples/target-repo/.github/` — 3 config variants (individual modules, preset+overrides, version-pinned) plus a composed output example showing the full render with HTML comment header, module sections, overrides applied, and separators.

**Design choices:**
- Module IDs use kebab-case pattern `^[a-z0-9]+(-[a-z0-9]+)*$` for consistency and URL safety.
- Schema uses `oneOf` to enforce mutual exclusivity of `modules` and `preset` fields.
- `overrides` uses `patternProperties` keyed by module ID pattern rather than `additionalProperties: true` for tighter validation.
- Frontmatter includes `requires` and `conflicts` arrays for dependency/conflict resolution by the composition engine.
- Composed output header includes source, config path, timestamp, and module list for traceability.
