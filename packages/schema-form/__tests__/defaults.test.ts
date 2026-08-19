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
        { name: "password", type: "password" },
        { name: "bio", type: "textarea" },
        { name: "role", type: "select", options: [{ label: "a", value: "a" }] },
        { name: "plan", type: "radio", options: [{ label: "b", value: "b" }] },
      ]),
    ).toEqual({
      name: "abcd",
      age: undefined,
      agree: false,
      email: "",
      password: "",
      bio: "",
      role: "",
      plan: "",
    });
  });
});
