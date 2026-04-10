import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';

const TEMPLATE_PROJECT = `# Project

## Mission
Describe what this repo does in 2-5 sentences.

## Users / Consumers
Who uses this project, and what do they rely on?

## Architecture
- Major subsystems:
- Data flow:
- External services:
- Important boundaries:

## Invariants
- Things that must remain true
- Safety constraints
- Compatibility guarantees

## Conventions
- Naming patterns
- File organization rules
- Testing expectations
- Preferred implementation patterns

## Key Paths
- \`src/...\` —
- \`app/...\` —
- \`lib/...\` —

## Non-Goals
What this project intentionally does not optimize for or support.
`;

const TEMPLATE_CURRENT = `# Current State

## Current Objective
What are we trying to accomplish right now?

## Active Plan
1. ...
2. ...
3. ...

## Current Focus Areas
- ...
- ...

## Open Questions
- ...
- ...

## Known Risks
- ...

## Next Best Actions
- ...
- ...

## Recently Touched Files
- \`...\`
- \`...\`

## Last Updated
YYYY-MM-DDTHH:MM:SSZ
`;

const TEMPLATE_DECISIONS = `# Decisions

## YYYY-MM-DD — Decision title

### Status
Accepted | Proposed | Superseded

### Context
What problem existed?

### Decision
What was chosen?

### Why
What tradeoffs or rationale drove the choice?

### Rejected Alternatives
- Option A — why not
- Option B — why not

### Implications
What should future contributors remember because of this choice?
`;

const TEMPLATE_GOTCHAS = `# Gotchas

## Category

### Title
- Symptom:
- Cause:
- Fix:
- Prevention:
- Relevant paths/commands:
`;

const TEMPLATE_COMMANDS = `# Commands

## Setup
\`\`\`bash
# add verified setup commands here
\`\`\`

## Dev
\`\`\`bash
# add verified dev commands here
\`\`\`

## Test
\`\`\`bash
# add verified test commands here
\`\`\`

## Lint / Typecheck
\`\`\`bash
# add verified lint and typecheck commands here
\`\`\`

## Build
\`\`\`bash
# add verified build commands here
\`\`\`

## Debug / Inspection
\`\`\`bash
# add verified debug commands here
\`\`\`

## Notes
- Record prerequisites and caveats here.
`;

const TEMPLATE_CHECKPOINT = `# Checkpoint

- Time: YYYY-MM-DDTHH:MM:SSZ
- Trigger: manual
- Session: optional session name or id

## Objective
...

## Completed
- ...

## Current State
...

## Important Findings
- ...

## Open Questions
- ...

## Next Steps
- ...

## Touched Areas
- \`path/...\`

## Commands Run
- \`...\`

## Notable Errors / Surprises
- ...
`;

export function getMemoryPaths(root) {
  const base = resolve(root, '.pi');
  const memory = join(base, 'memory');
  return {
    base,
    memory,
    project: join(base, 'PROJECT.md'),
    current: join(memory, 'current.md'),
    decisions: join(memory, 'decisions.md'),
    gotchas: join(memory, 'gotchas.md'),
    commands: join(memory, 'commands.md'),
    checkpoints: join(memory, 'checkpoints'),
  };
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function writeIfMissing(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  if (!(await exists(path))) {
    await writeFile(path, contents, 'utf8');
    return true;
  }
  return false;
}

export async function bootstrapMemoryProject(root) {
  const paths = getMemoryPaths(root);
  await mkdir(paths.checkpoints, { recursive: true });

  const createdFlags = await Promise.all([
    writeIfMissing(paths.project, TEMPLATE_PROJECT),
    writeIfMissing(paths.current, TEMPLATE_CURRENT),
    writeIfMissing(paths.decisions, TEMPLATE_DECISIONS),
    writeIfMissing(paths.gotchas, TEMPLATE_GOTCHAS),
    writeIfMissing(paths.commands, TEMPLATE_COMMANDS),
  ]);

  return {
    created: createdFlags.some(Boolean),
    paths,
  };
}

export function parseSections(text) {
  const lines = String(text || '').split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^##\s+(.*)$/);
    if (match) {
      if (current) {
        current.body = current.body.join('\n').trim();
        sections.push(current);
      }
      current = {
        heading: match[1].trim(),
        body: [],
      };
      continue;
    }

    if (current) {
      current.body.push(line);
    }
  }

  if (current) {
    current.body = current.body.join('\n').trim();
    sections.push(current);
  }

  return sections;
}

function tokenize(text) {
  return Array.from(new Set(String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));
}

function fallbackSection(source, text) {
  const lines = String(text || '').trim().split(/\r?\n/);
  const first = lines[0] || source;
  return [{ heading: first.replace(/^#+\s*/, '').trim() || source, body: lines.slice(1).join('\n').trim() }];
}

function sectionsForSource(source, text) {
  const sections = parseSections(text);
  return sections.length > 0 ? sections : fallbackSection(source, text);
}

function scoreSection(query, section, source, path) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;

  const heading = String(section.heading || '').toLowerCase();
  const body = String(section.body || '').toLowerCase();
  const sourceText = `${source} ${path}`.toLowerCase();
  const phrase = String(query || '').toLowerCase().trim();

  let score = 0;
  if (phrase && heading.includes(phrase)) score += 12;
  if (phrase && body.includes(phrase)) score += 8;

  for (const token of tokens) {
    if (heading.includes(token)) score += 4;
    if (body.includes(token)) score += 2;
    if (sourceText.includes(token)) score += 1;
  }

  const conciseBonus = Math.max(0, 4 - Math.floor(body.length / 300));
  score += conciseBonus;
  return score;
}

async function readUtf8(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

async function listCheckpointFiles(dir) {
  try {
    const names = await readdir(dir);
    return names.filter((name) => name.endsWith('.md')).sort().reverse().map((name) => join(dir, name));
  } catch {
    return [];
  }
}

async function sourceDocuments(root, scope = 'all') {
  const paths = getMemoryPaths(root);
  const docs = [];

  const add = async (source, path) => {
    const text = await readUtf8(path);
    if (text) docs.push({ source, path, text });
  };

  if (scope === 'all' || scope === 'project') await add('project', paths.project);
  if (scope === 'all' || scope === 'current') await add('current', paths.current);
  if (scope === 'all' || scope === 'decisions') await add('decisions', paths.decisions);
  if (scope === 'all' || scope === 'gotchas') await add('gotchas', paths.gotchas);
  if (scope === 'all' || scope === 'commands') await add('commands', paths.commands);
  if (scope === 'all' || scope === 'checkpoints') {
    const checkpointFiles = await listCheckpointFiles(paths.checkpoints);
    for (const file of checkpointFiles) {
      await add('checkpoints', file);
    }
  }

  return docs;
}

export async function searchMemory(root, query, scope = 'all', limit = 5) {
  const docs = await sourceDocuments(root, scope);
  const results = [];

  for (const doc of docs) {
    for (const section of sectionsForSource(doc.source, doc.text)) {
      const score = scoreSection(query, section, doc.source, doc.path);
      if (score > 0) {
        results.push({
          score,
          source: doc.source,
          path: doc.path,
          heading: section.heading,
          excerpt: section.body.slice(0, 400).trim(),
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

function classifyIntent(prompt) {
  const lower = String(prompt || '').toLowerCase();
  return {
    decision: /\b(why|decision|architecture|refactor|migrate|tradeoff|rationale)\b/.test(lower),
    debugging: /\b(error|bug|broken|fails|failing|not working|flaky|issue|debug)\b/.test(lower),
    commands: /\b(test|build|lint|typecheck|dev|setup|run|command|deploy)\b/.test(lower),
  };
}

function formatResult(result) {
  const excerpt = result.excerpt ? `\n${result.excerpt}` : '';
  return `### ${result.heading} [${result.source}]\nPath: ${result.path}${excerpt}`;
}

export async function buildInjectedMemory(root, prompt) {
  const paths = getMemoryPaths(root);
  const project = await readUtf8(paths.project);
  const current = await readUtf8(paths.current);

  if (!project && !current) {
    return null;
  }

  const sections = ['## PROJECT MEMORY'];
  if (project) sections.push(`### Project identity\n${project.trim()}`);
  if (current) sections.push(`### Current state\n${current.trim()}`);

  const intent = classifyIntent(prompt);
  const extras = [];
  if (intent.decision) extras.push(...await searchMemory(root, prompt, 'decisions', 2));
  if (intent.debugging) extras.push(...await searchMemory(root, prompt, 'gotchas', 2));
  if (intent.commands) extras.push(...await searchMemory(root, prompt, 'commands', 1));
  extras.push(...await searchMemory(root, prompt, 'checkpoints', 1));

  const seen = new Set();
  const unique = extras.filter((item) => {
    const key = `${item.source}:${item.heading}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (unique.length > 0) {
    sections.push('### Relevant retrieved context');
    for (const item of unique) {
      sections.push(formatResult(item));
    }
  }

  return sections.join('\n\n').trim();
}

export async function getMemoryStatus(root) {
  const paths = getMemoryPaths(root);
  const project = await readUtf8(paths.project);
  const current = await readUtf8(paths.current);
  const decisions = await readUtf8(paths.decisions);
  const gotchas = await readUtf8(paths.gotchas);
  const commands = await readUtf8(paths.commands);
  const checkpoints = await listCheckpointFiles(paths.checkpoints);

  const currentObjective = current?.match(/^## Current Objective\n([\s\S]*?)(?:\n## |$)/m)?.[1]?.trim() || 'Not set';

  return {
    exists: Boolean(project || current || decisions || gotchas || commands || checkpoints.length),
    currentObjective,
    counts: {
      decisions: sectionsForSource('decisions', decisions || '').length,
      gotchas: sectionsForSource('gotchas', gotchas || '').length,
      commands: sectionsForSource('commands', commands || '').length,
      checkpoints: checkpoints.length,
    },
    paths,
    lastCheckpoint: checkpoints[0] || null,
  };
}

export async function refreshCurrentTimestamp(root, timestamp = new Date().toISOString()) {
  const paths = getMemoryPaths(root);
  const current = (await readUtf8(paths.current)) || TEMPLATE_CURRENT;
  const next = current.match(/^## Last Updated\n/m)
    ? current.replace(/^## Last Updated\n([^\n]*)/m, `## Last Updated\n${timestamp}`)
    : `${current.trim()}\n\n## Last Updated\n${timestamp}\n`;
  await writeFile(paths.current, next, 'utf8');
  return paths.current;
}

export async function writeCheckpoint(root, { trigger = 'manual', objective = 'Checkpoint current work state', currentState = 'See current.md for the latest working state.', nextSteps = ['Review current.md and continue from the active plan.'], touchedAreas = [], commandsRun = [], notable = [], session = 'member-berries', time = new Date().toISOString(), } = {}) {
  const paths = getMemoryPaths(root);
  await mkdir(paths.checkpoints, { recursive: true });
  const safeTime = time.replace(/:/g, '-');
  const file = join(paths.checkpoints, `${safeTime}.md`);

  const content = `# Checkpoint

- Time: ${time}
- Trigger: ${trigger}
- Session: ${session}

## Objective
${objective}

## Completed
- checkpoint created

## Current State
${currentState}

## Important Findings
${notable.length ? notable.map((item) => `- ${item}`).join('\n') : '- none recorded'}

## Open Questions
- none recorded

## Next Steps
${nextSteps.map((item) => `- ${item}`).join('\n')}

## Touched Areas
${touchedAreas.length ? touchedAreas.map((item) => `- \`${item}\``).join('\n') : '- none recorded'}

## Commands Run
${commandsRun.length ? commandsRun.map((item) => `- \`${item}\``).join('\n') : '- none recorded'}

## Notable Errors / Surprises
${notable.length ? notable.map((item) => `- ${item}`).join('\n') : '- none recorded'}
`;

  await writeFile(file, content, 'utf8');
  return file;
}

export function formatSearchResults(results) {
  if (!results || results.length === 0) {
    return ['No matching memory found.'];
  }

  return results.flatMap((result, index) => {
    const lines = [
      `${index + 1}. ${result.heading} [${result.source}]`,
      `   ${result.path}`,
    ];
    if (result.excerpt) {
      lines.push(`   ${result.excerpt.replace(/\s+/g, ' ').trim()}`);
    }
    return lines;
  });
}
