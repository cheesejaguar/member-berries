# Repository Guide

This document explains what each top-level folder in `member-berries` is for.

## `README.md`

The user-facing entry point for the project.

It explains:
- what the project is
- current status
- how to start
- where to find deeper docs and examples

## `docs/`

Onboarding and explanatory documentation.

Current contents:
- `quickstart.md` — how to use the repo now
- `how-it-works.md` — the memory model and extension behavior
- `repository-guide.md` — this file
- `images/` — small visuals used by the README

## `specs/`

Design and planning documents.

Current contents include:
- the canonical design spec
- the onboarding/docs implementation plan
- the MVP implementation plan

Use `specs/` when you want:
- rationale
- architecture decisions
- implementation direction

## `templates/`

Reusable memory file templates.

These are meant to be copied into a real project's `.pi/` directory.

The goal is to give users a strong default shape without forcing a complicated install step.

## `examples/`

Concrete examples.

Current contents:
- `sample-project/` — a fictional project with a realistic `.pi/` memory layout

Use this when you want to see:
- how the files should look in practice
- what level of detail is appropriate
- how durable memory differs from current state

## `extension/`

The Pi extension MVP.

Current contents:
- `index.ts` — extension entry point
- `memory-core.mjs` — pure helper functions
- `README.md` — extension-specific documentation

Current MVP responsibilities:
- contextual memory injection
- memory search
- memory bootstrap/status/prime/sync commands
- manual checkpoint creation

## `tests/`

Tests for the pure helper layer.

Current contents:
- `memory-core.test.mjs`

These tests are intentionally aimed at the logic that is easiest to keep deterministic:
- markdown parsing
- search behavior
- scaffold creation
- injected-memory assembly

## `package.json`

A small Node entry point for local testing.

Current script:
- `npm test`

## Current maturity level

This repo is now strongest as:
- a design repo
- an onboarding repo
- a template repo
- an MVP extension repo

It is still not a fully polished Pi package, but it is now a usable foundation rather than a spec-only repository.
