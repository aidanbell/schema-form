import { describe, it, expect } from "vitest";
import { cn, mergeClassNames } from "../src/index.js";

describe("cn", () => {
  it("it should cascade merge classname", () => {
    const result = cn("p-2", "p-4", "bg-red-500");
    expect(result).toBe("p-4 bg-red-500");
  });
});

describe("mergeClassNames", () => {
  it("it should merge classnames", () => {
    const result = mergeClassNames(
      { control: "p-2", label: "text-xl" },
      { control: "p-4", label: "text-lg" },
    );
    expect(result.control).toEqual("p-4");
    expect(result.label).toEqual("text-lg");
  });
});
