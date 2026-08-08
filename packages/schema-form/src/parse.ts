import type {
  FormDefinition,
  ParseIssue,
  ParseResult,
  FieldDefinition,
  FieldType,
  ParseFieldResult,
} from "./types.js";
import { FIELD_TYPES, FIELD_NAME_PATTERN } from "./types.js";
import { issue, formatParseError } from "./errors.js";

export function parseFormDefinition(definition: string | unknown): ParseResult<FormDefinition> {
  let data: unknown;
  const issues: ParseIssue[] = [];

  if (typeof definition === "string") {
    try {
      data = JSON.parse(definition);
    } catch {
      const JSONIssue = issue("", "Invalid JSON Object");
      return { success: false, error: formatParseError([JSONIssue]), issues: [JSONIssue] };
    }
  } else {
    data = definition;
  }

  if (!isPlainObject(data)) {
    const objectIssue = issue("", "Form definition must be a JSON object");
    return { success: false, error: formatParseError([objectIssue]), issues: [objectIssue] };
  }

  const { schemaVersion, title, description, fields, ...rest } = data;

  if (title !== undefined && !isString(title)) {
    issues.push(issue("title", "Title must be a string"));
  }

  if (description !== undefined && !isString(description)) {
    issues.push(issue("description", "Description must be a string"));
  }

  if (schemaVersion !== undefined && schemaVersion !== 1) {
    issues.push(issue("schemaVersion", "Unsupported schema version"));
  }

  if (!Array.isArray(fields)) {
    issues.push(issue("fields", "Fields must be an array"));
    return { success: false, error: formatParseError(issues), issues };
  } else if (fields.length === 0) {
    issues.push(issue("fields", "Form must have at least one field"));
    return { success: false, error: formatParseError(issues), issues };
  }

  const warnings: ParseIssue[] = [];
  const parsedFields: FieldDefinition[] = [];
  const seenNames: Set<string> = new Set();

  for (const [index, field] of fields.entries()) {
    const result = parseField(field, index);

    if (!result.success) {
      issues.push(...(result.issues ?? []));
      continue;
    }

    warnings.push(...(result.warnings ?? []));

    if (seenNames.has(result.data.name)) {
      issues.push(issue(`fields[${index}].name`, `Duplicate field name "${result.data.name}"`));
    } else {
      seenNames.add(result.data.name);
      parsedFields.push(result.data);
    }
  }

  if (issues.length > 0) {
    return { success: false, error: formatParseError(issues), issues };
  }

  if (rest !== undefined && Object.keys(rest).length > 0) {
    Object.keys(rest).forEach((key) => {
      warnings.push(issue(`${key}`, `Unknown key "${key}" was stripped`));
    });
  }

  const form: FormDefinition = {
    schemaVersion: 1,
    fields: parsedFields,
  };

  if (isString(title)) form.title = title;
  if (isString(description)) form.description = description;

  return { success: true, data: form, warnings: warnings.length > 0 ? warnings : undefined };
}

const parseField = (field: unknown, index: number): ParseFieldResult => {
  const issues: ParseIssue[] = [];
  const warnings: ParseIssue[] = [];

  if (!isPlainObject(field)) {
    issues.push(issue(`fields[${index}]`, "Field must be an object"));
    return { success: false, issues };
  }

  const {
    name,
    type,
    label,
    description,
    required,
    placeholder,
    defaultValue,
    options,
    min,
    max,
    minLength,
    maxLength,
    pattern,
    disabled,
    ...rest
  } = field;

  let parsedName: string | undefined;
  if (!isString(name) || name.length === 0) {
    issues.push(issue(`fields[${index}].name`, "Field must have a name"));
  } else if (isString(name) && !FIELD_NAME_PATTERN.test(name)) {
    issues.push(issue(`fields[${index}].name`, `Invalid field name "${name}"`));
  } else {
    parsedName = name;
  }

  let parsedType: FieldType | undefined;
  if (!isString(type) || type.length === 0) {
    issues.push(issue(`fields[${index}].type`, "Field must have a type"));
  } else if (!isFieldType(type)) {
    issues.push(issue(`fields[${index}].type`, `Unknown field type "${type}"`));
  } else {
    parsedType = type;
  }

  const parsedLabel = readOptionalString(label, `fields[${index}].label`, issues);
  const parsedDescription = readOptionalString(description, `fields[${index}].description`, issues);
  const parsedRequired = readOptionalBoolean(required, `fields[${index}].required`, issues);
  const parsedPlaceholder = readOptionalString(placeholder, `fields[${index}].placeholder`, issues);

  let parsedDefaultValue: string | number | boolean | undefined;
  if (
    defaultValue !== undefined &&
    !isString(defaultValue) &&
    !isNumber(defaultValue) &&
    !isBoolean(defaultValue)
  ) {
    issues.push(
      issue(`fields[${index}].defaultValue`, "DefaultValue must be a string, number, or boolean"),
    );
  } else if (isString(defaultValue) || isNumber(defaultValue) || isBoolean(defaultValue)) {
    parsedDefaultValue = defaultValue;
  }

  const parsedOptions: string[] = [];
  if (type === "select" || type === "radio") {
    if (!options || !Array.isArray(options)) {
      issues.push(issue(`fields[${index}].options`, "Options must be an array"));
    } else if (options.length === 0) {
      issues.push(issue(`fields[${index}].options`, "Options must have at least one value"));
    } else {
      for (const [optionIndex, option] of options.entries()) {
        if (!isString(option)) {
          issues.push(issue(`fields[${index}].options[${optionIndex}]`, "Option must be a string"));
        } else {
          parsedOptions.push(option);
        }
      }
    }
  }

  const parsedMin = readOptionalNumber(min, `fields[${index}].min`, issues);
  const parsedMax = readOptionalNumber(max, `fields[${index}].max`, issues);

  if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
    issues.push(issue(`fields[${index}].min`, "Min must be less or equal to max"));
  }

  const parsedMinLength = readOptionalNumber(minLength, `fields[${index}].minLength`, issues);
  const parsedMaxLength = readOptionalNumber(maxLength, `fields[${index}].maxLength`, issues);

  if (
    parsedMinLength !== undefined &&
    parsedMaxLength !== undefined &&
    parsedMinLength > parsedMaxLength
  ) {
    issues.push(
      issue(`fields[${index}].minLength`, "minLength must be less or equal to maxLength"),
    );
  }

  const parsedPattern = readOptionalString(pattern, `fields[${index}].pattern`, issues);
  if (parsedPattern !== undefined) {
    try {
      void new RegExp(parsedPattern);
    } catch {
      issues.push(issue(`fields[${index}].pattern`, "pattern must be valid RegExp"));
    }
  }

  const parsedDisabled = readOptionalBoolean(disabled, `fields[${index}].disabled`, issues);

  if (issues.length > 0) {
    return { success: false, issues };
  }

  if (rest !== undefined && Object.keys(rest).length > 0) {
    Object.keys(rest).forEach((key) => {
      warnings.push(issue(`fields[${index}].${key}`, `Unknown key "${key}" was stripped`));
    });
  }

  if (parsedName === undefined || parsedType === undefined) {
    return { success: false, issues };
  }

  const data: FieldDefinition = {
    name: parsedName,
    type: parsedType,
  };

  if (parsedLabel !== undefined) data.label = parsedLabel;
  if (parsedDescription !== undefined) data.description = parsedDescription;
  if (parsedRequired !== undefined) data.required = parsedRequired;
  if (parsedPlaceholder !== undefined) data.placeholder = parsedPlaceholder;
  if (parsedDefaultValue !== undefined) data.defaultValue = parsedDefaultValue;
  if (parsedOptions.length > 0) data.options = parsedOptions;
  if (parsedMin !== undefined) data.min = parsedMin;
  if (parsedMax !== undefined) data.max = parsedMax;
  if (parsedMinLength !== undefined) data.minLength = parsedMinLength;
  if (parsedMaxLength !== undefined) data.maxLength = parsedMaxLength;
  if (parsedPattern !== undefined) data.pattern = parsedPattern;
  if (parsedDisabled !== undefined) data.disabled = parsedDisabled;

  return { success: true, data, warnings: warnings };
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && value !== null && value !== undefined && !isNaN(value as number);

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

const isFieldType = (value: unknown): value is FieldType =>
  (FIELD_TYPES as readonly FieldType[]).includes(value as FieldType);

const readOptionalString = (
  value: unknown,
  path: string,
  issues: ParseIssue[],
): string | undefined => {
  if (value === undefined) return undefined;
  if (!isString(value)) {
    issues.push(issue(path, "Value must be a string"));
    return undefined;
  }
  return value;
};

const readOptionalNumber = (
  value: unknown,
  path: string,
  issues: ParseIssue[],
): number | undefined => {
  if (value === undefined) return undefined;
  if (!isNumber(value)) {
    issues.push(issue(path, "Value must be a number"));
    return undefined;
  }
  return value;
};

const readOptionalBoolean = (
  value: unknown,
  path: string,
  issues: ParseIssue[],
): boolean | undefined => {
  if (value === undefined) return undefined;
  if (!isBoolean(value)) {
    issues.push(issue(path, "Value must be a boolean"));
    return undefined;
  }
  return value;
};
