/**
 * Supported field types for `schemaVersion: 1`.
 *
 * @example
 * const type: FieldType = "email";
 */
export type FieldType =
  "string" | "email" | "password" | "number" | "boolean" | "select" | "radio" | "textarea";

/**
 * A single form field definition.
 *
 * @example
 * const email: FieldDefinition = {
 *   name: "email",
 *   type: "email",
 *   label: "Email",
 *   required: true,
 * };
 */
export type FieldDefinition = {
  name: string;
  type: FieldType;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: string[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  disabled?: boolean;
};

/**
 * Top-level form definition (`schemaVersion` defaults to `1`).
 *
 * @example
 * const form: FormDefinition = {
 *   schemaVersion: 1,
 *   title: "Invite",
 *   fields: [{ name: "email", type: "email", required: true }],
 * };
 */
export type FormDefinition = {
  schemaVersion?: 1;
  title?: string;
  description?: string;
  fields: FieldDefinition[];
};

/**
 * A structured parse issue with a JSON-pointer-like path.
 *
 * @example
 * const issue: ParseIssue = { path: "fields[0].name", message: "Invalid field name" };
 */
export type ParseIssue = {
  path: string;
  message: string;
};

/**
 * Result of parsing a form definition.
 *
 * @example
 * const result: ParseResult<FormDefinition> = parseFormDefinition(input);
 */
export type ParseResult<T> =
  | { success: true; data: T; warnings?: ParseIssue[] }
  | { success: false; error: string; issues?: ParseIssue[] };

/**
 * Result of parsing a field definition.
 *
 * @example
 * const fieldResult: ParseFieldResult<FieldDefinition> = parseField(input);
 */
export type ParseFieldResult =
  | { success: true; data: FieldDefinition; warnings?: ParseIssue[] }
  | { success: false; issues?: ParseIssue[] };

export const FIELD_TYPES: readonly FieldType[] = [
  "string",
  "email",
  "password",
  "number",
  "boolean",
  "select",
  "radio",
  "textarea",
] as const;

export const FIELD_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const FORM_DEFINITION_KEYS = new Set(["schemaVersion", "title", "description", "fields"]);

export const FIELD_DEFINITION_KEYS = new Set([
  "name",
  "type",
  "label",
  "description",
  "required",
  "placeholder",
  "defaultValue",
  "options",
  "min",
  "max",
  "minLength",
  "maxLength",
  "pattern",
  "disabled",
]);
