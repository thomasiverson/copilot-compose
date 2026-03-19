# Copilot Compose — VS Code Extension

**Keep your Copilot instructions in sync across teams and projects—without copy-paste.**

## Why Copilot Compose?

👥 **Share guidelines across repos** — Define organization and team standards once, reuse everywhere  
🔧 **Composable modules** — Pick and mix instruction modules; version-pin each one  
✏️ **Override when needed** — Project-specific tweaks without forking the whole module  
📋 **Review changes in PRs** — Composed instructions are committed; see diffs in code review  

## What You Get

- ⚡ **Sync Command** — Fetch modules from a master repo and compose into `.github/copilot-instructions.md`
- 👁️ **Preview Mode** — See what would change before you sync
- 🚀 **Quick Setup** — Interactive `Init` command creates your config
- 📊 **Status Bar** — Know at a glance if your instructions are current
- 🔍 **Module Browser** — Explore available modules and presets from the master repo

## Get Started in 3 Steps

### 1. Install
Open VS Code. Press `Ctrl+Shift+X`, search for **"Copilot Compose"**, and install.

### 2. Configure
Run **"Copilot Compose: Init"** from the Command Palette (`Ctrl+Shift+P`). Answer a few prompts to create `.github/copilot-compose.yaml`:

```yaml
source: https://github.com/thomasiverson/copilot-instructions
modules:
  - id: coding-standards
  - id: security-checklist
  - id: typescript-patterns
```

### 3. Sync
Run **"Copilot Compose: Sync"** from the Command Palette. Done! Your instructions are now composed and ready for Copilot.

---

## Key Commands

| Command | Purpose |
|---------|---------|
| **Sync** | Fetch and compose all selected modules |
| **Preview** | See what would change before syncing |
| **Init** | Interactive setup of your config file |
| **Check** | Verify sync status |
| **Browse** | Explore available modules and presets |

---

## Common Use Cases

### Organization-Wide Coding Standards
Define your org's naming conventions, testing standards, and coding style *once* in a master repo. Every project syncs the same `coding-standards` module.

### Team-Specific Tooling
Your frontend team shares React patterns. Your backend team shares Kubernetes best practices. Each team's project syncs only what it needs via modules.

### Project Overrides
A security module says "All secrets in GitHub Secrets." Your specific project adds: "Except legacy API keys in `.env.local` (for now)."  
Use the `prepend` and `append` overrides in your config.

### Path-Specific Instructions
Add different modules for different file types — SQL performance tips for `**/*.sql`, Terraform patterns for `**/*.tf`, etc.

---

## Screenshots & Demo

> [Screenshots coming soon]  
> [Demo GIF showing sync workflow]

---

## Learn More

- **Full Documentation:** See the project [README](https://github.com/thomasiverson/copilot-compose/blob/main/README.md) for complete configuration reference and master repo setup guide
- **Master Repo Example:** `thomasiverson/copilot-instructions` (contains example modules and presets)
- **GitHub:** [thomasiverson/copilot-compose](https://github.com/thomasiverson/copilot-compose)

---

## Roadmap

- **Phase 2:** GitHub Action for CI/CD enforcement (auto-sync in pull requests)
- **Phase 3:** Web-based module browser and preset editor

---

**Questions?** Open an issue on GitHub or reach out.
