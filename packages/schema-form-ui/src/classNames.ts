import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SchemaFormClassNames } from "./types.js";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function mergeClassNames(
  base?: SchemaFormClassNames,
  override?: Partial<SchemaFormClassNames>,
): SchemaFormClassNames {
  return {
    form: cn(base?.form, override?.form),
    field: cn(base?.field, override?.field),
    label: cn(base?.label, override?.label),
    description: cn(base?.description, override?.description),
    control: cn(base?.control, override?.control),
    error: cn(base?.error, override?.error),
    actions: cn(base?.actions, override?.actions),
    submitButton: cn(base?.submitButton, override?.submitButton),
    resetButton: cn(base?.resetButton, override?.resetButton),
  };
}
