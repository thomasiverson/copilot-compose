---
id: error-handling
name: Error Handling Patterns
description: Consistent error handling strategies across the stack — error classification, propagation, user-facing messages, and logging.
tags: [errors, practices, cross-language, reliability]
version: "1.0.0"
author: thomasiverson
requires: []
conflicts: []
scope: global
---

# Error Handling Patterns

## Error Classification

- Distinguish between **operational errors** (expected failures: network timeouts, validation errors, not found) and **programmer errors** (bugs: null dereference, type errors, assertion failures).
- Handle operational errors gracefully with recovery logic or user-friendly messages.
- Let programmer errors crash loudly and get surfaced by monitoring — don't silently swallow them.

## Error Propagation

- Propagate errors up the call stack with sufficient context. Add context at each layer without losing the original error.
- Use error wrapping/chaining (`cause` in JS, `InnerException` in C#, `from` in Python) to preserve the full error chain.
- Never catch an error and silently ignore it. At minimum, log it.
- Catch errors at the appropriate boundary: individual operations in service layers, full request lifecycle at the handler/controller level.

## User-Facing Errors

- Never expose stack traces, internal paths, or database details to end users.
- Map internal errors to user-friendly messages with actionable guidance.
- Use structured error responses in APIs (RFC 7807 Problem Details or equivalent):
  ```json
  {
    "type": "https://api.example.com/errors/validation",
    "title": "Validation Failed",
    "status": 400,
    "detail": "The 'email' field must be a valid email address.",
    "instance": "/api/users/signup"
  }
  ```
- Include correlation IDs in error responses so users can reference them in support requests.

## Logging

- Log errors with structured data: error type, message, stack trace, correlation ID, and relevant context.
- Use severity levels correctly: `error` for failures needing attention, `warn` for degraded behavior, `info` for operational events.
- Never log sensitive data (passwords, tokens, PII) in error messages or context.

## Retry and Recovery

- Implement retries with exponential backoff for transient failures (network errors, rate limits, 503s).
- Set maximum retry counts and circuit breakers to prevent retry storms.
- Make operations idempotent so retries are safe — use idempotency keys for state-changing operations.
- Provide fallback behavior where possible (cached data, default values, degraded feature sets).

## Global Error Handlers

- Install a top-level error handler in every application (uncaught exception handler, global middleware, error boundary).
- The global handler should: log the error, return a safe response, and alert monitoring.
- In web servers, return 500 with a generic message, never the raw error.
- In CLI tools, print a human-readable message and exit with a non-zero code.
