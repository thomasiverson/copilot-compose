---
id: python-typing
name: Python Type Annotations
description: Enforces comprehensive type annotations, mypy compatibility, and modern Python typing idioms (3.10+).
tags: [python, language, typing, type-safety]
version: "1.0.0"
author: thomasiverson
requires: []
conflicts: []
scope: global
---

# Python Type Annotations

## General Rules

- Add type annotations to all function signatures (parameters and return types).
- Use `mypy --strict` or equivalent in CI. Treat type errors as build failures.
- Prefer built-in generics (`list[str]`, `dict[str, int]`) over `typing.List`, `typing.Dict` (Python 3.10+).
- Use `X | Y` union syntax instead of `Union[X, Y]` (Python 3.10+).

## Function Signatures

- Always annotate return types, including `-> None` for functions that return nothing.
- Use `*args: str` and `**kwargs: int` for variadic parameters instead of leaving them untyped.
- Prefer `Sequence[T]` or `Iterable[T]` over `list[T]` in function parameters to accept broader input types.

## Data Classes and Models

- Use `@dataclass` or Pydantic `BaseModel` for structured data — avoid raw dictionaries for domain objects.
- Use `frozen=True` on dataclasses for immutable value objects.
- Annotate all fields; never rely on implicit `Any`.

## Optional and None Handling

- Use `X | None` instead of `Optional[X]` for clarity.
- Perform explicit `None` checks or use walrus operator (`:=`) for safe narrowing.
- Avoid mutable default arguments (`def foo(items: list[str] = [])`) — use `None` with a factory pattern.

## Protocol and Abstract Classes

- Use `typing.Protocol` for structural subtyping (duck typing with type safety).
- Use `abc.ABC` and `@abstractmethod` when you need nominal subtyping with enforced implementation.
- Prefer `Protocol` in library code; prefer `ABC` in application-level domain models.

## Type Aliases and NewType

- Define type aliases for complex types: `UserId = NewType("UserId", int)`.
- Use `TypeAlias` annotation for explicit alias declarations: `JsonDict: TypeAlias = dict[str, Any]`.
- Prefer `NewType` over raw aliases when you want type-safe distinct types (e.g., `UserId` vs `OrderId`).

## Imports

- Import types from `typing` only when not available as builtins.
- Use `from __future__ import annotations` in files that must support Python 3.9 for deferred evaluation.
