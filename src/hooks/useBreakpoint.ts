import { useEffect } from "react";

import { useState } from "react";

export const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
} as const;
export const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

export type Breakpoint = keyof typeof BREAKPOINTS;

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === "undefined") return "lg";
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    function handleResize() {
      setBreakpoint(getBreakpoint(window.innerWidth));
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  if (width >= BREAKPOINTS.xs) return "xs";
  return "xxs";
}
