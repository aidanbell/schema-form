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
      options: [
        { label: "Admin", value: "admin" },
        { label: "Viewer", value: "viewer" },
      ],
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

**Field overrides:** `hidden`, `disabled`, `component`, and nested `classNames` keys (`field`, `label`, `description`, `control`, `error`, …).

## Customizing rendering

Three layers, pick the smallest one that fits. Each layer can coexist with the others; more specific wins.

### 1. Replace a control type everywhere — `config.components`

Swap the input for a given `FieldType` across the form. Label, description, and error chrome stay put.

```tsx
import { SchemaForm, type FieldControlProps } from "@aidanbell/schema-form-ui";

function FancySelect({
  field,
  form,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps) {
  return (
    <select
      id={id}
      disabled={disabled}
      className={className}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...form.register(field.name)}
    >
      {(field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

<SchemaForm
  config={{ schema, components: { select: FancySelect } }}
  onSubmit={...}
/>
```

### 2. Replace one field's control — `config.fields[name].component`

Same chrome, one field. Wins over a matching `components` entry.

```tsx
<SchemaForm
  config={{
    schema,
    components: { string: FancyInput },
    fields: { nickname: { component: NicknameControl } },
  }}
  onSubmit={...}
/>
```

### 3. Own the whole row — `renderField`

A render prop on `SchemaForm` (not `config`). Receives the same `FieldControlProps` as custom controls, plus `defaultRender` to fall back per field.

```tsx
<SchemaForm
  config={{ schema }}
  renderField={(props, defaultRender) =>
    props.field.name === "rating" ? (
      <StarRatingRow {...props} />
    ) : (
      defaultRender(props)
    )
  }
  onSubmit={...}
/>
```

`defaultRender(props)` is equivalent to not using `renderField` at all. You can tweak props before delegating:

```tsx
renderField={(props, defaultRender) => defaultRender({ ...props, disabled: true })}
```

`hidden` still removes a field before `renderField` is consulted.

### Custom control contract

Custom controls receive `FieldControlProps`: `field`, `form`, `id`, `disabled`, `error`, `className`, `aria-invalid`, and `aria-describedby`. You must wire the value into React Hook Form yourself — `form.register(field.name)` for native inputs, or `Controller` when the widget is uncontrolled. The built-in implementations in [`controls.tsx`](src/fields/controls.tsx) are the reference.

If `renderField` returns custom markup *without* calling `defaultRender`, you own the label, error display, and accessibility wiring. `aria-describedby` points at `{field.name}-error` and `{field.name}-description`; those ids only exist if you render elements with them.

## API

| Export | Role |
|--------|------|
| `SchemaForm` | Parse schema → render fields + submit/reset |
| `SchemaField` | Single field bound to a React Hook Form instance |
| Built-in controls | `StringControl`, `NumberControl`, `BooleanControl`, `TextareaControl`, `SelectControl`, `RadioControl` |
| `cn` / `mergeClassNames` | Tailwind-friendly class helpers |
| UI primitives | `Input`, `Textarea`, `Select`, `Checkbox`, `Label`, `Button` |

**Types:** `SchemaFormProps`, `SchemaFormConfig`, `SchemaFormClassNames`, `FieldControlProps`.

Full field contract: [`SCHEMA.md`](../../SCHEMA.md) in the monorepo.

## Empty-value semantics

Same as core:

- Optional text-like fields submit `''` when empty.
- Optional `number` fields submit `undefined` (never `0`).
- `boolean` defaults to `false`; required boolean must be `true`.

## License

MIT
