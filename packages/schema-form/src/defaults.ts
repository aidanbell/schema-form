import type { FieldDefinition } from "./types";

function defaultForType(field: FieldDefinition): unknown {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  switch (field.type) {
    case "number":
      return undefined;
    case "boolean":
      return false;
    case "string":
    case "email":
    case "password":
    case "textarea":
    case "select":
    case "radio":
      return "";
  }
}

/**
 * Build default form values from field definitions.
 *
 * @example
 * getDefaultValues([{ name: "agree", type: "boolean" }])
 * // => { agree: false }
 */
export function getDefaultValues(fields: FieldDefinition[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    values[field.name] = defaultForType(field);
  }
  return values;
}
