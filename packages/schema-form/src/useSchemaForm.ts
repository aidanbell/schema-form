import { useMemo } from "react";
import { UseSchemaFormOptions, UseSchemaFormResult } from "./types.js";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { buildFormValidationSchema, type FormValidationSchema } from "./validation.js";
import { getDefaultValues } from "./defaults.js";

export function useSchemaForm(options: UseSchemaFormOptions): UseSchemaFormResult {
  const { definition, defaultValues, onSubmit } = options;

  const validationSchema: FormValidationSchema = useMemo(
    () => buildFormValidationSchema(definition.fields),
    [definition.fields],
  );

  const resolvedDefaults = useMemo(
    () => ({ ...getDefaultValues(definition.fields), ...defaultValues }),
    [definition.fields, defaultValues],
  );

  const form = useForm<Record<string, unknown>>({
    resolver: valibotResolver(validationSchema as never),
    defaultValues: resolvedDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit?.(values);
  });

  return {
    fields: definition.fields,
    form,
    handleSubmit,
    validationSchema,
  };
}
