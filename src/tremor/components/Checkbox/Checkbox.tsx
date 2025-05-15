// Tremor Checkbox [v0.0.3]

import * as CheckboxPrimitives from "@radix-ui/react-checkbox";
import React from "react";

import { cx } from "../../utils/cx";
import { focusRing } from "../../utils/focusRing";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitives.Root>
>(({ className, checked, ...props }, forwardedRef) => {
  return (
    <CheckboxPrimitives.Root
      ref={forwardedRef}
      {...props}
      checked={checked}
      className={cx(
        // base
        "relative inline-flex size-4 shrink-0 appearance-none items-center justify-center rounded-sm shadow-xs outline-hidden ring-1 ring-inset transition duration-100 enabled:cursor-pointer",
        // text color
        "text-white dark:text-neutral-50",
        // background color
        "bg-white dark:bg-neutral-950",
        // ring color
        "ring-neutral-300 dark:ring-neutral-800",
        // disabled
        "data-disabled:bg-neutral-100 data-disabled:text-neutral-400 data-disabled:ring-neutral-300",
        "dark:data-disabled:bg-neutral-800 dark:data-disabled:text-neutral-500 dark:data-disabled:ring-neutral-700",
        // checked and enabled
        "enabled:data-[state=checked]:bg-blue-500 enabled:data-[state=checked]:ring-0 enabled:data-[state=checked]:ring-transparent",
        // indeterminate
        "enabled:data-[state=indeterminate]:bg-blue-500 enabled:data-[state=indeterminate]:ring-0 enabled:data-[state=indeterminate]:ring-transparent",
        // focus
        focusRing,
        className,
      )}
      tremor-id="tremor-raw"
    >
      <CheckboxPrimitives.Indicator asChild className="flex size-full items-center justify-center">
        {checked === "indeterminate" ? (
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="4" x2="12" y1="8" y2="8" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.2 5.59998L6.79999 9.99998L4.79999 7.99998"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </CheckboxPrimitives.Indicator>
    </CheckboxPrimitives.Root>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
