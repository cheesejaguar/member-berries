# Demo Workflow

This is the fastest way to demo `member-berries` inside Pi once the package is available locally.

## 1. Install the package from a local path

```bash
pi install /Users/aaron/Documents/member-berries
```

Because `package.json` now includes a Pi manifest, Pi can discover the extension from the repo root.

## 2. Open or create a test project

Inside a test repo, start Pi and run:

```text
/memory-bootstrap
```

This creates:

```text
.pi/
  PROJECT.md
  memory/
    current.md
    decisions.md
    gotchas.md
    commands.md
    checkpoints/
```

## 3. Fill in initial memory

Edit:
- `.pi/PROJECT.md`
- `.pi/memory/current.md`

Add a small amount of realistic content.

## 4. Inspect status and search

Run:

```text
/memory-status
/memory-search architecture
/memory-prime why is auth flaky?
```

## 5. Trigger a manual checkpoint

Run:

```text
/memory-sync
```

This writes a checkpoint and refreshes the timestamp in `current.md`.

## 6. Ask a normal project question

Then ask Pi something like:

```text
Why is search indexing flaky in this project?
```

The extension should inject the always-on files plus matching snippets from durable memory.

## Suggested GIF / screen recording sequence

If you want to capture a short demo GIF later, use this sequence:

1. open Pi in a small sample repo
2. run `/memory-bootstrap`
3. show the generated `.pi/` files
4. fill in `PROJECT.md` and `current.md`
5. run `/memory-status`
6. run `/memory-search flaky search`
7. run `/memory-sync`
8. ask a normal repo question and show the injected-memory effect

This gives a short, honest demo without pretending the extension is more complete than it is.
