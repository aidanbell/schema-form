import { describe, expect, it } from "vitest";
import { buildFormValidationSchema } from "../src/index";
import { issue } from "../src/errors";

const schema = buildFormValidationSchema([
  { name: "email", type: "email", required: true },
  { name: "age", type: "number" },
]);
