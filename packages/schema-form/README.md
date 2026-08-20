# `@aidanbell/schema-form`

> **Experimental `0.1.x`** — API may change before 1.0.

Headless schema-driven forms for React: parse a JSON field definition, build a [Valibot](https://valibot.dev) validator, and wire [React Hook Form](https://react-hook-form.com) via `useSchemaForm`.

Bring your own UI — this package does not render inputs.

## Install

```bash
pnpm add @aidanbell/schema-form valibot react react-dom react-hook-form @hookform/resolvers
```

**Peers:** `react` / `react-dom` ≥18.2, `valibot` ^1.4.2, `react-hook-form` ^7.50, `@hookform/resolvers` ≥5.0.1.

Built validation schemas implement [Standard Schema v1](https://standardschema.dev), so `validationSchema` from `useSchemaForm` (or `buildFormValidationSchema`) can be passed to any Standard Schema-aware consumer — not just React Hook Form.

## Quickstart

```tsx
import {
  parseFormDefinition,
  useSchemaForm,
} from "@aidanbell/schema-form";

const parsed = parseFormDefinition({
  schemaVersion: 1,
  title: "Invite",
  fields: [
    { name: "email", type: "email", label: "Email", required: true },
    { name: "age", type: "number", label: "Age" },
  ],
});

if (!parsed.success) {
  throw new Error(parsed.error);
}

export function InviteForm() {
  const { fields, form, handleSubmit } = useSchemaForm({
    definition: parsed.data,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <label key={field.name}>
          {field.label ?? field.name}
          <input {...form.register(field.name)} />
          {form.formState.errors[field.name] && (
            <span>{String(form.formState.errors[field.name]?.message)}</span>
          )}
        </label>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## API

| Export | Role |
|--------|------|
| `parseFormDefinition` | Validate a form definition (object or JSON string). Never throws; returns `ParseResult`. |
| `formatParseError` | Format parse issues into a readable string. |
| `buildFormValidationSchema` | Build a Valibot object schema from `FieldDefinition[]`. |
| `getDefaultValues` | Derive RHF-friendly defaults (`defaultValue` or type fallbacks). |
| `useSchemaForm` | Headless hook: Valibot resolver + defaults + optional `onSubmit`. |

**Types:** `FormDefinition`, `FieldDefinition`, `FieldType`, `ParseResult`, `ParseIssue`, `UseSchemaFormOptions`, `UseSchemaFormResult`, `FormValidationSchema`.

Full field contract: see [`SCHEMA.md`](../../SCHEMA.md) in the monorepo.

## Empty-value semantics

- Optional text-like fields (`string`, `email`, `password`, `textarea`, `select`, `radio`) use `''` when empty.
- Optional `number` fields use `undefined` when empty (never coerced to `0`).
- `boolean` defaults to `false`; a required boolean must be `true`.

## License

MIT
