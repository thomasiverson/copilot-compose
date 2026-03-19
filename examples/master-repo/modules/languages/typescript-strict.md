---
id: typescript-strict
name: TypeScript Strict Mode
description: Enforces strict TypeScript conventions including strict null checks, explicit return types, and immutable-first patterns.
tags: [typescript, language, strict, type-safety]
version: "1.0.0"
author: thomasiverson
requires: []
conflicts: []
scope: global
---

# TypeScript Strict Conventions

## Type Safety

- Enable `strict: true` in `tsconfig.json` — never disable individual strict flags.
- Prefer `unknown` over `any`. If `any` is unavoidable, add a `// eslint-disable-next-line` with a justification comment.
- Use explicit return types on all exported functions and methods.
- Prefer `interface` over `type` for object shapes that may be extended.
- Use `readonly` properties and `ReadonlyArray<T>` by default; only use mutable versions when mutation is intentional.

## Null Handling

- Never use non-null assertions (`!`) except in test files. Use narrowing, optional chaining (`?.`), or nullish coalescing (`??`) instead.
- Prefer early returns to reduce nesting when handling nullable values.
- Use discriminated unions over optional properties when a value's presence changes the object's meaning.

## Naming and Structure

- Use `PascalCase` for types, interfaces, enums, and classes.
- Use `camelCase` for variables, functions, and parameters.
- Use `UPPER_SNAKE_CASE` for true constants (compile-time known values).
- Prefix interfaces with a descriptive noun, not `I` (e.g., `UserProfile`, not `IUserProfile`).

## Imports and Modules

- Use named exports, not default exports — they are easier to rename-refactor and auto-import.
- Group imports: external packages first, then internal modules, then relative imports. Separate groups with a blank line.
- Use `import type { ... }` for type-only imports to ensure they are erased at compile time.

## Enums and Unions

- Prefer string literal unions over enums for simple cases: `type Status = "active" | "inactive"`.
- When using enums, use `const enum` only if tree-shaking is critical; otherwise prefer regular `enum` for debuggability.

## Error Handling

- Throw `Error` subclasses, never plain strings or objects.
- Define custom error classes for domain-specific failures (e.g., `NotFoundError`, `ValidationError`).
- Use `Result<T, E>` patterns (or a similar discriminated union) for expected failures instead of exceptions.
