# Project

## Mission
Acme Notes API is a workspace-based note platform for internal teams. It stores notes, exposes search-friendly APIs, and runs background embedding jobs so notes can be retrieved semantically in the admin experience.

## Users / Consumers
- Internal support staff use the admin UI to inspect and search notes.
- Product teams use the API for note creation and retrieval.
- Background workers consume queued jobs for embedding generation.

## Architecture
- `src/api/` — HTTP route handlers and request validation
- `src/core/` — note, workspace, and search business logic
- `src/db/` — data access and query helpers
- `src/jobs/` — async workers for embedding and reindex jobs
- PostgreSQL is the source of truth
- Redis is used for job queueing and transient worker coordination

## Invariants
- Notes always belong to exactly one workspace.
- Search indexes are derived data; PostgreSQL is canonical.
- API handlers should not perform direct SQL; they go through `src/db/`.
- Worker jobs must be idempotent.

## Conventions
- Business rules live in `src/core/`, not route handlers.
- Validation happens at the API boundary.
- Prefer small focused modules over giant service files.
- Changes to search behavior require test coverage and command verification.

## Key Paths
- `src/api/` — request/response layer
- `src/core/` — domain logic
- `src/db/` — database access
- `src/jobs/` — background processing
- `scripts/` — operational scripts

## Non-Goals
- This service is not the system of record for user identity.
- This repo does not own billing or external customer analytics.
