import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildInjectedMemory,
  bootstrapMemoryProject,
  parseSections,
  refreshCurrentTimestamp,
  searchMemory,
  writeCheckpoint,
} from '../extension/memory-core.mjs';

test('parseSections extracts markdown sections with headings', () => {
  const text = `# Decisions\n\n## 2026-04-10 — Search indexing\n\n### Status\nAccepted\n\n### Why\nQueue retries were flaky.\n`;
  const sections = parseSections(text);

  assert.ok(sections.length >= 1);
  assert.equal(sections[0].heading, '2026-04-10 — Search indexing');
  assert.match(sections[0].body, /Queue retries/);
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
  await (await import('node:fs/promises')).writeFile(
    decisionsPath,
    `# Decisions\n\n## 2026-04-10 — Search indexing retries\n\n### Status\nAccepted\n\n### Why\nRetry counts caused delayed search indexing behavior.\n`,
    'utf8',
  );

  const results = await searchMemory(root, 'search indexing retries', 'decisions');

  assert.ok(results.length > 0);
  assert.equal(results[0].source, 'decisions');
  assert.match(results[0].heading, /Search indexing retries/);
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
