# member-berries v1.0.0 Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `member-berries` materially more ergonomic and release it as `v1.0.0` with interactive promotion flows, better ranking heuristics, fresh verification, a git tag, and a GitHub release.

**Architecture:** Keep the MVP architecture intact while improving the human-facing workflow. Promotion should prefer guided interactive command flows over delimiter-heavy arguments. Ranking should stay transparent and testable while gaining stronger heading/path awareness. Release artifacts should be repository-native: package version, changelog, tag, and GitHub release.

**Tech Stack:** Pi extension UI prompts, Node built-in test runner, ESM helper module, git tags, GitHub CLI.

---

### Task 1: Add tests for path-aware ranking and promotion ergonomics
- [ ] Add tests that prove search ranking favors heading/path-aware matches.
- [ ] Add tests that keep prune/promotion behavior stable while helpers evolve.
- [ ] Run tests and watch them fail before helper changes.

### Task 2: Improve helper ranking and durable-memory helpers
- [ ] Implement clearer heading/path-aware scoring in `extension/memory-core.mjs`.
- [ ] Keep the ranking logic transparent and deterministic.
- [ ] Preserve existing behavior for bootstrap/checkpoints/promotion/pruning.
- [ ] Run tests until green.

### Task 3: Replace delimiter-heavy promotion with guided interactive flow
- [ ] Update `/memory-promote` so no-arg use opens an interactive guided flow.
- [ ] Keep the old structured path available when explicit args are provided.
- [ ] Use `ctx.ui.select`, `ctx.ui.input`, and `ctx.ui.editor` where helpful.
- [ ] Update extension docs and README examples.

### Task 4: Prepare and publish v1.0.0
- [ ] Bump `package.json` to `1.0.0`.
- [ ] Update `CHANGELOG.md` with a `1.0.0` section.
- [ ] Refresh release/install docs if needed.
- [ ] Run `npm test` and `npm run pack:check`.
- [ ] Run a secret scan.
- [ ] Commit the release work.
- [ ] Create git tag `v1.0.0`.
- [ ] Push branch and tag.
- [ ] Create a GitHub release with notes.
