---
id: testing-principles
name: Testing Principles
description: Core testing philosophy and patterns applicable across all languages — test design, naming, structure, and coverage strategy.
tags: [testing, practices, quality, cross-language]
version: "1.0.0"
author: thomasiverson
requires: []
conflicts: []
scope: global
---

# Testing Principles

## Test Design Philosophy

- Write tests that describe behavior, not implementation. Tests should survive refactors.
- Follow the Arrange-Act-Assert (AAA) pattern in every test. Separate each phase with a blank line.
- Each test should verify exactly one behavior. If a test name contains "and", it's testing too much.
- Prefer testing public APIs and observable behavior over private methods and internal state.

## Naming Conventions

- Name tests descriptively: `should_return_404_when_user_not_found` or `returnsEmptyList_whenNoItemsExist`.
- Use a consistent naming pattern across the project. The format matters less than consistency.
- Group related tests in describe/context blocks (or nested classes) by feature or behavior.

## Test Structure

- Keep tests independent — no test should depend on another test's execution or state.
- Use factory functions or builders for test data, not copy-pasted object literals.
- Clean up side effects in teardown/afterEach hooks. Leave the environment as you found it.
- Avoid conditional logic (`if`, `switch`) in tests — a test with branches is multiple tests.

## Mocking and Stubbing

- Mock external dependencies (APIs, databases, file systems), not internal collaborators.
- Prefer fakes and in-memory implementations over mock libraries when possible.
- Verify interactions (mock calls) only when the interaction itself is the behavior under test.
- Never mock what you don't own — wrap third-party code in an adapter and mock that.

## Coverage Strategy

- Aim for high coverage of business logic and edge cases, not 100% line coverage.
- Every bug fix must include a regression test that reproduces the bug before the fix.
- Critical paths (auth, payments, data mutations) require integration tests, not just unit tests.
- Use mutation testing periodically to validate that tests actually catch regressions.

## Test Performance

- Unit tests should run in milliseconds. If a "unit" test needs I/O, it's an integration test.
- Parallelize test execution where possible. Tests that can't run in parallel indicate shared state problems.
- Use test fixtures and setup caching to avoid redundant expensive operations.

## Continuous Integration

- All tests must pass before merging. No exceptions, no "known failures."
- Run fast tests first (unit), then slower tests (integration, e2e) to fail fast.
- Flaky tests are bugs — fix or quarantine them immediately, never ignore.
