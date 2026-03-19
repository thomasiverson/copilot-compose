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
- DevRel: Plan marketplace listing for VS Code extension, documentation for module authors, configuration guides

### 2026-03-19 — Documentation Suite Complete

**Documentation Deliverables:**
- **README.md (290 lines):** Problem statement (3-paragraph) + solution overview + quick start (3 steps) + full configuration reference with examples (basic, presets, pinning, overrides, path-specific) + master repo setup guide (module format, directory structure, example module & preset) + extension commands table (5 commands) + settings table (5 settings) + architecture flow (4-step compose pipeline) + roadmap (3 phases) + contributing guide + MIT license
- **MARKETPLACE.md:** Marketing-focused version for VS Code extension listing — catchy subtitle, feature bullets (4x with emoji), quick install/usage, common use cases, roadmap snapshot, call-to-action link to full README
- **CHANGELOG.md:** Initial v0.1.0 entry with comprehensive feature list (sync/preview/init/check/browse commands, status bar, auto-sync, modules, version pinning, overrides, path-specific instructions, presets, 5 settings, config/composed file format) + planned phases (Phase 2 GitHub Action, Phase 3 enhanced UX)

**Writing principles applied:**
- Target audience: Developer who found this project 5 minutes ago
- Structure: Problem → Solution → Quick Start → Configuration Reference → Master Repo Setup → Commands/Settings → Architecture → Roadmap
- Examples included: Real YAML configs, module frontmatter with metadata, preset structure, directory layout
- Clarity tools used: Tables for command/settings reference, numbered steps for quick start, code blocks for all configs
- Empathy-driven: Acknowledged pain points (org-level too broad, per-repo manual) before presenting solution
