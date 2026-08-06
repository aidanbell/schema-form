# Schema Form

> **Experimental `0.1.x`** — API may change before 1.0.

**Schema in → accessible React form out.**

Pass a small JSON config (field list + rules). The library validates the schema, builds a Zod validator, and either:

- renders a polished Tailwind/Radix form (`@aidanbell/schema-form-ui`), or
- exposes headless hooks/utils so you bring your own components (`@aidanbell/schema-form`)

## Packages

| Package | Role |
|---------|------|
| `@aidanbell/schema-form` | Headless core: parse, defaults, Zod schema, `useSchemaForm` |
| `@aidanbell/schema-form-ui` | Styled `SchemaForm` component (coming soon) |

## Install (core)

```bash
pnpm add @aidanbell/schema-form zod react react-dom react-hook-form @hookform/resolvers
```

**Peer dependencies (core):** `react` / `react-dom` ≥18.2, `zod` ^3.23 (Zod 3 officially supported in CI; `^4` accepted in the peer range), plus `react-hook-form` and `@hookform/resolvers` for the headless hook.

## Empty-value semantics

- Optional text-like fields (`string`, `email`, `password`, `textarea`, `select`, `radio`) submit empty values as `''`.
- Optional `number` fields submit empty input as `undefined` (never coerced to `0`).
- `boolean` fields default to `false` when unchecked / unset; a required boolean must be `true`.

## License

MIT
