# Contributing

## Setup

- Node 20+ (see `.nvmrc`)
- pnpm 9+

```bash
pnpm install
```

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm build` | Build packages with tsup |
| `pnpm test` | Run Vitest once |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm typecheck` | TypeScript project checks |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm verify` | Typecheck + test + build (local CI) |
| `pnpm changeset` | Add a changeset for release |

## Packages

- `@aidanbell/schema-form` — headless core (parse, Zod builder, `useSchemaForm`)
- `@aidanbell/schema-form-ui` — styled React form (not started yet)

## Pull requests

1. Keep changes focused
2. Add/adjust tests for behavior changes
3. Include a changeset when the public API or published package changes
