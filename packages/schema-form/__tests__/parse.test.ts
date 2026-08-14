import { describe, expect, it } from "vitest";
import { parseFormDefinition } from "../src/index.js";
import { issue } from "../src/errors.js";

const goldenSignup = {
  schemaVersion: 1 as const,
  title: "Sign up",
  fields: [
    { name: "email", type: "email" as const, label: "Email", required: true },
    {
      name: "role",
      type: "select" as const,
      label: "Role",
      required: true,
      options: ["admin", "viewer"],
    },
  ],
  description: "Sign up for a new account",
};

describe("parseFormDefinition", () => {
  describe("success", () => {
    it("parses a golden schema object", () => {
      const result = parseFormDefinition(goldenSignup);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.schemaVersion).toBe(1);
      expect(result.data.fields).toHaveLength(2);
      expect(result.data.title).toBe("Sign up");
    });

    it("parses a JSON string", () => {
      const result = parseFormDefinition(JSON.stringify(goldenSignup));
      expect(result.success).toBe(true);
    });

    it("should yield schemaVersion: 1 without a schemaVersion", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [{ name: "email", type: "email" as const }],
      });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.schemaVersion).toBe(1);
    });
  });

  describe("failure", () => {
    it("should yield an error when the schema is not a valid JSON object", () => {
      const result = parseFormDefinition("not a valid JSON object");
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("Invalid JSON Object");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("", "Invalid JSON Object"));
    });

    it("should yield an error when the input is not a string or object", () => {
      const result = parseFormDefinition(123);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("Form definition must be a JSON object");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("", "Form definition must be a JSON object"));
    });

    it("should yield an error when the schemaVersion is unsupported", () => {
      const result = parseFormDefinition({
        ...goldenSignup,
        schemaVersion: 2 as const,
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("schemaVersion: Unsupported schema version");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("schemaVersion", "Unsupported schema version"));
    });

    it("should yield an error when the fields array is empty", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("fields: Form must have at least one field");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("fields", "Form must have at least one field"));
    });

    it("should yield an error when the fields array is not an array", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: "not an array",
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("fields: Fields must be an array");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("fields", "Fields must be an array"));
    });

    it("should yield an error when there are duplicate field names", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [
          { name: "email", type: "email" as const },
          { name: "email", type: "email" as const },
        ],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe('fields[1].name: Duplicate field name "email"');
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("fields[1].name", 'Duplicate field name "email"'));
    });

    it("should yield an error for an invalid type", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [{ name: "email", type: "unknown" as const }],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe('fields[0].type: Unknown field type "unknown"');
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("fields[0].type", 'Unknown field type "unknown"'));
    });

    it("should yield an error for an invalid field name", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [{ name: "1bad", type: "email" as const }],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe('fields[0].name: Invalid field name "1bad"');
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("fields[0].name", 'Invalid field name "1bad"'));
    });

    it("should yield an error for a select/radio field with no options", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [{ name: "role", type: "select" as const }],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("fields[0].options: Options must be an array");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(issue("fields[0].options", "Options must be an array"));
    });

    it("should yield an error for a bad pattern", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [{ name: "email", type: "email" as const, pattern: "[" }],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("fields[0].pattern: pattern must be valid RegExp");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(
        issue("fields[0].pattern", "pattern must be valid RegExp"),
      );
    });

    it("should yield an error for min > max", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [{ name: "age", type: "number" as const, min: 10, max: 5 }],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe("fields[0].min: Min must be less or equal to max");
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(
        issue("fields[0].min", "Min must be less or equal to max"),
      );
    });

    it("should yield an error for minLength > maxLength", () => {
      const result = parseFormDefinition({
        title: "Sign up",
        fields: [{ name: "name", type: "string" as const, minLength: 10, maxLength: 5 }],
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBe(
        "fields[0].minLength: minLength must be less or equal to maxLength",
      );
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toContainEqual(
        issue("fields[0].minLength", "minLength must be less or equal to maxLength"),
      );
    });
  });

  describe("warnings", () => {
    it("should strip unknown keys and add warnings", () => {
      const result = parseFormDefinition({
        ...goldenSignup,
        unknownKey: "unknownValue",
        date: new Date(),
      });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings).toContainEqual(
        issue("unknownKey", 'Unknown key "unknownKey" was stripped'),
      );
      expect(result.warnings).toContainEqual(issue("date", 'Unknown key "date" was stripped'));
      expect(Object.keys(result.data)).toEqual(["schemaVersion", "fields", "title", "description"]);
    });
  });
});
