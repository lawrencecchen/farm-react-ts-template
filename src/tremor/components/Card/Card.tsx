// Tremor Card [v0.0.2]

import { Slot } from "@radix-ui/react-slot";
import React from "react";

import { cx } from "../../utils/cx";

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, asChild, ...props }, forwardedRef) => {
  const Component = asChild ? Slot : "div";
  return (
    <Component
      ref={forwardedRef}
      className={cx(
        // base
        "relative w-full rounded-lg border p-6 text-left shadow-xs",
        // background color
        "bg-white dark:bg-[#090E1A]",
        // border color
        "border-neutral-200 dark:border-neutral-900",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    />
  );
});

Card.displayName = "Card";

export { Card, type CardProps };
