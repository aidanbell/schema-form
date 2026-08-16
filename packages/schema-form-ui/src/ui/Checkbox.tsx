import { cn } from "../classNames.js";
import { forwardRef } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";

type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
};

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <BaseCheckbox.Root
      ref={ref}
      nativeButton
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
        "data-[checked]:bg-zinc-900 data-[checked]:border-zinc-900 dark:data-[checked]:bg-zinc-100",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator className="flex text-white dark:text-zinc-900">
        ✓
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
});
