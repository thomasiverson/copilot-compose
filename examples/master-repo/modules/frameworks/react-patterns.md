---
id: react-patterns
name: React Patterns & Best Practices
description: Component design patterns, hooks conventions, and state management guidelines for React 18+ applications.
tags: [react, frontend, framework, typescript]
version: "1.0.0"
author: thomasiverson
requires: [typescript-strict]
conflicts: []
scope: global
---

# React Patterns & Best Practices

## Component Design

- Use function components exclusively. Never create new class components.
- Prefer small, focused components (under 150 lines). Extract subcomponents when complexity grows.
- Co-locate component, styles, types, and tests in the same directory.
- Export components as named exports, not default exports.

## Props and Types

- Define props as an `interface` named `{ComponentName}Props`.
- Destructure props in the function signature: `function Button({ label, onClick }: ButtonProps)`.
- Use `children: React.ReactNode` for components that accept children, not `React.FC`.
- Avoid prop spreading (`{...props}`) except in generic wrapper components.

## Hooks

- Follow the Rules of Hooks: only call at the top level, only call from function components or custom hooks.
- Extract reusable logic into custom hooks prefixed with `use` (e.g., `useDebounce`, `useFetch`).
- Memoize expensive computations with `useMemo` and callback references with `useCallback`, but only when profiling shows a need — don't optimize prematurely.
- Always provide a cleanup function in `useEffect` when subscribing to external resources.

## State Management

- Use `useState` for local UI state, `useReducer` for complex state transitions.
- Lift state to the nearest common ancestor; avoid prop drilling by using composition or context.
- Use React Context sparingly — it causes re-renders of all consumers. Prefer composition patterns or state libraries (Zustand, Jotai) for global state.
- Keep server state in a dedicated cache (TanStack Query / SWR) — don't duplicate API data in local state.

## Rendering and Performance

- Use `React.memo` only on components that re-render frequently with the same props.
- Avoid inline object/array literals in JSX props — they create new references every render.
- Use the `key` prop correctly: stable, unique identifiers from data, never array indices for dynamic lists.
- Prefer `Suspense` boundaries with lazy-loaded components for code splitting.

## Event Handling

- Name event handler props with `on` prefix: `onClick`, `onSubmit`.
- Name handler functions with `handle` prefix: `handleClick`, `handleSubmit`.
- Always type event parameters: `(e: React.MouseEvent<HTMLButtonElement>) => void`.

## Error Boundaries

- Wrap route-level and feature-level components in Error Boundaries.
- Provide meaningful fallback UI, not just "Something went wrong."
- Log errors from error boundaries to your monitoring service.
