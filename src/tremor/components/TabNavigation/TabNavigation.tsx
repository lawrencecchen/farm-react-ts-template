// Tremor TabNavigation [v0.1.0]

import * as NavigationMenuPrimitives from "@radix-ui/react-navigation-menu";
import React from "react";

import { cx } from "../../utils/cx";
import { focusRing } from "../../utils/focusRing";

function getSubtree(
  options: { asChild: boolean | undefined; children: React.ReactNode },
  content: React.ReactNode | ((children: React.ReactNode) => React.ReactNode),
) {
  const { asChild, children } = options;
  if (!asChild) return typeof content === "function" ? content(children) : content;

  const firstChild = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(firstChild, {
    children: typeof content === "function" ? content(firstChild.props.children) : content,
  });
}

const TabNavigation = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Root>, "orientation" | "defaultValue" | "dir">
>(({ className, children, ...props }, forwardedRef) => (
  <NavigationMenuPrimitives.Root ref={forwardedRef} {...props} tremor-id="tremor-raw" asChild={false}>
    <NavigationMenuPrimitives.List
      className={cx(
        // base
        "flex items-center justify-start whitespace-nowrap border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // border color
        "border-neutral-200 dark:border-neutral-800",
        className,
      )}
    >
      {children}
    </NavigationMenuPrimitives.List>
  </NavigationMenuPrimitives.Root>
));

TabNavigation.displayName = "TabNavigation";

const TabNavigationLink = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Link>,
  Omit<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Link>, "onSelect"> & { disabled?: boolean }
>(({ asChild, disabled, className, children, ...props }, forwardedRef) => (
  <NavigationMenuPrimitives.Item className="flex" aria-disabled={disabled}>
    <NavigationMenuPrimitives.Link
      aria-disabled={disabled}
      className={cx(
        "group relative flex shrink-0 select-none items-center justify-center",
        disabled ? "pointer-events-none" : "",
      )}
      ref={forwardedRef}
      onSelect={() => {}}
      asChild={asChild}
      {...props}
    >
      {getSubtree({ asChild, children }, (children) => (
        <span
          className={cx(
            // base
            "-mb-px flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 pb-2 text-sm font-medium transition-all",
            // text color
            "text-neutral-500 dark:text-neutral-500",
            // hover
            "group-hover:text-neutral-700 dark:group-hover:text-neutral-400",
            // border hover
            "group-hover:border-neutral-300 dark:group-hover:border-neutral-400",
            // selected
            "group-data-active:border-blue-500 group-data-active:text-blue-500",
            "dark:group-data-active:border-blue-500 dark:group-data-active:text-blue-500",
            // disabled
            disabled ? "pointer-events-none text-neutral-300 dark:text-neutral-700" : "",
            focusRing,
            className,
          )}
        >
          {children}
        </span>
      ))}
    </NavigationMenuPrimitives.Link>
  </NavigationMenuPrimitives.Item>
));

TabNavigationLink.displayName = "TabNavigationLink";

export { TabNavigation, TabNavigationLink };
