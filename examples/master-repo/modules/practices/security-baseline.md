---
id: security-baseline
name: Security Baseline
description: Foundational security practices for application code — input validation, secrets management, dependency hygiene, and secure defaults.
tags: [security, practices, cross-language, baseline]
version: "1.0.0"
author: thomasiverson
requires: []
conflicts: []
scope: global
---

# Security Baseline

## Input Validation

- Validate and sanitize all external input at the boundary (API endpoints, CLI arguments, file uploads).
- Use allowlists over denylists. Define what's valid, reject everything else.
- Never trust client-side validation — always re-validate on the server.
- Parameterize all database queries. Never interpolate user input into SQL, even in "safe" contexts.
- Validate file uploads: check MIME type, file extension, and size. Store with generated names, not user-provided filenames.

## Secrets Management

- Never commit secrets (API keys, passwords, tokens) to source control. Use environment variables or a secrets manager.
- Use `.env.example` with placeholder values, never `.env` with real secrets.
- Rotate secrets on a schedule and immediately after any suspected exposure.
- Use short-lived tokens (JWTs, OAuth tokens) over long-lived API keys where possible.

## Authentication and Authorization

- Hash passwords with bcrypt, scrypt, or Argon2 — never MD5 or SHA alone.
- Implement rate limiting on authentication endpoints to prevent brute force attacks.
- Use the principle of least privilege: grant the minimum permissions needed for each role or service.
- Validate authorization on every request, not just at the UI level. Server-side checks are mandatory.

## Dependency Security

- Run `npm audit`, `pip audit`, or equivalent in CI. Block merges on high/critical vulnerabilities.
- Pin dependency versions in lock files. Review dependency updates before merging.
- Minimize dependency count. Every dependency is an attack surface.
- Enable Dependabot or Renovate for automated dependency update PRs.

## Secure Defaults

- Enable HTTPS everywhere. Redirect HTTP to HTTPS.
- Set security headers: `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`.
- Use `HttpOnly`, `Secure`, and `SameSite` attributes on all cookies.
- Disable directory listing and verbose error messages in production.

## Logging and Monitoring

- Log authentication events (login, logout, failed attempts) with timestamps and source IPs.
- Never log secrets, tokens, passwords, or PII in plain text.
- Set up alerts for anomalous patterns: repeated auth failures, unusual API usage spikes.
- Retain security logs for at least 90 days for incident investigation.

## Code Review Security Checklist

- Check for hardcoded credentials or secrets in every PR.
- Verify input validation on new endpoints or data ingestion paths.
- Confirm authorization checks on new or modified protected routes.
- Review new dependencies for known vulnerabilities and maintenance status.
