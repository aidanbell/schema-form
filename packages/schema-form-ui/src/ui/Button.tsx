import { cn } from "../classNames.js";
import { forwardRef } from "react";
import type { ComponentProps } from "react";

const defaultButtonClassName =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm py-2 px-4 font-medium transition-colors bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

export const Button = forwardRef<HTMLButtonElement, ComponentProps<"button">>(function Button(
  { className, ...props },
  ref,
) {
  return <button ref={ref} className={cn(defaultButtonClassName, className)} {...props} />;
});
