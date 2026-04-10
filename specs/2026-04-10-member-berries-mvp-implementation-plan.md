# member-berries MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `member-berries` from a design-only repository into a usable onboarding scaffold with a safe first-pass Pi extension MVP.

**Architecture:** Ship in two layers. First, make the repo onboarding-complete with docs, templates, examples, and a public-facing README. Second, add a lightweight extension MVP that supports bootstrap, status, search, prime, sync, and basic contextual memory injection using local `.pi/` files.

**Tech Stack:** Markdown, SVG, Node built-in test runner, ESM helper module, Pi extension API, TypeBox.

---

### Task 1: Make the repository safe to publish

**Files:**
- Create: `.gitignore`

- [ ] Add a repo-level `.gitignore` for `.DS_Store`, `node_modules/`, temporary logs, and test artifacts.
- [ ] Run a manual secret scan before committing any new work.

### Task 2: Finalize onboarding surface

**Files:**
- Modify: `README.md`
- Modify: `docs/quickstart.md`
- Modify: `docs/how-it-works.md`
- Modify: `docs/repository-guide.md`
- Create: `docs/images/member-berries-memory-map.svg`

- [ ] Upgrade README to a public-facing landing page with badges, a visual, a repo tree, and honest current status.
- [ ] Update docs so they match the repo’s new reality: templates + sample project + extension MVP.
- [ ] Add a lightweight SVG diagram to give README a visual without claiming screenshots that do not exist.

### Task 3: Finalize templates and example project

**Files:**
- Verify: `templates/*.md`
- Verify: `examples/sample-project/**`

- [ ] Keep templates concise and copyable.
- [ ] Keep the sample project realistic but clearly fictional.
- [ ] Ensure the example demonstrates the intended separation between project identity, current state, decisions, gotchas, commands, and checkpoints.

### Task 4: Add extension MVP with TDD on helpers

**Files:**
- Create: `package.json`
- Create: `tests/memory-core.test.mjs`
- Create: `extension/memory-core.mjs`
- Modify: `extension/index.ts`
- Modify: `extension/README.md`

- [ ] Write failing tests first for helper behaviors: section extraction, search ranking, bootstrap scaffolding, and injected-memory assembly.
- [ ] Run the tests to watch them fail.
- [ ] Implement `extension/memory-core.mjs` with pure helpers.
- [ ] Run the tests until they pass.
- [ ] Wire the helpers into `extension/index.ts`.
- [ ] Register MVP commands: `memory-bootstrap`, `memory-status`, `memory-search`, `memory-prime`, `memory-sync`.
- [ ] Register the `memory_search` tool for LLM retrieval.
- [ ] Add basic `before_agent_start` contextual memory injection.
- [ ] Update `extension/README.md` to document what is actually implemented now.

### Task 5: Verify and publish safely

**Files:**
- Verify: all changed files

- [ ] Run the test suite.
- [ ] Run a secret scan across tracked files.
- [ ] Review `git diff --cached` before each commit.
- [ ] Commit the onboarding/docs/templates/examples pass.
- [ ] Commit the extension MVP pass.
- [ ] Push to GitHub.
