# Project Context

- **Owner:** Tom Iverson
- **Project:** VSExtension — A VS Code extension for sharing composable copilot-instructions across selected GitHub repos via a master repo pattern
- **Stack:** TypeScript, VS Code Extension API, GitHub Actions, GitHub API
- **Org:** thomasiverson
- **Created:** 2026-03-19

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-03-19 — Architecture Plan Delivered

**Architecture decisions made:**
- Hybrid approach: VS Code Extension (Phase 1) + GitHub Action (Phase 2), with shared core library
- Master repo: `thomasiverson/copilot-instructions` with `modules/` (categorized) + `presets/` + `schemas/`
- Module format: Markdown with YAML frontmatter (id, version, tags, scope, dependencies, conflicts)
- Target repo config: `.github/copilot-compose.yaml` (YAML, supports modules, presets, overrides, version pinning)
- Composed output: `.github/copilot-instructions.md` — committed to repo, not gitignored
- Shared composition engine: `@thomasiverson/copilot-compose-core` npm package (config parse → fetch → compose)
- Also supports path-specific modules → `.github/instructions/*.instructions.md`
- Rejected: git submodules, npm/NuGet packages, GitHub App (Phase 1)

**Key file paths:**
- Full plan: session-state `plan.md`
- Decisions: `.squad/decisions/inbox/morpheus-architecture-plan.md`
- Config schema: `schemas/copilot-compose.schema.json` (to be created in master repo)

**User preferences:**
- Tom wants composable modules, not monolithic files
- Selected repos only — NOT org-wide
- Open to creative approaches but values practical delivery
- Phased approach accepted: MVP first, then iterate

**Patterns established:**
- ADR (Architecture Decision Record) format for key decisions
- Phase-gated delivery: Extension → Action → Enhanced UX → Scale
- YAML for config (aligns with GitHub Actions conventions)
- VS Code GitHub Auth Provider for extension auth (no PAT management)
