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
  return <SchemaField field={field} form={form} disabled={disabled} />;
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
    render(<Form field={{ name: "subscribe", type: "boolean", label: "Subscribe" }} />);
    expect(screen.getByRole("checkbox")).toBeTruthy();
  });

  it("should render a textarea field", () => {
    render(<Form field={{ name: "bio", type: "textarea", label: "Bio" }} />);
    expect(screen.getByLabelText(/^Bio$/)).toBeTruthy();
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("should render a select field", () => {
    render(
      <Form field={{ name: "role", type: "select", label: "Role", options: ["admin", "user"] }} />,
    );
    expect(screen.getByLabelText(/^Role$/)).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("should render a radio field", () => {
    render(
      <Form
        field={{
          name: "dessert",
          type: "radio",
          label: "Dessert",
          options: ["ice cream", "cake", "cookies"],
        }}
      />,
    );
    expect(screen.getByText(/^Dessert$/)).toBeTruthy();
    expect(screen.getByRole("radiogroup")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByLabelText(/ice cream/i)).toBeTruthy();
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

  it("should render a select placeholder", () => {
    render(
      <Form
        field={{ name: "role", type: "select", label: "Role", placeholder: "Select a role" }}
      />,
    );
    expect(screen.getByText(/Select a role/i)).toBeTruthy();
  });
});
