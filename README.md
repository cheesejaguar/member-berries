<div align="center">

# member-berries

**Local-first project memory for Pi**

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node tests](https://img.shields.io/badge/tests-node--test-blue.svg)](package.json)
[![Pi extension](https://img.shields.io/badge/pi-extension%20mvp-8A2BE2.svg)](extension/README.md)
[![Status](https://img.shields.io/badge/status-v1.0.0-brightgreen.svg)](docs/quickstart.md)

Small, inspectable, repo-local memory for Pi:

**project identity + current state + durable decisions + gotchas + commands + checkpoints**

<img src="docs/images/member-berries-memory-map.svg" alt="member-berries memory flow" width="860" />

</div>

---

## What this is

`member-berries` is a practical memory system for Pi that helps a repository keep its:
- identity
- active work state
- durable decisions
- repeat gotchas
- trusted commands
- recent checkpoints

The goal is not “magic long-term memory.”

The goal is:
- **local-first** memory
- **human-readable** memory
- **small injected context**
- **targeted retrieval**
- **checkpointing before context loss**

## Current status

This repository is now in a usable **v1.0.0 foundation release** state.

What exists today:
- a full design spec
- onboarding docs
- reusable template files
- a concrete sample project
- a tested memory helper core
- a first-pass Pi extension MVP

What works now:
- bootstrap a `.pi/` memory structure
- inspect memory status
- search local memory
- preview injected memory
- create manual checkpoints
- prune duplicate/old checkpoints
- promote verified memory through a guided interactive flow
- use `memory_search` and `memory_promote` tools
- inject a compact memory block at prompt start
- write lifecycle checkpoints on pre-compact and shutdown

What is **not** fully mature yet:
- advanced approval/review flows around durable promotions
- richer pruning beyond checkpoint cleanup
- more polished extension UI
- broader real-world eval coverage across many repositories

## Why this exists

Most agent memory systems fail in one of two ways:

1. **No memory** — every session starts from scratch.
2. **Too much memory** — giant opaque context dumps flood the model.

`member-berries` tries to keep the middle:
- store broadly
- inject narrowly
- retrieve on demand
- keep durable truth separate from transient state

## Memory model

Each project gets a local `.pi/` memory layout like this:

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

Each file has one job:
- `PROJECT.md` — stable project identity
- `current.md` — live working memory
- `decisions.md` — durable rationale
- `gotchas.md` — recurring traps and fixes
- `commands.md` — trusted repo operations
- `checkpoints/` — short time-indexed work snapshots

## Start here

- [Quick start](docs/quickstart.md)
- [How it works](docs/how-it-works.md)
- [Demo workflow](docs/demo-workflow.md)
- [Releasing](docs/releasing.md)
- [Repository guide](docs/repository-guide.md)
- [Canonical design spec](specs/2026-04-10-pi-project-memory-design.md)
- [Sample project](examples/sample-project/README.md)
- [Extension details](extension/README.md)

## Quick start

### Manual-only workflow

If you just want the memory model today:
1. copy the files from `templates/` into a repo-local `.pi/` directory
2. fill in `PROJECT.md` and `memory/current.md`
3. use the example project as your style guide

### Extension MVP workflow

If you want the MVP extension path:
1. install the package in Pi
2. bootstrap `.pi/` memory
3. use the commands:
   - `/memory-bootstrap`
   - `/memory-status`
   - `/memory-search <query>`
   - `/memory-prime [prompt]`
   - `/memory-sync`

Example local install:

```bash
pi install /Users/aaron/Documents/member-berries
```

Example GitHub install:

```bash
pi install git:github.com/cheesejaguar/member-berries
```

## What to copy into a real project today

These files are the easiest starting point:
- `templates/PROJECT.md`
- `templates/current.md`
- `templates/decisions.md`
- `templates/gotchas.md`
- `templates/commands.md`
- `templates/checkpoint.md`

Suggested destination:

```text
your-project/
  .pi/
    PROJECT.md
    memory/
      current.md
      decisions.md
      gotchas.md
      commands.md
      checkpoints/
```

## Example repository shape

```text
member-berries/
  docs/
    images/
    quickstart.md
    how-it-works.md
    repository-guide.md
  examples/
    sample-project/
      .pi/
        PROJECT.md
        memory/
          current.md
          decisions.md
          gotchas.md
          commands.md
          checkpoints/
  extension/
    index.ts
    memory-core.mjs
    README.md
  specs/
  templates/
  tests/
  package.json
```

## Example workflow

A practical daily loop looks like this:

1. keep `.pi/PROJECT.md` accurate
2. keep `.pi/memory/current.md` current
3. record only important durable decisions
4. add gotchas only when they are costly or likely to recur
5. add a checkpoint before stopping or switching context
6. let memory search pull deeper context only when needed

## Demo / GIF workflow

If you want to show the tool in a short demo, use this sequence:

1. install the package with `pi install /Users/aaron/Documents/member-berries`
2. open Pi in a test repo
3. run `/memory-bootstrap`
4. show the generated `.pi/` files
5. run `/memory-status`
6. run `/memory-search flaky search`
7. run `/memory-sync`
8. ask a normal repo question and show the injected-memory behavior

A longer written version lives in [docs/demo-workflow.md](docs/demo-workflow.md).

## Safety and privacy

This project is designed to be **local-first**.

Current repo guarantees:
- no cloud memory service
- no vector DB dependency in the MVP
- no hidden background sync
- human-readable memory files

Before commits, the repo should be checked for:
- tokens
- API keys
- `.env` files
- machine-local artifacts

## Repository structure

- `docs/` — onboarding and conceptual documentation
- `examples/` — realistic reference setup
- `extension/` — Pi extension MVP and tested helper core
- `specs/` — design and implementation plans
- `templates/` — reusable `.pi/` memory templates
- `tests/` — Node tests for pure memory helpers

## Roadmap

Near-term priorities:
1. expand pruning beyond checkpoint cleanup
2. add stronger approval/review flows around durable promotions
3. polish extension UX and package ergonomics
4. add broader eval coverage across many repositories
5. grow this into a more complete Pi package

## License

MIT
