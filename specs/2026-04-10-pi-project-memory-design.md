# Pi Project Memory System Design

- Date: 2026-04-10
- Status: Draft for review
- Scope: Global template for project-scoped memory in Pi
- User choices:
  - Approach: Global template first
  - Memory model: Hybrid
  - Durable memory scope: Full working memory
  - Maintenance mode: Checkpointed
  - Injection mode: Contextual inject
  - Checkpoint mode: Balanced
  - Storage mode: Local-only

## 1. Goal

Design a state-of-the-art, practical project memory system for Pi that improves continuity across sessions without relying on opaque, over-automated long-term memory. The system should preserve project identity, active work state, decisions, gotchas, commands, and recent checkpoints while keeping all memory human-readable, inspectable, and local to each repository.

## 2. Design Principles

1. Store more, summarize less.
2. Retrieve selectively instead of loading everything every turn.
3. Separate durable truth from transient work state.
4. Checkpoint before context loss.
5. Keep memory human-readable and easy to edit.
6. Avoid speculative durable writes.
7. Prefer simple, legible heuristics over clever opaque ranking.

## 3. Architecture Overview

The system has two parts:

### 3.1 File-based source of truth

Each repo gets a local-only `.pi/` memory structure:

```text
.pi/
  settings.json
  PROJECT.md
  memory/
    current.md
    decisions.md
    gotchas.md
    commands.md
    checkpoints/
      2026-04-10T12-30-00.md
      2026-04-11T09-15-00.md
```

### 3.2 Lightweight Pi extension

A single Pi extension performs:
- contextual memory injection on each prompt
- checkpoint writing on key lifecycle events
- local memory search
- basic memory hygiene and dedupe

This extension is intentionally lightweight. It does not start with vector DB indexing, autonomous knowledge graphs, or aggressive silent rewriting.

## 4. Memory Files and Responsibilities

### 4.1 `.pi/PROJECT.md`

Stable project identity.

Contains:
- mission
- users/consumers
- architecture
- invariants
- conventions
- key paths
- non-goals

Rules:
- concise
- stable
- no transient task chatter
- do not auto-rewrite casually

### 4.2 `.pi/memory/current.md`

Live working memory.

Contains:
- current objective
- active plan
- current focus areas
- open questions
- known risks
- next best actions
- recently touched files
- last updated timestamp

Rules:
- rewritten freely
- optimized for actionability
- may be refreshed automatically

### 4.3 `.pi/memory/decisions.md`

Durable decisions and rationale.

Contains one decision per section:
- date/title
- status
- context
- decision
- rationale
- rejected alternatives
- implications

Rules:
- append only when decision is real and future-relevant
- include why, not just what
- avoid speculative entries

### 4.4 `.pi/memory/gotchas.md`

Recurring traps and expensive lessons.

Contains entries with:
- symptom
- cause
- fix
- prevention
- relevant paths/commands

Rules:
- only repeated or costly issues
- operational, not philosophical

### 4.5 `.pi/memory/commands.md`

Trusted repo operations.

Contains canonical commands for:
- setup
- dev
- test
- lint/typecheck
- build
- debug/inspection
- notes/prerequisites

Rules:
- only verified commands
- prefer canonical forms over every variant

### 4.6 `.pi/memory/checkpoints/*.md`

Timestamped retrievable snapshots.

Contains:
- time
- trigger
- objective
- completed work
- current state
- important findings
- open questions
- next steps
- touched areas
- commands run
- notable errors/surprises

Rules:
- short
- factual
- retrieval-friendly
- append-only

## 5. Injection Model

The extension uses contextual inject.

### 5.1 Always inject
- `.pi/PROJECT.md`
- `.pi/memory/current.md`

### 5.2 Conditionally inject
Selected snippets from:
- `decisions.md`
- `gotchas.md`
- `commands.md`
- recent checkpoints

### 5.3 Selection signals
- prompt keyword overlap
- cwd/path overlap
- recently touched files
- intent class (decision/debugging/commands/current execution)
- modest recency boost for checkpoints

### 5.4 Intent mapping
- prompts about tests/build/dev/setup -> prefer `commands.md`
- prompts about why/decision/architecture/refactor/migrate -> prefer `decisions.md`
- prompts about bugs/errors/failures/not working -> prefer `gotchas.md`
- recent active work in `current.md` is always relevant

### 5.5 Injection budget
Cap conditional snippets to a few high-value excerpts, e.g.
- up to 2 decision snippets
- up to 2 gotcha snippets
- up to 1 command snippet
- up to 1 checkpoint snippet

Goal:
- store broadly
- inject narrowly
- retrieve on demand

## 6. Retrieval Heuristics

Ranking is simple and additive.

### 6.1 Priority tiers
1. always-on context: `PROJECT.md`, `current.md`
2. strong relevance: matching decisions
3. issue-resolution context: matching gotchas
4. operational context: matching commands
5. recency context: 1-3 relevant checkpoints

### 6.2 Scoring signals
- exact keyword overlap
- heading/title overlap
- subsystem/path overlap
- prompt intent class
- recency (modest)
- section quality (short, specific sections rank higher)

### 6.3 Retrieval outputs
The extension should inject excerpts with enough structure to remain inspectable:
- file path
- section title
- short excerpt or bullets

## 7. Checkpointing Policy

Balanced checkpointing means writing memory only at a few high-value moments.

### 7.1 Automatic triggers
1. `session_before_compact`
2. `session_shutdown`
3. explicit planning/review milestones and memory commands

### 7.2 Update behavior by file

Safe to rewrite automatically:
- `current.md`
- new checkpoint files

Safe to update conservatively:
- `decisions.md`
- `gotchas.md`
- `commands.md`

Never auto-rewrite casually:
- `PROJECT.md`

### 7.3 Durable-write thresholds

Promote to `decisions.md` only if:
- decision is explicit or strongly evidenced
- rationale is known
- choice affects future work
- not merely tentative exploration

Promote to `gotchas.md` only if:
- issue caused meaningful friction
- fix is known
- likely to recur

Promote to `commands.md` only if:
- command is verified or canonical
- prerequisites are known
- not a one-off experiment

### 7.4 Uncertainty rule
If uncertain, write only to a checkpoint. Do not promote uncertain facts into durable memory.

## 8. Extension Feature Set

A single Pi extension provides memory routing and checkpointing.

### 8.1 Core responsibilities
- contextual injection in `before_agent_start`
- checkpoint writing on compaction/shutdown/manual sync
- memory search across project memory
- memory hygiene and dedupe

### 8.2 Slash commands
- `/memory-status` — show memory files, counts, last checkpoint, current objective
- `/memory-sync` — force checkpoint + refresh `current.md`
- `/memory-search <query>` — search local project memory
- `/memory-prime` — preview what would be injected
- `/memory-prune` — cleanup stale/duplicate memory
- `/memory-bootstrap` — create the default `.pi/` memory structure in a repo

### 8.3 Tool surface
Keep the LLM tool surface small.

Recommended initial tool:
- `memory_search(query, scope?)`

Optional later tool:
- `memory_checkpoint(trigger, notes?)`

Not recommended initially:
- unrestricted `memory_update`
- large autonomous write surface

## 9. Anti-Noise and Anti-Hallucination Rules

### 9.1 Anti-noise
- dedupe similar checkpoint content
- collapse repeated command variants
- avoid storing generic advice
- avoid storing facts already obvious in code unless rationale matters
- prefer repo-specific lessons over abstract best practices

### 9.2 Anti-hallucination
Do not write durable memory when:
- conclusion is uncertain
- alternatives remain unresolved
- no successful verification happened
- content is speculative rather than evidenced

## 10. Rollout Plan

### Phase 1 — File scaffold + manual workflow
Create local `.pi/` memory files and templates.

Success criteria:
- every repo has a consistent memory shape
- memory is inspectable and editable
- no extension complexity yet

### Phase 2 — Lightweight Pi extension
Implement:
- contextual injection
- checkpointing on compaction/shutdown/manual sync
- slash commands for status/search/bootstrap/prime/sync

Success criteria:
- Pi remembers project identity and active work
- compaction no longer feels like amnesia
- memory behavior is transparent

### Phase 3 — Better retrieval + hygiene
Implement:
- heading-aware extraction
- better path overlap scoring
- duplicate suppression
- checkpoint pruning
- stale `current.md` detection
- optional light session-summary search

Success criteria:
- more relevant injected context
- memory remains clean over long periods

### Phase 4 — Optional advanced features
Only if earlier phases prove valuable:
- richer session-summary search
- memory promotion workflows
- optional review UI for durable writes

Not recommended initially:
- vector DB
- autonomous fact graph
- heavy background indexing

## 11. Recommended Build Order

### Deliverable A — Global template package
Provide:
- memory file templates
- bootstrap command
- recommended settings
- optional prompts for maintenance

### Deliverable B — First extension version
Provide:
- compact memory injection
- checkpoints before compaction and on shutdown
- explicit memory commands

## 12. Why This Design

This design imports the strongest practical ideas from modern agent-memory systems without overfitting to hype:
- preserve raw history elsewhere
- keep a small active memory
- retrieve selectively
- checkpoint before loss
- separate durable truth from transient work
- keep memory inspectable and editable by humans

It is state-of-the-art in practice because it favors robustness, transparency, and relevance over opaque always-on memory magic.

## 13. Implementation Recommendation

Build:
1. a reusable global project-memory template
2. a lightweight Pi extension
3. contextual injection
4. balanced checkpointing
5. local-only memory files

This is the recommended foundation before considering any heavier retrieval infrastructure.
