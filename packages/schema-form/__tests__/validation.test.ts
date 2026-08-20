import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { buildFormValidationSchema } from "../src/index.js";
import type { FieldDefinition } from "../src/types.js";

function parse(fields: FieldDefinition[], data: Record<string, unknown>) {
  return v.safeParse(buildFormValidationSchema(fields), data);
}

describe("buildFormValidationSchema", () => {
  it("implements Standard Schema v1", async () => {
    const schema = buildFormValidationSchema([
      { name: "email", type: "email", required: true },
    ]);
    expect(schema["~standard"].version).toBe(1);
    expect(schema["~standard"].vendor).toBe("valibot");

    const ok = await schema["~standard"].validate({ email: "a@b.com" });
    expect(ok.issues).toBeUndefined();

    const bad = await schema["~standard"].validate({ email: "" });
    expect(bad.issues?.length).toBeGreaterThan(0);
  });

  it("accepts a valid email and number", () => {
    const result = parse(
      [
        { name: "email", type: "email", required: true },
        { name: "age", type: "number" },
      ],
      { email: "a@b.com", age: 0 },
    );
    expect(result.success).toBe(true);
  });

  it("fails on empty required email with Required only", () => {
    const result = parse([{ name: "email", type: "email", required: true }], { email: "" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.message).toBe("Required");
  });

  it("rejects invalid email when non-empty", () => {
    const result = parse([{ name: "email", type: "email", required: true }], {
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues.some((i) => i.message === "Invalid email")).toBe(true);
  });

  it("allows empty optional email", () => {
    const result = parse([{ name: "email", type: "email" }], { email: "" });
    expect(result.success).toBe(true);
  });

  it("enforces minLength and maxLength on text fields", () => {
    const fields: FieldDefinition[] = [
      { name: "name", type: "string", required: true, minLength: 2, maxLength: 4 },
    ];
    expect(parse(fields, { name: "a" }).success).toBe(false);
    expect(parse(fields, { name: "abcd" }).success).toBe(true);
    expect(parse(fields, { name: "abcde" }).success).toBe(false);
  });

  it("enforces pattern on optional text (skips empty)", () => {
    const fields: FieldDefinition[] = [{ name: "code", type: "string", pattern: "^[A-Z]+$" }];
    expect(parse(fields, { code: "" }).success).toBe(true);
    expect(parse(fields, { code: "ABC" }).success).toBe(true);
    expect(parse(fields, { code: "ab" }).success).toBe(false);
  });

  it("validates password like string", () => {
    const fields: FieldDefinition[] = [
      { name: "password", type: "password", required: true, minLength: 8 },
    ];
    expect(parse(fields, { password: "short" }).success).toBe(false);
    expect(parse(fields, { password: "longenough" }).success).toBe(true);
  });

  it("validates optional textarea with no constraints", () => {
    const result = parse([{ name: "bio", type: "textarea" }], { bio: "hello" });
    expect(result.success).toBe(true);
  });

  it("transforms empty optional number to undefined", () => {
    const result = parse([{ name: "age", type: "number" }], { age: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.output).toEqual({ age: undefined });
  });

  it("accepts undefined optional number", () => {
    const result = parse([{ name: "age", type: "number" }], { age: undefined });
    expect(result.success).toBe(true);
  });

  it("rejects required number when empty or undefined", () => {
    const fields: FieldDefinition[] = [{ name: "age", type: "number", required: true }];
    expect(parse(fields, { age: "" }).success).toBe(false);
    expect(parse(fields, { age: undefined }).success).toBe(false);
    expect(parse(fields, { age: 3 }).success).toBe(true);
  });

  it("enforces number min and max", () => {
    const fields: FieldDefinition[] = [{ name: "age", type: "number", min: 18, max: 65 }];
    expect(parse(fields, { age: 17 }).success).toBe(false);
    expect(parse(fields, { age: 30 }).success).toBe(true);
    expect(parse(fields, { age: 66 }).success).toBe(false);
    expect(parse(fields, { age: "" }).success).toBe(true);
  });

  it("requires true for required boolean", () => {
    const fields: FieldDefinition[] = [{ name: "agree", type: "boolean", required: true }];
    expect(parse(fields, { agree: true }).success).toBe(true);
    expect(parse(fields, { agree: false }).success).toBe(false);
  });

  it("accepts any boolean when optional", () => {
    const fields: FieldDefinition[] = [{ name: "flag", type: "boolean" }];
    expect(parse(fields, { flag: false }).success).toBe(true);
    expect(parse(fields, { flag: true }).success).toBe(true);
  });

  it("validates required select against options", () => {
    const fields: FieldDefinition[] = [
      {
        name: "role",
        type: "select",
        required: true,
        options: [
          { label: "Admin", value: "admin" },
          { label: "Viewer", value: "viewer" },
        ],
      },
    ];
    expect(parse(fields, { role: "" }).success).toBe(false);
    expect(parse(fields, { role: "admin" }).success).toBe(true);
    expect(parse(fields, { role: "other" }).success).toBe(false);
  });

  it("allows empty optional radio", () => {
    const fields: FieldDefinition[] = [
      {
        name: "plan",
        type: "radio",
        options: [
          { label: "Free", value: "free" },
          { label: "Pro", value: "pro" },
        ],
      },
    ];
    expect(parse(fields, { plan: "" }).success).toBe(true);
    expect(parse(fields, { plan: "pro" }).success).toBe(true);
  });
});
