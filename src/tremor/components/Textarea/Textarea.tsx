// Tremor Textarea [v0.0.2]

import React from "react";

import { cx } from "../../utils/cx";
import { focusInput } from "../../utils/focusInput";
import { hasErrorInput } from "../../utils/hasErrorInput";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }: TextareaProps, forwardedRef) => {
    return (
      <textarea
        ref={forwardedRef}
        className={cx(
          // base
          "flex min-h-[4rem] w-full rounded-md border px-3 py-1.5 shadow-xs outline-hidden transition-colors sm:text-sm",
          // text color
          "text-neutral-900 dark:text-neutral-50",
          // border color
          "border-neutral-300 dark:border-neutral-800",
          // background color
          "bg-white dark:bg-neutral-950",
          // placeholder color
          "placeholder-neutral-400 dark:placeholder-neutral-500",
          // disabled
          "disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-300",
          "dark:disabled:border-neutral-700 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500",
          // focus
          focusInput,
          // error
          hasError ? hasErrorInput : "",
          // invalid (optional)
          // "dark:aria-invalid:ring-red-400/20 aria-invalid:ring-2 aria-invalid:ring-red-200 aria-invalid:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
          className,
        )}
        // tremor-id="tremor-raw"
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
