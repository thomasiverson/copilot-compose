# Copilot Instructions — Master Module Repository

This repository contains reusable, composable instruction modules for GitHub Copilot. Teams select modules via a `.github/copilot-compose.yaml` config file in their target repos, and the composition engine assembles them into a `.github/copilot-instructions.md` file.

## Module Catalog

| ID | Name | Category | Tags | Requires | Version |
|----|------|----------|------|----------|---------|
| `typescript-strict` | TypeScript Strict Mode | Languages | typescript, language, strict, type-safety | — | 1.0.0 |
| `csharp-conventions` | C# Coding Conventions | Languages | csharp, dotnet, language, conventions | — | 1.0.0 |
| `python-typing` | Python Type Annotations | Languages | python, language, typing, type-safety | — | 1.0.0 |
| `react-patterns` | React Patterns & Best Practices | Frameworks | react, frontend, framework, typescript | `typescript-strict` | 1.0.0 |
| `dotnet-minimal-api` | .NET Minimal API Patterns | Frameworks | dotnet, csharp, api, backend, minimal-api | `csharp-conventions` | 1.0.0 |
| `testing-principles` | Testing Principles | Practices | testing, practices, quality, cross-language | — | 1.0.0 |
| `security-baseline` | Security Baseline | Practices | security, practices, cross-language, baseline | — | 1.0.0 |
| `error-handling` | Error Handling Patterns | Practices | errors, practices, cross-language, reliability | — | 1.0.0 |
| `eslint-prettier` | ESLint & Prettier Standards | Tooling | eslint, prettier, tooling, formatting | `typescript-strict` | 1.0.0 |

## Presets

Presets are curated module bundles for common project types.

| Preset | Description | Modules |
|--------|-------------|---------|
| `fullstack-typescript` | Full-stack TypeScript (React + Node.js) | typescript-strict, react-patterns, testing-principles, security-baseline, error-handling, eslint-prettier |
| `dotnet-api` | .NET 8+ Minimal API | csharp-conventions, dotnet-minimal-api, testing-principles, security-baseline, error-handling |

## Repository Structure

```
modules/
├── languages/
│   ├── typescript-strict.md
│   ├── csharp-conventions.md
│   └── python-typing.md
├── frameworks/
│   ├── react-patterns.md
│   └── dotnet-minimal-api.md
├── practices/
│   ├── testing-principles.md
│   ├── security-baseline.md
│   └── error-handling.md
└── tooling/
    └── eslint-prettier.md
presets/
├── fullstack-typescript.yaml
└── dotnet-api.yaml
```

## Module Format

Each module is a Markdown file with YAML frontmatter:

```markdown
---
id: module-id
name: Human-Readable Name
description: What this module does.
tags: [tag1, tag2]
version: "1.0.0"
author: thomasiverson
requires: []
conflicts: []
scope: global
applyTo: "optional/glob/pattern"
---

# Module Title

Copilot instruction content goes here...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique kebab-case identifier |
| `name` | Yes | Human-readable display name |
| `description` | Yes | Brief summary of the module's purpose |
| `tags` | Yes | Categorization tags for filtering |
| `version` | Yes | Semantic version string |
| `author` | Yes | GitHub username of the module author |
| `requires` | No | Module IDs that must also be included |
| `conflicts` | No | Module IDs that are incompatible |
| `scope` | No | `global` (default) or `path` |
| `applyTo` | No | Glob pattern for path-scoped modules |

## Usage

Add a `.github/copilot-compose.yaml` to your target repo:

```yaml
source:
  repo: thomasiverson/copilot-instructions

modules:
  - typescript-strict
  - react-patterns
  - testing-principles
```

Then run the composition tool (VS Code extension or GitHub Action) to generate your `.github/copilot-instructions.md`.
