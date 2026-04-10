# Gotchas

## Workers

### Embedding jobs can appear flaky when retries hide the first failure
- Symptom: Notes eventually become searchable, but with a long and inconsistent delay.
- Cause: The first worker run fails quietly, then a retry succeeds later, making the system look nondeterministic.
- Fix: Inspect the first failed attempt and log retry counts explicitly.
- Prevention: Treat retry count and first-failure cause as first-class debugging data.
- Relevant paths/commands: `src/jobs/embedding-worker.ts`, `pnpm worker:dev`

## Search

### Reindex endpoints can mask queue problems
- Symptom: Manual reindex fixes the issue, but the root cause keeps returning.
- Cause: Reindex endpoints repair derived state without addressing why the original async job path failed.
- Fix: Debug the original note-created flow before trusting manual reindex as a solution.
- Prevention: Use reindex as a recovery tool, not a diagnosis.
- Relevant paths/commands: `src/core/search-index.ts`, `pnpm reindex:note -- --id <note-id>`
