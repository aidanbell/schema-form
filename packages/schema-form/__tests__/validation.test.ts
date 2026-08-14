import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { buildFormValidationSchema } from "../src/index.js";

const schema = buildFormValidationSchema([
  { name: "email", type: "email", required: true },
  { name: "age", type: "number" },
]);

describe("buildFormValidationSchema", () => {
  it("builds a validation schema from a form definition", () => {
    const result = v.safeParse(schema, { email: "a@b.com", age: 0 });
    expect(result.success).toBe(true);
    expect(result.issues).toBe(undefined);
  });
  it("fails on empty required field", () => {
    const result = v.safeParse(schema, { email: "", age: "" });
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues?.[0].message).toBe("Required");
  });
});
