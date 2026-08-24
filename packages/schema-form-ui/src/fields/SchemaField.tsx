import type { FieldDefinition, FieldType } from "@aidanbell/schema-form";
import type { UseFormReturn } from "react-hook-form";
import type { FieldControlProps, SchemaFormClassNames, SchemaFormConfig } from "../types.js";
import { cn } from "../classNames.js";
import type { ComponentType } from "react";
import {
  BooleanControl,
  NumberControl,
  RadioControl,
  SelectControl,
  StringControl,
  TextareaControl,
} from "./controls";
import { Label } from "../ui/index.js";

type SchemaFieldProps = {
  field: FieldDefinition;
  form: UseFormReturn<Record<string, unknown>>;
  classNames?: SchemaFormClassNames;
  disabled?: boolean;
  components?: SchemaFormConfig["components"];
  component?: ComponentType<FieldControlProps>;
};

const builtInControls: Record<FieldType, ComponentType<FieldControlProps>> = {
  string: StringControl,
  email: StringControl,
  password: StringControl,
  number: NumberControl,
  boolean: BooleanControl,
  textarea: TextareaControl,
  select: SelectControl,
  radio: RadioControl,
};

function resolveControl(
  type: FieldType,
  component?: ComponentType<FieldControlProps>,
  components?: SchemaFormConfig["components"],
) {
  return component ?? components?.[type] ?? builtInControls[type] ?? (() => null);
}

export function SchemaField({
  field,
  form,
  classNames,
  disabled,
  components,
  component,
}: SchemaFieldProps) {
  const id = field.name;
  const error = form.formState.errors[field.name];
  const isDisabled = disabled || field.disabled;
  const errorId = `${id}-error`;
  const descId = `${id}-description`;
  const describedBy =
    [field.description ? descId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const Control = resolveControl(field.type, component, components);
  const control = (
    <Control
      field={field}
      form={form}
      error={error}
      id={id}
      disabled={isDisabled}
      aria-invalid={!!error}
      aria-describedby={describedBy}
      className={cn(classNames?.control)}
    />
  );

  const labelContent = (
    <>
      {field.label ?? field.name}
      {field.required && <span className="text-red-500">*</span>}
    </>
  );

  const description = field.description ? (
    <p id={descId} className={cn("text-sm text-zinc-500", classNames?.description)}>
      {field.description}
    </p>
  ) : null;

  const errorMessage = error ? (
    <p id={errorId} role="alert" className={cn("text-sm text-red-500", classNames?.error)}>
      {String(error.message ?? "Invalid value")}
    </p>
  ) : null;

  // Radios: fieldset/legend names the group (no single control for htmlFor).
  if (field.type === "radio") {
    return (
      <fieldset className={cn("m-0 space-y-1 border-0 p-0", classNames?.field)}>
        <legend className={cn("text-sm font-medium", classNames?.label)}>{labelContent}</legend>
        {description}
        {control}
        {errorMessage}
      </fieldset>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className={cn("space-y-1", classNames?.field)}>
        <div className="flex items-center gap-2">
          {control}
          <Label htmlFor={id} className={cn("text-sm font-medium", classNames?.label)}>
            {labelContent}
          </Label>
        </div>
        {description}
        {errorMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", classNames?.field)}>
      <Label htmlFor={id} className={cn("text-sm font-medium", classNames?.label)}>
        {labelContent}
      </Label>
      {description}
      {control}
      {errorMessage}
    </div>
  );
}
