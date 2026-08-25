import type { FieldControlProps } from "../types.js";
import { Input, Checkbox, Textarea, Select } from "../ui/index.js";
import { Controller } from "react-hook-form";
import { cn } from "../classNames.js";

export function StringControl({
  field,
  form,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps) {
  return (
    <Input
      id={id}
      type={field.type === "string" ? "text" : field.type}
      placeholder={field.placeholder}
      disabled={disabled}
      className={className}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...form.register(field.name)}
    />
  );
}

export function NumberControl({
  field,
  form,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps) {
  return (
    <Input
      id={id}
      type="number"
      placeholder={field.placeholder}
      disabled={disabled}
      className={className}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...form.register(field.name, {
        setValueAs: (val) => (val === "" || val === null ? undefined : Number(val)),
      })}
    />
  );
}

export function BooleanControl({
  field,
  form,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps) {
  return (
    <Controller
      name={field.name}
      control={form.control}
      render={({ field: rhf }) => (
        <Checkbox
          id={id}
          checked={Boolean(rhf.value)}
          onCheckedChange={rhf.onChange}
          disabled={disabled}
          className={className}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        />
      )}
    />
  );
}

export function TextareaControl({
  field,
  form,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps) {
  return (
    <Textarea
      id={id}
      placeholder={field.placeholder}
      disabled={disabled}
      className={className}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...form.register(field.name)}
    />
  );
}

export function SelectControl({
  field,
  form,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps) {
  return (
    <Select
      id={id}
      disabled={disabled}
      className={className}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
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
}

export function RadioControl({
  field,
  form,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      role="radiogroup"
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
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
            disabled={disabled}
            {...form.register(field.name)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
