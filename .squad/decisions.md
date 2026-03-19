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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
