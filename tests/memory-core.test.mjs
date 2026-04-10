import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildInjectedMemory,
  bootstrapMemoryProject,
  parseSections,
  promoteMemoryEntry,
  pruneMemory,
  refreshCurrentTimestamp,
  searchMemory,
  writeCheckpoint,
} from '../extension/memory-core.mjs';

test('parseSections extracts markdown sections with headings', () => {
  const text = `# Decisions\n\n## 2026-04-10 — Search indexing\n\n### Status\nAccepted\n\n### Why\nQueue retries were flaky.\n`;
  const sections = parseSections(text);

  assert.ok(sections.length >= 2);
  assert.equal(sections[0].heading, '2026-04-10 — Search indexing');
  assert.equal(sections[1].heading, '2026-04-10 — Search indexing / Status');
  assert.equal(sections[2].heading, '2026-04-10 — Search indexing / Why');
  assert.match(sections[2].body, /Queue retries/);
});

test('bootstrapMemoryProject creates the local .pi memory structure', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  const result = await bootstrapMemoryProject(root);

  assert.equal(result.created, true);
  assert.ok(result.paths.project.endsWith('.pi/PROJECT.md'));

  const projectContents = await readFile(result.paths.project, 'utf8');
  assert.match(projectContents, /# Project/);

  const currentContents = await readFile(result.paths.current, 'utf8');
  assert.match(currentContents, /# Current State/);
});

test('searchMemory ranks matching decision content above unrelated content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const decisionsPath = join(root, '.pi', 'memory', 'decisions.md');
  await writeFile(
    decisionsPath,
    `# Decisions\n\n## 2026-04-10 — Search indexing retries\n\n### Status\nAccepted\n\n### Why\nRetry counts caused delayed search indexing behavior.\n`,
    'utf8',
  );

  const results = await searchMemory(root, 'search indexing retries', 'decisions');

  assert.ok(results.length > 0);
  assert.equal(results[0].source, 'decisions');
  assert.match(results[0].heading, /Search indexing retries/);
});

test('searchMemory boosts path-aware matches when query references a subsystem path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const gotchasPath = join(root, '.pi', 'memory', 'gotchas.md');
  await writeFile(
    gotchasPath,
    `# Gotchas\n\n## Workers\n\n### Generic retry issue\n- Symptom: retries are confusing\n- Cause: workers fail\n- Relevant paths/commands: src/core/search-index.ts\n\n## Workers\n\n### Embedding worker retry issue\n- Symptom: retries are confusing\n- Cause: workers fail\n- Relevant paths/commands: src/jobs/embedding-worker.ts\n`,
    'utf8',
  );

  const results = await searchMemory(root, 'src/jobs/embedding-worker.ts retry issue', 'gotchas');

  assert.ok(results.length >= 2);
  assert.match(results[0].heading, /Embedding worker retry issue/);
});

test('buildInjectedMemory includes always-on files and relevant snippets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const fs = await import('node:fs/promises');
  await fs.writeFile(
    join(root, '.pi', 'PROJECT.md'),
    `# Project\n\n## Mission\nA notes API with search indexing.\n`,
    'utf8',
  );
  await fs.writeFile(
    join(root, '.pi', 'memory', 'current.md'),
    `# Current State\n\n## Current Objective\nFix search indexing delays.\n`,
    'utf8',
  );
  await fs.writeFile(
    join(root, '.pi', 'memory', 'gotchas.md'),
    `# Gotchas\n\n## Workers\n\n### Retry failures look like flaky search\n- Symptom: indexing is delayed\n- Cause: first worker attempt fails\n`,
    'utf8',
  );

  const injected = await buildInjectedMemory(root, 'Why is search indexing flaky?');

  assert.match(injected, /PROJECT MEMORY/);
  assert.match(injected, /A notes API with search indexing/);
  assert.match(injected, /Fix search indexing delays/);
  assert.match(injected, /Retry failures look like flaky search/);
});

test('writeCheckpoint creates a timestamped checkpoint file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const checkpoint = await writeCheckpoint(root, {
    trigger: 'pre-compact',
    objective: 'Preserve working state before compaction',
    time: '2026-04-10T12:34:56Z',
  });

  const checkpointText = await readFile(checkpoint, 'utf8');
  assert.match(checkpoint, /2026-04-10T12-34-56Z\.md$/);
  assert.match(checkpointText, /Trigger: pre-compact/);
  assert.match(checkpointText, /Preserve working state before compaction/);
});

test('refreshCurrentTimestamp rewrites the Last Updated field', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const currentPath = join(root, '.pi', 'memory', 'current.md');
  await refreshCurrentTimestamp(root, '2026-04-10T08:30:00Z');
  const currentText = await readFile(currentPath, 'utf8');

  assert.match(currentText, /## Last Updated\n2026-04-10T08:30:00Z/);
});

test('promoteMemoryEntry appends a decision and skips duplicate headings', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const first = await promoteMemoryEntry(root, 'decisions', {
    date: '2026-04-10',
    title: 'Use worker retry metrics',
    status: 'Accepted',
    context: 'Search indexing was delayed without good visibility.',
    decision: 'Track retry counts explicitly in worker logs.',
    why: 'This makes first-failure causes observable.',
    rejectedAlternatives: ['Infer retries from generic job failures'],
    implications: 'Debugging should begin with first-attempt failure inspection.',
  });
  const second = await promoteMemoryEntry(root, 'decisions', {
    date: '2026-04-10',
    title: 'Use worker retry metrics',
    status: 'Accepted',
    context: 'Duplicate attempt',
    decision: 'Duplicate attempt',
    why: 'Duplicate attempt',
  });

  const text = await readFile(join(root, '.pi', 'memory', 'decisions.md'), 'utf8');
  assert.equal(first.added, true);
  assert.equal(second.added, false);
  assert.match(text, /Use worker retry metrics/);
});

test('promoteMemoryEntry adds a command to the requested command section', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const result = await promoteMemoryEntry(root, 'commands', {
    section: 'Test',
    command: 'pnpm test -- search-index',
    note: 'Run this when changing indexing behavior.',
  });

  const text = await readFile(join(root, '.pi', 'memory', 'commands.md'), 'utf8');
  assert.equal(result.added, true);
  assert.match(text, /pnpm test -- search-index/);
  assert.match(text, /Run this when changing indexing behavior/);
});

test('pruneMemory removes duplicate checkpoint files and trims old history', async () => {
  const root = await mkdtemp(join(tmpdir(), 'member-berries-'));
  await bootstrapMemoryProject(root);

  const checkpointsDir = join(root, '.pi', 'memory', 'checkpoints');
  await writeFile(join(checkpointsDir, '2026-04-10T00-00-00Z.md'), '# Checkpoint\n\nrepeat\n', 'utf8');
  await writeFile(join(checkpointsDir, '2026-04-10T00-01-00Z.md'), '# Checkpoint\n\nrepeat\n', 'utf8');
  await writeFile(join(checkpointsDir, '2026-04-10T00-02-00Z.md'), '# Checkpoint\n\nunique 1\n', 'utf8');
  await writeFile(join(checkpointsDir, '2026-04-10T00-03-00Z.md'), '# Checkpoint\n\nunique 2\n', 'utf8');

  const result = await pruneMemory(root, { keepCheckpoints: 2 });
  const remaining = (await readdir(checkpointsDir)).filter((name) => name.endsWith('.md')).sort();

  assert.equal(result.removed.length, 2);
  assert.equal(remaining.length, 2);
});
