# Migration notes

`@aidanbell/schema-form` is **experimental `0.1.x`**. The public API may change before `1.0`. Prefer pinning an exact version in apps until the API stabilizes.

## Current baseline (`0.1.x`)

- **Validator:** [Valibot](https://valibot.dev) (peer) under the hood. Built schemas implement [Standard Schema v1](https://standardschema.dev), and form wiring uses `standardSchemaResolver` — so the validator is an implementation detail, and Standard Schema-aware tools can consume `validationSchema` directly. Requires `@hookform/resolvers` ≥5.0.1.
- **Headless only:** parse, defaults, Valibot schema builder, and `useSchemaForm` (React Hook Form + `@hookform/resolvers/valibot`).
- **Schema:** `schemaVersion: 1` — see [`SCHEMA.md`](SCHEMA.md).
- **UI package:** `@aidanbell/schema-form-ui` ships styled `SchemaForm` (Tailwind utilities + Base UI checkbox). Consumers must configure Tailwind to scan the package `dist` — see the UI README. Rendering is extensible via `config.components`, per-field `component`, and `renderField` — see [Customizing rendering](packages/schema-form-ui/README.md#customizing-rendering).
- **Select / radio options (0.1.1+):** accept `string` or `{ label, value }`. After parse, options are always `{ label, value }` (a string `"admin"` becomes `{ label: "admin", value: "admin" }`).

## Future (placeholders)

Expect possible breaking changes around:

- Optional Zod (or other) validation adapters beside Valibot (input side — output already implements Standard Schema v1)
- `schemaVersion: 2` field/form shape extensions
- Stricter TypeScript generics for form values

When a breaking release ships, this file will list concrete upgrade steps per version bump.

## Empty-value semantics

These are intentional and unlikely to soften without a major bump — see [`SCHEMA.md`](SCHEMA.md):

- Optional text-like → `''`
- Optional number → `undefined` (not `0`)
- Boolean → `false`; required boolean must be `true`
