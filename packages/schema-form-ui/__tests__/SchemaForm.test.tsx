import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect, vi } from "vitest";
import { SchemaForm } from "../src/index.js";

const goldenSignup = {
  schemaVersion: 1 as const,
  title: "Sign up",
  fields: [
    { name: "email", type: "email" as const, label: "Email", required: true },
    {
      name: "role",
      type: "select" as const,
      label: "Role",
      options: ["admin", "viewer"],
    },
  ],
  description: "Sign up for a new account",
};

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
});
