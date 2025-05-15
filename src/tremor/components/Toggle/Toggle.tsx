// Tremor Toggle [v0.0.0]
"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import React from "react";

import { cx } from "../../utils/cx";
import { focusRing } from "../../utils/focusRing";

const toggleStyles = [
  // base
  "group inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md border px-2 text-sm font-medium shadow-xs transition-all duration-100 ease-in-out",
  "border-neutral-300 dark:border-neutral-800",
  // text color
  "text-neutral-700 dark:text-neutral-300",
  // background color
  "bg-white dark:bg-neutral-950",
  //hover color
  "hover:bg-neutral-50 dark:hover:bg-neutral-900/60",
  // disabled
  "disabled:pointer-events-none disabled:text-neutral-400 dark:disabled:text-neutral-600",
  "data-[state=on]:bg-neutral-100 data-[state=on]:text-neutral-900 dark:data-[state=on]:bg-neutral-800 dark:data-[state=on]:text-neutral-50",
  focusRing,
];

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cx(toggleStyles, className)} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cx("flex flex-nowrap items-center justify-center gap-1", className)}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item ref={ref} className={cx(toggleStyles, className)} {...props}>
    {children}
  </ToggleGroupPrimitive.Item>
));

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
