import * as v from "valibot";
import type { FieldDefinition } from "./types.js";

export type FormValidationSchema = v.GenericSchema;

function buildFieldSchema(field: FieldDefinition): FormValidationSchema {
  switch (field.type) {
    case "string":
    case "password":
    case "textarea":
    case "email":
      return buildTextSchema(field);
    case "number":
      return buildNumberSchema(field);
    case "boolean":
      return buildBooleanSchema(field);
    case "select":
    case "radio":
      return buildSelectSchema(field);
  }
}

export function buildFormValidationSchema(fields: FieldDefinition[]): FormValidationSchema {
  const shape: Record<string, FormValidationSchema> = {};
  for (const field of fields) {
    shape[field.name] = buildFieldSchema(field);
  }
  return v.object(shape);
}

function buildTextSchema(field: FieldDefinition) {
  const steps: v.BaseValidation<string, string, v.BaseIssue<string>>[] = [];

  if (field.required) {
    steps.push(v.nonEmpty("Required"));
  }
  if (field.type === "email") {
    steps.push(
      v.check(
        (value) => value === "" || v.safeParse(v.pipe(v.string(), v.email()), value).success,
        "Invalid email",
      ),
    );
  }
  if (field.minLength !== undefined) {
    steps.push(
      v.check(
        (value) => value === "" || value.length >= field.minLength!,
        `Must be at least ${field.minLength} characters`,
      ),
    );
  }
  if (field.maxLength !== undefined) {
    steps.push(
      v.check(
        (value) => value === "" || value.length <= field.maxLength!,
        `Must be at most ${field.maxLength} characters`,
      ),
    );
  }
  if (field.pattern) {
    const re = new RegExp(field.pattern);
    steps.push(v.check((value) => value === "" || re.test(value), "Invalid format"));
  }

  const constrained = steps.length > 0 ? v.pipe(v.string(), ...steps) : v.string();

  if (field.required) {
    return constrained;
  } else {
    return v.union([v.literal(""), constrained]);
  }
}

function buildNumberSchema(field: FieldDefinition) {
  return v.pipe(
    v.union([v.number(), v.literal(""), v.undefined()]),
    v.check(
      (value) => !(field.required === true && (value === "" || value === undefined)),
      "Required",
    ),
    v.check(
      (value) =>
        value === "" || value === undefined || field.min === undefined || value >= field.min,
      `Must be at least ${field.min}`,
    ),
    v.check(
      (value) =>
        value === "" || value === undefined || field.max === undefined || value <= field.max,
      `Must be at most ${field.max}`,
    ),
    v.transform((value) => (value === "" ? undefined : value)),
  );
}

function buildBooleanSchema(field: FieldDefinition) {
  if (field.required) {
    return v.literal(true);
  } else {
    return v.boolean();
  }
}

function buildSelectSchema(field: FieldDefinition) {
  const picklist = v.picklist(field.options?.map((option) => option.value) ?? []);

  if (field.required) {
    return v.pipe(v.string(), v.nonEmpty("Required"), picklist);
  } else {
    return v.union([v.literal(""), picklist]);
  }
}
