---
id: csharp-conventions
name: "C# Coding Conventions"
description: Modern C# conventions following .NET 8+ idioms including nullable reference types, pattern matching, and minimal ceremony.
tags: [csharp, dotnet, language, conventions]
version: "1.0.0"
author: thomasiverson
requires: []
conflicts: []
scope: global
---

# C# Coding Conventions

## Nullable Reference Types

- Enable `<Nullable>enable</Nullable>` in all projects. Treat nullable warnings as errors.
- Use `string?` to explicitly indicate a value can be null. Never suppress nullable warnings with `!` without a comment explaining why.
- Prefer null-conditional (`?.`) and null-coalescing (`??`) operators over explicit null checks where readability allows.

## Modern C# Idioms

- Use file-scoped namespaces (`namespace Foo;`) to reduce indentation.
- Prefer `record` types for immutable data transfer objects.
- Use primary constructors (C# 12) for simple dependency injection in classes.
- Prefer pattern matching (`is`, `switch` expressions) over type-casting with `as`/`is` + cast.
- Use collection expressions (`[1, 2, 3]`) when targeting .NET 8+.

## Naming Conventions

- `PascalCase` for all public members, types, namespaces, and methods.
- `camelCase` for local variables and parameters.
- Prefix private fields with `_` (e.g., `_logger`).
- Use descriptive names; avoid abbreviations except universally understood ones (`id`, `url`, `dto`).

## Async Patterns

- Suffix all async methods with `Async` (e.g., `GetUserAsync`).
- Always pass `CancellationToken` through async call chains. Accept it as the last parameter.
- Never use `.Result` or `.Wait()` on tasks — always `await`.
- Prefer `ValueTask<T>` over `Task<T>` for hot-path methods that often complete synchronously.

## Dependency Injection

- Register services using the built-in DI container. Avoid service locator patterns.
- Prefer constructor injection. Use `required` properties for optional dependencies.
- Define service interfaces in a separate abstractions project or folder to avoid circular dependencies.

## Error Handling

- Use exceptions for unexpected failures; use `Result<T>` or similar patterns for expected domain failures.
- Catch specific exception types, never bare `catch (Exception)` except at the top-level handler.
- Log exceptions with structured logging (`ILogger<T>`) before rethrowing.
