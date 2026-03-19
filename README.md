# Copilot Compose

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=thomasiverson.copilot-compose)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](package.json)

**Share composable Copilot instructions across teams and repos—without copy-paste.**

## The Problem

Copilot instructions live in `.github/copilot-instructions.md` per repo. But what if you have:
- **Organization-wide guidelines** (coding standards, security policies, naming conventions) that belong in *every* repo?
- **Team-specific modules** (frontend tooling, backend patterns, infra practices) that only some teams need?
- **Project instructions** that are specific to *this* repo?

Today, you either:
1. **Org-level is too broad** — GitHub organization `.instructions.md` requires admin approval and can't be selective per repo.
2. **Per-repo is manual** — Copy-paste instructions into each repo and keep them in sync by hand.
3. **No middle ground** — No way to compose shared modules + team-specific guidance + project-specific overrides.

**Copilot Compose** fills that gap.

## The Solution

A **master repo** (e.g., `thomasiverson/copilot-instructions`) stores composable instruction **modules** (Markdown with metadata). Your project repo adds a simple **config file** (`.github/copilot-compose.yaml`), and the VS Code extension syncs and **composes** all selected modules into a single `.github/copilot-instructions.md` file.

- **Reuse** instruction modules across projects
- **Version-pin** modules to a branch, tag, or commit SHA
- **Override** global settings with project-specific tweaks
- **Review** instruction changes in pull requests (composed file is committed)

## Quick Start

### 1. Install the Extension

Open VS Code. Press `Ctrl+Shift+X` (Cmd+Shift+X on Mac). Search for **"Copilot Compose"** and click **Install**.

Or install via CLI:
```bash
code --install-extension thomasiverson.copilot-compose
```

### 2. Add Configuration to Your Repo

Create `.github/copilot-compose.yaml`:

```yaml
source: https://github.com/thomasiverson/copilot-instructions
modules:
  - id: coding-standards
    ref: main
  - id: security-checklist
    ref: v1.0.0
  - id: typescript-patterns
    ref: main
```

### 3. Run Sync

Open the VS Code **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) and select:

```
Copilot Compose: Sync
```

The extension fetches modules from your master repo, composes them, and writes `.github/copilot-instructions.md`.

**That's it.** Copilot now reads from the composed instructions.

---

## Configuration Reference

### Full Example: `.github/copilot-compose.yaml`

```yaml
# Source repo containing modules
source: https://github.com/thomasiverson/copilot-instructions
ref: main  # Optional: default ref for all modules (branch, tag, or commit SHA)

# List of modules to include
modules:
  - id: coding-standards          # Module ID from master repo
    ref: main                     # Override ref for this module (optional)
  - id: security-checklist
  - id: typescript-patterns
    ref: v1.2.0

# Optional: Use predefined presets instead of listing modules
# (presets are module collections defined in the master repo)
# presets:
#   - name: team-frontend
#   - name: team-backend

# Optional: Module-level overrides
overrides:
  - id: security-checklist
    prepend: |
      # Project-Specific Security Notes
      - All API keys must be in GitHub Secrets, never in code.
    append: |
      - Contact security@example.com for breach reports.

# Optional: Path-specific instructions (append to certain file types)
path_instructions:
  "**/*.sql":
    - id: sql-performance-tips
  "**/*.tf":
    - id: terraform-patterns
```

### Usage Patterns

**Basic (start here):**
```yaml
source: https://github.com/thomasiverson/copilot-instructions
modules:
  - id: coding-standards
  - id: my-team-guidelines
```

**With presets:**
```yaml
source: https://github.com/thomasiverson/copilot-instructions
presets:
  - name: team-backend
  - name: security-baseline
```

**Version pinning:**
```yaml
source: https://github.com/thomasiverson/copilot-instructions
ref: v2.0.0  # All modules use this ref unless overridden
modules:
  - id: coding-standards
  - id: security-checklist
    ref: v1.5.0  # This one uses v1.5.0 instead
```

**With overrides:**
```yaml
source: https://github.com/thomasiverson/copilot-instructions
modules:
  - id: coding-standards
overrides:
  - id: coding-standards
    prepend: |
      # Project Exceptions
      Use internal-lib/ instead of lodash for utilities.
```

---

## Creating a Master Repo

Your **master repo** stores reusable instruction modules. Here's how to set one up:

### Module Format

Each module is a Markdown file with YAML frontmatter:

```markdown
---
id: coding-standards
version: "1.0.0"
tags: [patterns, language-agnostic]
scope: organization
dependencies: []
conflicts: []
---

# Coding Standards

Use clear variable names...

## Python
- Use type hints...

## TypeScript
- Use strict mode...
```

### Directory Structure

```
copilot-instructions/
├── modules/
│   ├── coding-standards.md
│   ├── security-checklist.md
│   ├── frontend/
│   │   └── react-patterns.md
│   └── backend/
│       └── typescript-patterns.md
├── presets/
│   ├── team-frontend.yaml
│   ├── team-backend.yaml
│   └── security-baseline.yaml
├── schemas/
│   └── module-schema.json
└── README.md
```

### Example Module: `modules/coding-standards.md`

```markdown
---
id: coding-standards
version: "1.0.0"
tags: [core, all-projects]
scope: organization
dependencies: []
conflicts: []
---

# Coding Standards

We follow these principles across all projects:

## Naming Conventions
- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and components
- Use `SCREAMING_SNAKE_CASE` for constants

## Testing
- Aim for >80% code coverage
- Write tests *before* implementation (TDD)
- Name test files `*.test.ts` or `*.spec.ts`
```

### Example Preset: `presets/team-frontend.yaml`

```yaml
name: team-frontend
description: Frontend team standards and patterns
modules:
  - id: coding-standards
    ref: main
  - id: frontend/react-patterns
    ref: main
  - id: security-checklist
    ref: main
tags: [frontend, team-shared]
```

---

## Extension Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| **Copilot Compose: Sync** | — | Fetch modules, compose instructions, write to `.github/copilot-instructions.md` |
| **Copilot Compose: Preview** | — | Show diff view: what would be added/changed/removed by sync |
| **Copilot Compose: Init** | — | Interactive setup: creates `.github/copilot-compose.yaml` with prompts |
| **Copilot Compose: Check** | — | Verify sync status: shows if `.github/copilot-compose.yaml` exists and if composed file is current |
| **Copilot Compose: Browse** | — | Explore available modules and presets from the master repo (read-only) |

---

## Extension Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `copilotCompose.masterRepoUrl` | string | — | Override source URL for all workspaces (optional; config file takes precedence) |
| `copilotCompose.autoSyncOnOpen` | boolean | `true` | Automatically sync when workspace opens |
| `copilotCompose.autoSyncInterval` | number | `3600` | Auto-sync interval (seconds); `0` to disable |
| `copilotCompose.showStatusBar` | boolean | `true` | Show sync status indicator in status bar |
| `copilotCompose.composedFileHeader` | string | "# DO NOT EDIT..." | Header comment prepended to composed file |

---

## How It Works

```
1. Config Parse
   └─> Read .github/copilot-compose.yaml
       ├─ Extract source repo, module IDs, refs, overrides
       └─ Resolve presets to module lists

2. Fetch
   └─> For each module (or from presets):
       ├─ Clone/fetch source repo at specified ref
       ├─ Read module Markdown file
       └─ Parse YAML frontmatter (metadata)

3. Compose
   └─> For each module in order:
       ├─ Apply prepend overrides
       ├─ Include module body
       ├─ Apply append overrides
       └─ Insert path-specific modules where needed

4. Write
   └─> Write composed output to .github/copilot-instructions.md
       ├─ Add "DO NOT EDIT" header comment
       ├─ Commit to repo (or stage in git)
       └─ Notify user: "✓ Sync complete"
```

---

## Roadmap

### Phase 1: VS Code Extension (MVP) ✅ In Progress
- Sync command: fetch and compose from master repo
- Preview and check commands
- Init command with interactive setup
- Status bar indicator
- Auto-sync on workspace open

### Phase 2: GitHub Action (Enforcement)
- Run composition in CI/CD pipeline
- Block PRs if `.github/copilot-instructions.md` is out of sync with config
- Optional: auto-commit synced instructions on merge to main

### Phase 3: Enhanced UX (Module Browser & Presets)
- VS Code sidebar browser: search and explore available modules
- Preset templating: "Quick create" presets with common module combos
- Module dependency resolution (auto-include transitive deps)
- Web-based preset editor in GitHub

---

## Contributing

We welcome contributions! To contribute:

1. **Add a module to the master repo:**
   - Fork `thomasiverson/copilot-instructions`
   - Create `modules/your-module.md` with YAML frontmatter
   - Submit a PR with a description of the module and use case

2. **Report issues or suggest features:**
   - Open an issue on this repo with details
   - For the extension: issues on `thomasiverson/copilot-compose`
   - For the master repo: issues on `thomasiverson/copilot-instructions`

3. **Code contributions:**
   - Clone this repo
   - Install dependencies: `npm install`
   - Make changes, add tests, and verify locally
   - Submit a PR with a clear description

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

**Questions?** Open an issue or reach out on GitHub.
