# Commands

## Setup
```bash
pnpm install
pnpm db:migrate
```

## Dev
```bash
pnpm dev
pnpm worker:dev
```

## Test
```bash
pnpm test
pnpm test -- search-index
```

## Lint / Typecheck
```bash
pnpm lint
pnpm typecheck
```

## Build
```bash
pnpm build
```

## Debug / Inspection
```bash
pnpm worker:dev
pnpm reindex:note -- --id <note-id>
pnpm logs:queue
```

## Notes
- Run `pnpm worker:dev` when debugging indexing behavior locally.
- Manual reindex is a recovery command, not proof that the async flow is healthy.
