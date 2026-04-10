# Onboarding Docs and Example Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `member-berries` understandable and usable by adding a user-facing README, a `docs/` folder, and a concrete sample project under `examples/`.

**Architecture:** Keep this phase documentation-first and honest. Do not claim the Pi extension exists yet. Present the repo as a design + onboarding scaffold with a manual example of the `.pi/` memory layout.

**Tech Stack:** Markdown, repository file structure, sample `.pi/` project memory files.

---

### Task 1: Rewrite the repository README

**Files:**
- Modify: `README.md`

- [ ] Replace the current repo-description README with a user-facing README that explains:
  - what member-berries is
  - current status of the project
  - who it is for
  - what is available today
  - where to start (`docs/quickstart.md`, `docs/how-it-works.md`, `examples/sample-project/`)
  - the repo structure
  - next implementation milestones

### Task 2: Add core docs

**Files:**
- Create: `docs/quickstart.md`
- Create: `docs/how-it-works.md`
- Create: `docs/repository-guide.md`

- [ ] Add `docs/quickstart.md` with a manual onboarding flow for the current repo state.
- [ ] Add `docs/how-it-works.md` describing the memory model: `PROJECT.md`, `current.md`, `decisions.md`, `gotchas.md`, `commands.md`, checkpoints.
- [ ] Add `docs/repository-guide.md` explaining what is in `specs/`, `docs/`, `examples/`, `templates/`, and `extension/`.

### Task 3: Add a sample example project

**Files:**
- Create: `examples/sample-project/README.md`
- Create: `examples/sample-project/.pi/PROJECT.md`
- Create: `examples/sample-project/.pi/memory/current.md`
- Create: `examples/sample-project/.pi/memory/decisions.md`
- Create: `examples/sample-project/.pi/memory/gotchas.md`
- Create: `examples/sample-project/.pi/memory/commands.md`
- Create: `examples/sample-project/.pi/memory/checkpoints/2026-04-10T00-00-00Z.md`

- [ ] Add a sample project README explaining the fictional repo and why the example exists.
- [ ] Add realistic example memory files that demonstrate the intended structure and tone.
- [ ] Keep the example compact but concrete enough for users to copy and adapt.

### Task 4: Verify the repository is coherent

**Files:**
- Verify: `README.md`
- Verify: `docs/*.md`
- Verify: `examples/sample-project/**`

- [ ] Check that README links match created files.
- [ ] Check that the example project path exists and contains all referenced files.
- [ ] Review for consistency: do not imply the extension is already implemented.
- [ ] Run a simple repository tree listing to confirm the onboarding surface exists.
