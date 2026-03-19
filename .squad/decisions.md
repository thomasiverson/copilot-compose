# Squad Decisions

## Architecture Decision Records (ADRs)

### ADR-001: Composed file committed to repo (not gitignored)
- **Author:** Morpheus
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** Copilot reads from the filesystem — committed files work everywhere (GitHub.com, Codespaces, any IDE). Enables code review of instruction changes via PRs. Mitigation: "DO NOT EDIT" header prevents confusion.

### ADR-002: YAML config format (`.github/copilot-compose.yaml`)
- **Author:** Morpheus
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** Supports comments, aligns with GitHub Actions conventions. Lives in `.github/` alongside the files it manages. JSON Schema provided for validation in VS Code and CI.

### ADR-003: Shared core library (`copilot-compose-core`)
- **Author:** Morpheus
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** Composition engine (config parse → fetch → compose) shared between VS Code extension and GitHub Action. Published as npm package; consumed by both components. Single implementation ensures consistent behavior + independent testability.

### ADR-004: Extension first, Action second (phased build)
- **Author:** Morpheus
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** Phase 1 (Weeks 1-4): VS Code Extension + Master Repo (MVP). Phase 2 (Weeks 5-7): GitHub Action for CI enforcement. Phase 3 (Weeks 8-10): Enhanced UX (module browser, presets, templating). Extension delivers immediate value with minimal infra; Action adds enforcement later.

### ADR-005: Module format = YAML frontmatter + Markdown body
- **Author:** Morpheus
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** Consistent with GitHub's own `.instructions.md` convention. Frontmatter carries metadata (id, version, tags, dependencies, conflicts). Body is pure Markdown that becomes instruction content.

### ADR-006: Config file named `copilot-compose.yaml`
- **Author:** Morpheus
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** "Compose" reflects the composable nature of the system. Placed in `.github/` to co-locate with managed files. Supports: module selection, preset references, version pinning, overrides, path-specific modules.

### ADR-007: esbuild for Extension Bundling
- **Author:** Neo
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** Produces ~185KB bundle with source maps. Build completes in <1 second vs 5-10s for webpack. Config is a simple 20-line `esbuild.mjs` file vs complex webpack setup.
- **Implications:**
  - `vscode` is marked as external (provided at runtime)
  - Single entry point: `src/extension.ts` → `dist/extension.js`
  - Supports watch mode for development (`--watch` flag)
  - `gray-matter` and `yaml` are bundled into the output (no runtime npm deps needed)

### ADR-008: Vitest as Test Runner
- **Author:** Tank
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Rationale:** Native TypeScript support, ESM-friendly, fast startup (uses esbuild), Jest-compatible API.
- **Test Strategy:**
  - Tests co-located in `__tests__/` directories next to source files
  - TDD approach: tests written before implementation
  - Mock GitHub API (no real network calls in unit tests)
  - V8 coverage targeting core library only
  - 58 tests across 4 test files; all passing
- **Impact:**
  - Dev dependencies: `vitest`, `@vitest/coverage-v8`
  - Scripts: `test`, `test:watch`, `test:coverage`
  - Config: `vitest.config.ts` at repo root

### ADR-009: Schema enforces modules XOR preset
- **Author:** Trinity
- **Date:** 2026-03-19
- **Status:** ACCEPTED
- **Context:** The `copilot-compose.yaml` config supports two module selection modes: explicit `modules` list or a `preset` reference. Users must use exactly one.
- **Decision:** JSON Schema uses `oneOf` constraint at the root level to enforce mutual exclusivity.
- **Rationale:** Ambiguity prevented at validation time (in VS Code + CI). Schema-level enforcement provides immediate feedback.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
