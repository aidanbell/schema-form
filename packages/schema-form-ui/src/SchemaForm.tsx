import { parseFormDefinition, useSchemaForm } from "@aidanbell/schema-form";
import type { SchemaFormProps, SchemaFormFieldsProps } from "./types.js";
import { useEffect, useMemo } from "react";
import { cn, mergeClassNames } from "./classNames.js";
import { SchemaField } from "./fields/SchemaField.js";
import { Button } from "./ui/Button.js";

export function SchemaForm({ config, onSubmit, onError }: SchemaFormProps) {
  const parsed = useMemo(() => parseFormDefinition(config.schema), [config.schema]);

  useEffect(() => {
    if (!parsed.success) onError?.(parsed);
  }, [parsed, onError]);

  if (!parsed.success) {
    return (
      <div
        role="alert"
        className={cn("rounded-sm border border-red-500 bg-red-50 p-4", config.classNames?.error)}
      >
        <p className="text-sm text-red-500">{String(parsed.error ?? "Invalid form definition")}</p>
        <ul className="list-disc list-inside">
          {parsed.issues &&
            parsed.issues.length > 0 &&
            parsed.issues.map((issue, idx) => (
              <li key={`${issue.path}-${idx}`}>
                {issue.path ? `${issue.path}: ${issue.message}` : issue.message}
              </li>
            ))}
        </ul>
      </div>
    );
  }

  return (
    <SchemaFormFields
      definition={parsed.data}
      config={config}
      onSubmit={onSubmit}
      onError={onError}
    />
  );
}

function SchemaFormFields({ definition, config, onSubmit, onError }: SchemaFormFieldsProps) {
  const { fields, form, handleSubmit } = useSchemaForm({
    definition,
    defaultValues: config.defaultValues,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        onError?.(error);
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", config.classNames?.form)}>
      {definition.title && <h2 className="text-xl font-bold">{definition.title}</h2>}
      {definition.description && (
        <p className={cn("text-sm text-zinc-500", config.classNames?.description)}>
          {definition.description}
        </p>
      )}
      {fields.map((field) => {
        const override = config.fields?.[field.name];
        if (override?.hidden) return null;
        return (
          <SchemaField
            key={field.name}
            field={field}
            form={form}
            disabled={override?.disabled}
            classNames={mergeClassNames(config.classNames, override?.classNames)}
            components={config.components}
            component={override?.component}
          />
        );
      })}
      <div className={cn("flex justify-end gap-2", config.classNames?.actions)}>
        {(config.showReset ?? true) && (
          <Button
            type="button"
            className={config.classNames?.resetButton}
            onClick={() => form.reset()}
          >
            {config.resetLabel ?? "Reset"}
          </Button>
        )}
        <Button type="submit" className={config.classNames?.submitButton}>
          {config.submitLabel ?? "Submit"}
        </Button>
      </div>
    </form>
  );
}
