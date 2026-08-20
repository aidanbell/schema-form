# `@aidanbell/schema-form-ui`

> **Experimental `0.1.x`** — API may change before 1.0.

Styled, accessible React forms driven by the same JSON schema as [`@aidanbell/schema-form`](https://www.npmjs.com/package/@aidanbell/schema-form). Uses Tailwind utility classes and [Base UI](https://base-ui.com) for the checkbox primitive.

This package **does not ship a CSS file**. Your app must run Tailwind and scan this package’s built files so the utility classes in `dist` are included.

## Install

```bash
pnpm add @aidanbell/schema-form-ui @aidanbell/schema-form valibot react react-dom react-hook-form @hookform/resolvers
```

**Peers:** `react` / `react-dom` ≥18.2, `@aidanbell/schema-form` ≥0.1.0, `valibot` ^1.4.2, `react-hook-form` ^7.50, `@hookform/resolvers` ≥5.0.1.

Runtime dependencies (installed with the package): `clsx`, `tailwind-merge`, `@base-ui/react`.

## Tailwind setup (required)

Without this, controls look unstyled because Tailwind never sees the class strings in `node_modules`.

### Tailwind v4

```css
@import "tailwindcss";
@source "../node_modules/@aidanbell/schema-form-ui/dist/**/*.{js,mjs}";
```

### Tailwind v3

```js
// tailwind.config.js
content: [
  "./src/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@aidanbell/schema-form-ui/dist/**/*.{js,mjs}",
],
```

Adjust the relative path to match where your CSS / config file lives.

## Quickstart

```tsx
import { SchemaForm } from "@aidanbell/schema-form-ui";

const schema = {
  schemaVersion: 1 as const,
  title: "Sign up",
  description: "Create an account",
  fields: [
    { name: "email", type: "email" as const, label: "Email", required: true },
    {
      name: "role",
      type: "select" as const,
      label: "Role",
      options: ["admin", "viewer"],
    },
  ],
};

export function SignupForm() {
  return (
    <SchemaForm
      config={{ schema }}
      onSubmit={(values) => {
        console.log(values);
      }}
      onError={(error) => {
        console.error(error);
      }}
    />
  );
}
```

Invalid schemas render an error UI and call `onError` with the parse result — the app does not crash. If `onSubmit` throws or rejects, `onError` receives that error as well.

## Theming with `classNames`

Pass Tailwind classes via `config.classNames` (form-wide) and/or `config.fields[name].classNames` (per field). Later utilities win when they conflict (`cn` / `tailwind-merge`).

```tsx
<SchemaForm
  config={{
    schema,
    classNames: {
      form: "max-w-md",
      label: "font-semibold",
      submitButton: "bg-emerald-600 hover:bg-emerald-700",
    },
    fields: {
      email: { classNames: { control: "border-emerald-400" } },
      role: { disabled: true },
    },
    submitLabel: "Create account",
    showReset: false,
  }}
  onSubmit={async (values) => {
    /* ... */
  }}
/>
```

**Field overrides:** `hidden`, `disabled`, and nested `classNames` keys (`field`, `label`, `description`, `control`, `error`, …).

## API

| Export | Role |
|--------|------|
| `SchemaForm` | Parse schema → render fields + submit/reset |
| `SchemaField` | Single field bound to a React Hook Form instance |
| `cn` / `mergeClassNames` | Tailwind-friendly class helpers |
| UI primitives | `Input`, `Textarea`, `Select`, `Checkbox`, `Label`, `Button` |

**Types:** `SchemaFormProps`, `SchemaFormConfig`, `SchemaFormClassNames`.

Full field contract: [`SCHEMA.md`](../../SCHEMA.md) in the monorepo.

## Empty-value semantics

Same as core:

- Optional text-like fields submit `''` when empty.
- Optional `number` fields submit `undefined` (never `0`).
- `boolean` defaults to `false`; required boolean must be `true`.

## License

MIT
