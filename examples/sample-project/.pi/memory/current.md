# Current State

## Current Objective
Stabilize semantic search indexing so new notes become searchable within a predictable delay after creation.

## Active Plan
1. Trace the note-created -> queue -> embedding worker -> search-index flow.
2. Confirm whether retry behavior is causing duplicate or missing index updates.
3. Add instrumentation around worker success/failure timing.
4. Tighten the worker contract and update commands/docs if needed.

## Current Focus Areas
- `src/jobs/embedding-worker.ts`
- `src/core/search-index.ts`
- queue retry semantics

## Open Questions
- Are delayed jobs being dropped or just processed much later than expected?
- Is the indexing bug caused by duplicate note-created events or worker idempotency gaps?

## Known Risks
- Search behavior is derived from async jobs, so race conditions can look like API bugs.
- It is easy to patch the symptom in the worker while missing the queue contract issue.

## Next Best Actions
- Reproduce with a single note create and inspect queue/job logs.
- Verify canonical local commands for worker-only runs.
- Capture any confirmed retry/idempotency lesson in `gotchas.md`.

## Recently Touched Files
- `src/jobs/embedding-worker.ts`
- `src/core/search-index.ts`
- `scripts/run-worker.ts`

## Last Updated
2026-04-10T00:00:00Z
