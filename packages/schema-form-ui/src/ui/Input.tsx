import { cn } from "../classNames.js";
import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { controlClassName } from "./styles.js";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(controlClassName, "h-8", className)} {...props} />;
});
