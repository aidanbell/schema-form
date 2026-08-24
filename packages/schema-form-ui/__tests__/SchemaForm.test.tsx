import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect, vi } from "vitest";
import { SchemaForm } from "../src/index.js";
import type { FieldControlProps } from "../src/types.js";

const goldenSignup = {
  schemaVersion: 1 as const,
  title: "Sign up",
  fields: [
    { name: "email", type: "email" as const, label: "Email", required: true },
    {
      name: "role",
      type: "select" as const,
      label: "Role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Viewer", value: "viewer" },
      ],
    },
  ],
  description: "Sign up for a new account",
};

function FakeControl({ id }: FieldControlProps) {
  return <input id={id} data-testid="fake-control" />;
}

function OtherFakeControl({ id }: FieldControlProps) {
  return <input id={id} data-testid="other-fake-control" />;
}

afterEach(() => {
  cleanup();
});

describe("SchemaForm", () => {
  it("should render error UI on invalid schema", () => {
    const onError = vi.fn();
    render(<SchemaForm config={{ schema: { fields: [] } }} onSubmit={vi.fn()} onError={onError} />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(onError).toHaveBeenCalled();
  });

  it("should error on empty required fields", async () => {
    const onSubmit = vi.fn();
    const onError = vi.fn();
    render(<SchemaForm config={{ schema: goldenSignup }} onSubmit={onSubmit} onError={onError} />);
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
      expect(screen.getByText(/^Required$/i)).toBeTruthy();
    });
  });

  it("should submit a valid form", async () => {
    const onSubmit = vi.fn();
    const onError = vi.fn();
    render(<SchemaForm config={{ schema: goldenSignup }} onSubmit={onSubmit} onError={onError} />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.selectOptions(screen.getByLabelText(/role/i), "admin");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ email: "a@b.com", role: "admin" }),
      );
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it("should error on bad data", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("bad data"));
    const onError = vi.fn();
    render(<SchemaForm config={{ schema: goldenSignup }} onSubmit={onSubmit} onError={onError} />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.selectOptions(screen.getByLabelText(/role/i), "admin");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it("should honor config.fields overrides", () => {
    render(
      <SchemaForm
        config={{
          schema: goldenSignup,
          fields: { email: { hidden: true }, role: { disabled: true } },
        }}
        onSubmit={vi.fn()}
        onError={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText(/email/i)).toBeNull();
    expect(screen.getByLabelText(/role/i)).toHaveProperty("disabled", true);
  });

  it("should honor labels and hide reset when configured", async () => {
    render(
      <SchemaForm
        config={{
          schema: goldenSignup,
          showReset: false,
          submitLabel: "Create account",
          classNames: { form: "demo-form", submitButton: "demo-submit" },
        }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /reset/i })).toBeNull();
    expect(screen.getByRole("button", { name: /create account/i })).toBeTruthy();
  });

  it("should reset field values", async () => {
    render(
      <SchemaForm config={{ schema: goldenSignup, resetLabel: "Clear" }} onSubmit={vi.fn()} />,
    );
    const email = screen.getByLabelText(/email/i);
    await userEvent.type(email, "a@b.com");
    expect(email).toHaveProperty("value", "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(email).toHaveProperty("value", "");
  });

  it("renders a components-map override instead of a built-in", () => {
    render(
      <SchemaForm
        config={{ schema: goldenSignup, components: { select: FakeControl } }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByTestId("fake-control")).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText(/^Role$/)).toBeTruthy();
  });

  it("per-field component wins over the components-map override", () => {
    render(
      <SchemaForm
        config={{
          schema: goldenSignup,
          components: { select: FakeControl },
          fields: { role: { component: OtherFakeControl } },
        }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("fake-control")).toBeNull();
    expect(screen.getByTestId("other-fake-control")).toBeTruthy();
  });

  it("delivers error and aria props to custom controls", async () => {
    const seen: Array<FieldControlProps> = [];
    function SpyControl(props: FieldControlProps) {
      seen.push(props);
      return <input id={props.id} />;
    }
    render(
      <SchemaForm
        config={{ schema: goldenSignup, components: { email: SpyControl } }}
        onSubmit={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      const last = seen.at(-1);
      expect(last?.["aria-invalid"]).toBe(true);
      expect(last?.error?.message).toBe("Required");
      expect(last?.["aria-describedby"]).toContain("email-error");
    });
  });
});
