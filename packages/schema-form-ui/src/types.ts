import type { FormDefinition, FieldDefinition, FieldType } from "@aidanbell/schema-form";
import type { UseFormReturn, FieldError } from "react-hook-form";
import type { ComponentType, ReactNode } from "react";

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

export type FieldControlProps = {
  field: FieldDefinition;
  form: UseFormReturn<Record<string, unknown>>;
  id: string;
  disabled?: boolean;
  error?: FieldError;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  className?: string;
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
      component?: ComponentType<FieldControlProps>;
    }
  >;
  components?: Partial<Record<FieldType, ComponentType<FieldControlProps>>>;
  showReset?: boolean;
  submitLabel?: string;
  resetLabel?: string;
};

export type SchemaFormProps = {
  config: SchemaFormConfig;
  renderField: (
    props: FieldControlProps,
    defaultRender: (props: FieldControlProps) => ReactNode,
  ) => ReactNode;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export type SchemaFormFieldsProps = {
  definition: FormDefinition;
  config: SchemaFormConfig;
  onSubmit: SchemaFormProps["onSubmit"];
  onError?: SchemaFormProps["onError"];
};
