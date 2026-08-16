import { cn } from "../classNames.js";
import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { controlClassName } from "./styles.js";

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea ref={ref} className={cn(controlClassName, "min-h-[80px]", className)} {...props} />
    );
  },
);
