import { describe, expect, it } from "vitest";
import { formatParseError, issue } from "../src/errors.js";

describe("formatParseError", () => {
  it("should produce a fallback error message when no issues are provided", () => {
    const result = formatParseError([]);
    expect(result).toBe("Invalid form definition");
  });

  it("should produce a proper error message without a path", () => {
    const result = formatParseError([issue("", "Invalid JSON Object")]);
    expect(result).toBe("Invalid JSON Object");
  });

  it("should produce a proper error message with a path", () => {
    const result = formatParseError([issue("fields", "At least one field is required")]);
    expect(result).toBe("fields: At least one field is required");
  });

  it('should produce a proper error message with multiple issues (singular "issue")', () => {
    const result = formatParseError([issue("a", "one"), issue("b", "two")]);
    expect(result).toBe("a: one (and 1 additional issue)");
  });

  it('should produce a proper error message with multiple issues (plural "issues")', () => {
    const result = formatParseError([issue("a", "one"), issue("b", "two"), issue("c", "three")]);
    expect(result).toBe("a: one (and 2 additional issues)");
  });
});
