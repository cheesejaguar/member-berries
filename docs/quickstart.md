# Quick Start

This repository can now be used in two ways:

1. as a **manual memory scaffold**
2. as an **MVP Pi extension scaffold**

The manual path is the safest way to start. The extension path is useful if you want a first working implementation to build on.

## Option A: Manual-first setup

### 1. Choose a project

Pick a repo where you want better continuity across Pi sessions.

Example:

```text
~/code/my-app/
```

### 2. Create the `.pi/` memory layout

Inside your project, create:

```text
.pi/
  PROJECT.md
  memory/
    current.md
    decisions.md
    gotchas.md
    commands.md
    checkpoints/
```

### 3. Copy the templates

Copy from this repo:

- `templates/PROJECT.md` -> `.pi/PROJECT.md`
- `templates/current.md` -> `.pi/memory/current.md`
- `templates/decisions.md` -> `.pi/memory/decisions.md`
- `templates/gotchas.md` -> `.pi/memory/gotchas.md`
- `templates/commands.md` -> `.pi/memory/commands.md`
- optionally use `templates/checkpoint.md` for `.pi/memory/checkpoints/*.md`

### 4. Fill in the two highest-value files first

Start with:
- `.pi/PROJECT.md`
- `.pi/memory/current.md`

These create the biggest immediate continuity improvement.

### 5. Add durable memory conservatively

Only add to:
- `decisions.md` when a decision is explicit and future-relevant
- `gotchas.md` when a problem is costly or likely to recur
- `commands.md` when a command is verified and canonical

### 6. Create checkpoints before context loss

Before stopping or switching focus, add a checkpoint file in:

```text
.pi/memory/checkpoints/
```

Include:
- objective
- completed work
- current state
- next steps
- touched areas
- notable errors or discoveries

## Option B: Extension MVP path

The extension in `extension/` is now more than a placeholder, but still an MVP.

### What it currently supports
- bootstrapping `.pi/` memory
- memory status
- memory search
- injected-memory preview
- manual checkpoint sync
- checkpoint pruning / duplicate cleanup
- safer durable-memory promotion commands/tools
- LLM memory search tool
- prompt-start contextual memory injection
- checkpoint creation on pre-compact and shutdown lifecycle events

### Install into Pi from a local path

Because the repo now has a Pi package manifest in `package.json`, you can install it directly:

```bash
pi install /Users/aaron/Documents/member-berries
```

### Recommended development flow

If you are working on the extension itself:

```bash
npm test
```

That runs the pure helper tests in `tests/memory-core.test.mjs`.

## Sample reference

Use:
- [`examples/sample-project/README.md`](../examples/sample-project/README.md)

The sample project shows:
- realistic file tone
- what belongs in each file
- how durable memory differs from current state

## Current limitations

Still not implemented:
- compaction/shutdown checkpoint hooks
- auto-promotion into durable memory files
- pruning and dedupe commands
- production-grade ranking

So the best current stance is:
- trust the file model fully
- treat the extension as an MVP to extend carefully
