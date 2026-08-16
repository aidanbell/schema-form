import { cn } from "../classNames.js";
import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { controlClassName } from "./styles.js";

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(controlClassName, "h-8", className)} {...props} />;
});
