# How It Works

`member-berries` is based on a simple rule:

> keep memory in small, inspectable files and load only what is relevant.

It is designed to avoid two bad extremes:
- no memory at all
- giant opaque context dumps

## The memory layers

### 1. Project identity

File:
- `.pi/PROJECT.md`

Purpose:
- explain what the repo is
- capture architecture, invariants, conventions, and key paths

This is stable context. It should change slowly.

## 2. Working memory

File:
- `.pi/memory/current.md`

Purpose:
- capture what is happening now
- current objective
- active plan
- open questions
- next steps

This is the most frequently updated file.

## 3. Durable rationale

Files:
- `.pi/memory/decisions.md`
- `.pi/memory/gotchas.md`
- `.pi/memory/commands.md`

Purpose:
- preserve things that should survive sessions
- record why choices were made
- capture painful lessons
- preserve trusted operational commands

These files should be updated conservatively.

## 4. Historical snapshots

Directory:
- `.pi/memory/checkpoints/`

Purpose:
- preserve time-indexed summaries of recent work
- retain context before stopping or losing history

Checkpoints are cheap, append-only, and retrieval-friendly.

## Why separate the files?

Because not all memory is the same.

### Stable truth
Belongs in:
- `PROJECT.md`
- `decisions.md`

### Live state
Belongs in:
- `current.md`

### Operational scars
Belongs in:
- `gotchas.md`
- `commands.md`

### Recent history
Belongs in:
- `checkpoints/`

This separation helps Pi load the right information for the right reason.

## Current extension behavior

The MVP extension now supports:
- reading `.pi/PROJECT.md`
- reading `.pi/memory/current.md`
- searching decisions, gotchas, commands, and checkpoints
- assembling a compact injected-memory block for a prompt
- bootstrapping a new local memory structure
- creating a manual checkpoint and refreshing the current-state timestamp

## Retrieval model

The current ranking logic is intentionally simple:
- parse markdown sections
- score heading/body overlap against the query
- boost direct matches
- keep results small and readable

This is not meant to be the final ranking system. It is meant to be understandable, testable, and easy to improve.

## Design rules

The system follows these rules:
- local-first
- human-readable
- contextual retrieval
- conservative durable writes
- checkpoint before loss
- separate durable truth from transient state

## What this avoids

This design intentionally avoids:
- always loading huge memory blobs
- silently rewriting structural truth
- promoting uncertain ideas into durable memory
- relying on hidden long-term memory magic

## What is still missing

The full intended system still needs:
- checkpoint hooks on compaction/shutdown
- safer durable-memory promotion
- pruning and dedupe
- better ranking and path-aware retrieval
- more polished extension UX

## What the repo gives you today

Today, this repository gives you:
- a disciplined memory model
- copyable templates
- a realistic example project
- a tested helper core
- a working Pi extension MVP to build on
