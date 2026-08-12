import { describe, expect, it } from "vitest";
import { getDefaultValues } from "../src/defaults.js";

describe("getDefaultValues", () => {
  it("returns the default value for each field", () => {
    expect(
      getDefaultValues([
        { name: "name", type: "string", defaultValue: "abcd" },
        { name: "age", type: "number" },
        { name: "agree", type: "boolean" },
        { name: "email", type: "email" },
      ]),
    ).toEqual({
      name: "abcd",
      age: undefined,
      agree: false,
      email: "",
    });
  });
});
