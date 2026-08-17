import type { FormDefinition } from "@aidanbell/schema-form";

export type SchemaFormClassNames = {
  form?: string;
  field?: string;
  label?: string;
  description?: string;
  control?: string;
  error?: string;
  actions?: string;
  submitButton?: string;
  resetButton?: string;
};

export type SchemaFormConfig = {
  schema: FormDefinition;
  defaultValues?: Record<string, unknown>;
  classNames?: SchemaFormClassNames;
  fields?: Record<
    string,
    {
      classNames?: Partial<SchemaFormClassNames>;
      hidden?: boolean;
      disabled?: boolean;
    }
  >;
  showReset?: boolean;
  submitLabel?: string;
  resetLabel?: string;
};

export type SchemaFormProps = {
  config: SchemaFormConfig;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export type SchemaFormFieldsProps = {
  definition: FormDefinition;
  config: SchemaFormConfig;
  onSubmit: SchemaFormProps["onSubmit"];
  onError?: SchemaFormProps["onError"];
};
