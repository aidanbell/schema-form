import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { SchemaField } from "../src/index.js";
import { useForm } from "react-hook-form";
import type { FieldDefinition } from "@aidanbell/schema-form";

function Form({ field, disabled }: { field: FieldDefinition; disabled?: boolean }) {
  const form = useForm<Record<string, unknown>>({
    defaultValues: {
      [field.name]: field.type === "boolean" ? false : "",
    },
  });
  // Mirrors buildFieldControlProps in SchemaForm: derive the control props
  // the same way the real form does.
  const error = form.formState.errors[field.name];
  const describedBy =
    [field.description ? `${field.name}-description` : null, error ? `${field.name}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <SchemaField
      field={field}
      form={form}
      error={error}
      id={field.name}
      disabled={disabled || field.disabled}
      aria-invalid={!!error}
      aria-describedby={describedBy}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe("SchemaField", () => {
  it("should render a string field", () => {
    render(<Form field={{ name: "name", type: "string", label: "Name" }} />);
    expect(screen.getByLabelText(/^Name$/)).toBeTruthy();
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("should render a number field", () => {
    render(<Form field={{ name: "age", type: "number", label: "Age" }} />);
    expect(screen.getByLabelText(/^Age$/)).toBeTruthy();
    expect(screen.getByRole("spinbutton")).toBeTruthy();
  });

  it("should render a boolean field", () => {
    render(
      <Form
        field={{
          name: "subscribe",
          type: "boolean",
          label: "Subscribe",
          description: "Get product updates",
        }}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeTruthy();
    expect(screen.getByLabelText(/Subscribe/)).toBeTruthy();
    expect(screen.getByText(/Get product updates/i)).toBeTruthy();
  });

  it("should render a textarea field", () => {
    render(<Form field={{ name: "bio", type: "textarea", label: "Bio" }} />);
    expect(screen.getByLabelText(/^Bio$/)).toBeTruthy();
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("should render a select field", () => {
    render(
      <Form
        field={{
          name: "role",
          type: "select",
          label: "Role",
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        }}
      />,
    );
    expect(screen.getByLabelText(/^Role$/)).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Admin" })).toBeTruthy();
  });

  it("should render a password field", () => {
    render(<Form field={{ name: "password", type: "password", label: "Password" }} />);
    expect(screen.getByLabelText(/^Password$/)).toHaveProperty("type", "password");
  });

  it("should render a radio field with labels", () => {
    render(
      <Form
        field={{
          name: "dessert",
          type: "radio",
          label: "Dessert",
          options: [
            { label: "Ice cream", value: "ice_cream" },
            { label: "Cake", value: "cake" },
            { label: "Cookies", value: "cookies" },
          ],
        }}
      />,
    );
    expect(screen.getByText(/^Dessert$/)).toBeTruthy();
    expect(screen.getByRole("radiogroup")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByLabelText(/Ice cream/i)).toBeTruthy();
  });

  it("should render a field description", () => {
    render(<Form field={{ name: "name", type: "string", description: "Enter your name" }} />);
    expect(screen.getByText(/Enter your name/i)).toBeTruthy();
  });

  it("should render a disabled field disabled", () => {
    render(<Form field={{ name: "name", type: "string" }} disabled={true} />);
    expect(screen.getByRole("textbox")).toHaveProperty("disabled", true);
  });

  it("should render a required field", () => {
    render(<Form field={{ name: "name", type: "string", label: "Name", required: true }} />);
    expect(screen.getByLabelText(/Name/)).toBeTruthy();
    expect(screen.getByText(/\*/i)).toBeTruthy();
  });

  it("should render a select placeholder for required fields", () => {
    render(
      <Form
        field={{
          name: "role",
          type: "select",
          label: "Role",
          required: true,
          options: [{ label: "Admin", value: "admin" }],
        }}
      />,
    );
    const placeholder = screen.getByText("Select...");
    expect(placeholder.tagName).toBe("OPTION");
    expect(placeholder).toHaveProperty("disabled", true);
  });
});
