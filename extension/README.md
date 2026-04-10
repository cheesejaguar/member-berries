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

## What is not implemented yet

- production-grade ranking
- durable promotion into `decisions.md`, `gotchas.md`, or `commands.md`
- checkpoint creation on compaction/shutdown hooks
- pruning and dedupe commands
- rich custom UI or review flows

## File layout

- `index.ts` — Pi extension entry point
- `memory-core.mjs` — pure helper functions used by the extension and tested with Node

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
