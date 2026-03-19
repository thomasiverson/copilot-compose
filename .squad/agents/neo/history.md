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
- Phase 1 MVP: VS Code Extension architecture for local composition and GitHub integration

### 2026-03-19 — Phase 1 Extension Scaffolded & Core Built

**What was built:**
- Full VS Code extension scaffold: package.json (manifest, commands, settings), tsconfig.json, .vscodeignore, esbuild.mjs bundler
- Core library (`src/core/`): types.ts, config.ts (YAML parser with defaults), fetcher.ts (GitHub API + in-memory cache + module index), composer.ts (header/separator/overrides/path-specific), differ.ts (smart diff with header stripping), barrel index.ts
- 5 commands: sync (fetch+compose+write), preview (diff editor), init (interactive QuickPick setup), check (drift detection), browse (module catalog)
- GitHub auth wrapper using VS Code authentication API (`vscode.authentication.getSession('github', ['repo'])`)
- Status bar item with sync state indicators (idle/syncing/in-sync/out-of-date/error)
- Auto-check on workspace open (silent, non-intrusive)
- esbuild bundling produces single dist/extension.js (~185KB)
- `tsc --noEmit` passes clean, esbuild bundles successfully

**Key implementation details:**
- `gray-matter` for YAML frontmatter parsing, `yaml` for config parsing
- GitHubFetcher class with in-memory cache (configurable TTL), recursive module index building
- Diff utility strips auto-generated headers before comparing to avoid false positives
- All errors use typed ComposeError with codes (CONFIG_NOT_FOUND, AUTH_FAILED, RATE_LIMITED, etc.)
- `vscode` module is external in esbuild bundle (provided at runtime by VS Code)
