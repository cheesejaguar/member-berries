# Decisions

## 2026-03-28 — Keep PostgreSQL as the source of truth for note search

### Status
Accepted

### Context
The team considered moving semantic search metadata entirely into an external vector store as the primary record for retrieval.

### Decision
PostgreSQL remains canonical for notes and searchable metadata. Search indexes and embeddings are derived artifacts rebuilt from canonical note data.

### Why
This keeps recovery simpler, reduces split-brain risk, and avoids making search infrastructure responsible for business truth.

### Rejected Alternatives
- External vector store as primary record — too much operational coupling
- Dual-write source of truth — higher drift risk

### Implications
All indexing code must be safe to replay from canonical note records.

## 2026-04-02 — Route handlers must not perform direct SQL

### Status
Accepted

### Context
A few handlers started adding one-off SQL queries directly in request code, making validation, business logic, and persistence harder to reason about.

### Decision
Route handlers only orchestrate request validation and response mapping. Data access belongs in `src/db/` and business rules belong in `src/core/`.

### Why
This keeps request code small and makes it easier to test domain logic separately.

### Rejected Alternatives
- Allow simple direct SQL in handlers — easier short term, degrades architecture over time

### Implications
Refactors should move mixed handler/business/database logic toward the established boundaries.
