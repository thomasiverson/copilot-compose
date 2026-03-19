---
id: dotnet-minimal-api
name: ".NET Minimal API Patterns"
description: Conventions for building .NET 8+ minimal APIs including endpoint organization, validation, and middleware patterns.
tags: [dotnet, csharp, api, backend, minimal-api]
version: "1.0.0"
author: thomasiverson
requires: [csharp-conventions]
conflicts: []
scope: global
---

# .NET Minimal API Patterns

## Endpoint Organization

- Group related endpoints using `MapGroup()` with a shared prefix (e.g., `/api/users`).
- Define endpoint handlers as static methods in dedicated classes (e.g., `UserEndpoints.cs`), not inline lambdas in `Program.cs`.
- Use extension methods to register endpoint groups: `app.MapUserEndpoints()`.
- Keep `Program.cs` focused on service registration and middleware pipeline — no business logic.

## Request and Response

- Use `record` types for request and response DTOs.
- Return `TypedResults` (e.g., `Results.Ok(value)`, `Results.NotFound()`) for OpenAPI-compatible responses.
- Use `[AsParameters]` attribute to bind complex parameter objects from route, query, and body.
- Always return appropriate HTTP status codes: 200 for success, 201 for creation, 204 for no content, 400 for validation errors, 404 for not found.

## Validation

- Use FluentValidation or `MiniValidation` for request validation — don't validate manually in handlers.
- Register validators in DI and apply via endpoint filters or middleware.
- Return `ValidationProblem()` (RFC 7807) for validation failures with field-level error details.

## Authentication and Authorization

- Use `RequireAuthorization()` on endpoint groups, not individual endpoints, when all routes need auth.
- Define named policies for role-based and claim-based authorization.
- Use `[Authorize(Policy = "...")]` attributes or `.RequireAuthorization("PolicyName")` fluent calls.

## Middleware Pipeline

- Order middleware correctly: Exception handling → CORS → Authentication → Authorization → Endpoints.
- Use `app.UseExceptionHandler()` with a custom `ProblemDetails` handler for consistent error responses.
- Apply rate limiting per endpoint group using `RateLimiter` middleware.

## Database Access

- Use Entity Framework Core with `DbContext` registered as scoped.
- Prefer `AsNoTracking()` for read-only queries.
- Use `IDbContextFactory<T>` in background services instead of injecting `DbContext` directly.
- Run migrations via a separate CLI tool or startup filter, not inline in `Program.cs`.

## Testing

- Use `WebApplicationFactory<Program>` for integration tests.
- Override services in test setup using `ConfigureTestServices`.
- Test endpoint behavior (status codes, response shapes), not implementation details.
