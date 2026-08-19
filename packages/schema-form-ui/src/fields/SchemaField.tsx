import type { FieldDefinition } from "@aidanbell/schema-form";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { SchemaFormClassNames } from "../types";
import { cn } from "../classNames.js";
import { Checkbox, Input, Select, Textarea, Label } from "../ui/index.js";

type SchemaFieldProps = {
  field: FieldDefinition;
  form: UseFormReturn<Record<string, unknown>>;
  classNames?: SchemaFormClassNames;
  disabled?: boolean;
};

export function SchemaField({ field, form, classNames, disabled }: SchemaFieldProps) {
  const id = field.name;
  const error = form.formState.errors[field.name];
  const isDisabled = disabled || field.disabled;
  const errorId = `${id}-error`;
  const descId = `${id}-description`;
  const describedBy =
    [field.description ? descId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  let control: React.ReactNode;
  switch (field.type) {
    case "string":
    case "email":
    case "password":
      control = (
        <Input
          id={id}
          type={field.type === "string" ? "text" : field.type}
          placeholder={field.placeholder}
          disabled={isDisabled}
          className={cn(classNames?.control)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...form.register(field.name)}
        />
      );
      break;
    case "number":
      control = (
        <Input
          id={id}
          type="number"
          placeholder={field.placeholder}
          disabled={isDisabled}
          className={cn(classNames?.control)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...form.register(field.name, {
            setValueAs: (val) => (val === "" || val === null ? undefined : Number(val)),
          })}
        />
      );
      break;
    case "boolean":
      control = (
        <Controller
          name={field.name}
          control={form.control}
          render={({ field: rhf }) => (
            <Checkbox
              id={id}
              checked={Boolean(rhf.value)}
              onCheckedChange={rhf.onChange}
              disabled={isDisabled}
              className={cn(classNames?.control)}
              aria-invalid={!!error}
              aria-describedby={describedBy}
            />
          )}
        />
      );
      break;
    case "textarea":
      control = (
        <Textarea
          id={id}
          placeholder={field.placeholder}
          disabled={isDisabled}
          className={cn(classNames?.control)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...form.register(field.name)}
        />
      );
      break;
    case "select":
      control = (
        <Select
          id={id}
          disabled={isDisabled}
          className={cn(classNames?.control)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...form.register(field.name)}
        >
          <option value="" disabled hidden>
            {field.placeholder ?? "Select..."}
          </option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
      break;
    case "radio":
      control = (
        <div
          className={cn("flex flex-wrap items-center gap-3", classNames?.control)}
          role="radiogroup"
          aria-describedby={describedBy}
          aria-invalid={!!error}
        >
          {field.options?.map((option) => (
            <label
              key={option.value}
              htmlFor={`${id}-${option.value}`}
              className="flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-50"
            >
              <input
                id={`${id}-${option.value}`}
                type="radio"
                value={option.value}
                disabled={isDisabled}
                {...form.register(field.name)}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
      break;
  }

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
