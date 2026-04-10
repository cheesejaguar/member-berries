# Extension

This folder now contains a **first-pass MVP** of the Pi extension for `member-berries`.

## What is implemented

### Commands
- `/memory-bootstrap` — create the default local `.pi/` memory structure
- `/memory-status` — show current objective, counts, and checkpoint info
- `/memory-search <query>` — search local memory files
- `/memory-prime [prompt]` — preview the memory block that would be injected
- `/memory-sync` — create a manual checkpoint and refresh `current.md` timestamp

### Tool
- `memory_search` — LLM-callable project memory search

### Automatic behavior
- on prompt start, the extension attempts to inject:
  - `.pi/PROJECT.md`
  - `.pi/memory/current.md`
  - relevant snippets from decisions, gotchas, commands, and recent checkpoints
- on `session_before_compact`, the extension writes a checkpoint if local memory exists
- on `session_shutdown`, the extension writes a checkpoint if local memory exists

## What is not implemented yet

- production-grade ranking
- durable promotion into `decisions.md`, `gotchas.md`, or `commands.md`
- pruning and dedupe commands
- rich custom UI or review flows
- more polished package/install ergonomics beyond the basic Pi manifest

## File layout

- `index.ts` — Pi extension entry point
- `memory-core.mjs` — pure helper functions used by the extension and tested with Node

## Installation

Because the repo now includes a Pi manifest in `package.json`, Pi can install it from the repository root:

```bash
pi install /Users/aaron/Documents/member-berries
```

## Testing

Run:

```bash
npm test
```

Current tests cover:
- markdown section extraction
- bootstrap scaffolding
- search ranking
- injected-memory assembly
- checkpoint creation
- current-state timestamp refresh
