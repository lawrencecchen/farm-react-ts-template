import clsx from "clsx";
import type React from "react";

import { forwardRef } from "react";

export const Card = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  function Card({ children, ...props }, ref) {
    return (
      <div
        ref={ref}
        {...props}
        className={clsx(
          "grid-item-inner-wrapper flex h-full max-h-full flex-col overflow-hidden rounded-xl border border-neutral-300/80 bg-white p-4",
          props.className,
        )}
      >
        {children}
      </div>
    );
  },
);

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-0.5 text-xl font-semibold text-neutral-900">
      {children}
    </h2>
  );
}

export function CardSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm text-neutral-600">{children}</p>;
}

export function CardCaption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs italic text-neutral-500">{children}</p>;
}
