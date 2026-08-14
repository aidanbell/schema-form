import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSchemaForm } from "../src/index.js";
import type { FormDefinition } from "../src/types.js";

const definition: FormDefinition = {
  schemaVersion: 1,
  fields: [
    { name: "email", type: "email" as const, required: true },
    { name: "age", type: "number" as const },
  ],
};

describe("useSchemaForm", () => {
  it("should return proper defaults", () => {
    const { result } = renderHook(() => useSchemaForm({ definition }));
    expect(result.current.form.getValues()).toEqual({
      email: "",
      age: undefined,
    });
  });

  it("should handle a valid submit", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useSchemaForm({ definition, onSubmit }));
    await act(async () => {
      result.current.form.setValue("email", "a@b.com");
      await result.current.handleSubmit();
    });
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: "a@b.com" }));
  });

  it("should handle an invalid submit", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => {
      const sf = useSchemaForm({ definition, onSubmit });
      void sf.form.formState.errors;
      return sf;
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.form.formState.errors.email).toBeTruthy();
    });
  });
});
