# Schema Form — Schema contract (`schemaVersion: 1`)

Canonical shape for form definitions consumed by `@aidanbell/schema-form`.

## Top-level: `FormDefinition`

| Key | Type | Notes |
|-----|------|--------|
| `schemaVersion` | `1` (optional) | Defaults to `1` when omitted. |
| `title` | `string` (optional) | Display title. |
| `description` | `string` (optional) | Form-level help text. |
| `fields` | `FieldDefinition[]` | Required. Non-empty list of fields. |

Unknown top-level keys are stripped during parse (may surface as warnings).

## Field: `FieldDefinition`

| Key | Type | Notes |
|-----|------|--------|
| `name` | `string` | Required. Must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/`. Unique within the form. |
| `type` | `FieldType` | Required. See below. |
| `label` | `string` | Optional UI label. |
| `description` | `string` | Optional help text. |
| `required` | `boolean` | Default `false`. |
| `placeholder` | `string` | Optional. |
| `defaultValue` | `string \| number \| boolean` | Used by `getDefaultValues` when set. |
| `options` | `(string \| { label: string; value: string })[]` | Required (non-empty) for `select` / `radio`. Plain strings are normalized to `{ label, value }` with the same text for both. |
| `min` / `max` | `number` | Number bounds (`min` ≤ `max` when both set). |
| `minLength` / `maxLength` | `number` | String length bounds. |
| `pattern` | `string` | RegExp source for text-like fields. |
| `disabled` | `boolean` | Hint for UI consumers. |

### `FieldType`

`string` | `email` | `password` | `number` | `boolean` | `select` | `radio` | `textarea`

## Parse rules

`parseFormDefinition` **never throws**.

- Accepts a plain object or a JSON string.
- On failure: `{ success: false, error, issues? }` with structured `ParseIssue`s (`path` + `message`).
- On success: `{ success: true, data, warnings? }`.
- Unknown keys on the form or fields are stripped; warnings may be returned.
- Duplicate field names are rejected.
- `select` / `radio` without a non-empty `options` array are rejected.
- Each option must be a non-empty string or `{ label, value }` with non-empty strings; parsed fields always store `{ label, value }`.
- Invalid `pattern` strings are rejected.
- Inconsistent `min`/`max` or `minLength`/`maxLength` are rejected.

## Empty-value semantics

Used by `getDefaultValues` and `buildFormValidationSchema` / `useSchemaForm`:

| Kind | Empty / unset value |
|------|---------------------|
| Optional text-like (`string`, `email`, `password`, `textarea`, `select`, `radio`) | `''` |
| Optional `number` | `undefined` (never `0`) |
| `boolean` | `false` |
| Required `boolean` | must be `true` |

Empty email does not also emit “Invalid email” — blank required fields fail with **Required** only.

## Related

- Package docs: [`packages/schema-form/README.md`](packages/schema-form/README.md)
- Migration / stability: [`MIGRATION.md`](MIGRATION.md)
