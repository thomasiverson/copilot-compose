---
id: eslint-prettier
name: ESLint & Prettier Standards
description: Code formatting and linting conventions using ESLint flat config and Prettier for JavaScript/TypeScript projects.
tags: [eslint, prettier, tooling, formatting, javascript, typescript]
version: "1.0.0"
author: thomasiverson
requires: [typescript-strict]
conflicts: []
scope: global
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# ESLint & Prettier Standards

## Configuration

- Use ESLint flat config (`eslint.config.mjs`) — the legacy `.eslintrc` format is deprecated.
- Use Prettier for formatting only. Disable all ESLint formatting rules via `eslint-config-prettier`.
- Run Prettier through ESLint using `eslint-plugin-prettier` so there's a single lint command.
- Extend from `@typescript-eslint/recommended-type-checked` for TypeScript projects.

## Formatting Rules (Prettier)

- Print width: 100 characters.
- Use single quotes for strings.
- Use trailing commas in multi-line constructs (`trailingComma: "all"`).
- Use semicolons.
- Use 2-space indentation.
- These rules are not negotiable per-file — consistency across the entire codebase.

## Linting Rules (ESLint)

- Enable `no-unused-vars` (with `argsIgnorePattern: "^_"` for intentionally unused parameters).
- Enable `@typescript-eslint/no-explicit-any` as a warning to progressively eliminate `any`.
- Enable `@typescript-eslint/no-floating-promises` to catch unhandled async calls.
- Enable `no-console` as a warning — use a proper logger in production code.
- Enable `prefer-const` — use `const` by default, `let` only when reassignment is needed.

## Pre-commit and CI

- Run `eslint --fix` and `prettier --write` on staged files via a pre-commit hook (lint-staged + husky).
- CI must run `eslint` and `prettier --check` — fail the build on any violations.
- Auto-fix must not introduce behavior changes — review auto-fixed diffs in PRs.

## Editor Integration

- Ensure VS Code settings include `"editor.formatOnSave": true` with Prettier as the default formatter.
- Enable `"editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }` for automatic ESLint fixes on save.
- Commit the `.vscode/settings.json` with shared editor settings to ensure team consistency.

## Ignoring Files

- Use `eslint.config.mjs` ignores (not `.eslintignore`) to exclude generated files, build output, and vendored code.
- Never disable a lint rule project-wide to fix a single violation. Use inline `eslint-disable` with a justification comment.
