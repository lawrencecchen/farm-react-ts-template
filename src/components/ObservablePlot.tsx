"use client";

import { useElementSize } from "@mantine/hooks";
import * as Plot from "@observablehq/plot";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorDisplay } from "./ErrorDisplay";

type PlotOptions = Parameters<typeof Plot.plot>[0];

interface ObservablePlotProps {
  options: PlotOptions;
  className?: string;
  path?: string; // Optional path for error reporting
}

function PlotContent({ options }: { options: PlotOptions }) {
  const { ref: containerRef, width, height } = useElementSize();

  useEffect(() => {
    if (!containerRef.current || !width || !height) return;

    const plot = Plot.plot({
      style: {
        background: "transparent",
      },
      figure: false,
      grid: false,
      width,
      height,
      ...options,
    });

    containerRef.current.innerHTML = "";
    containerRef.current.append(plot);
    return () => plot.remove();
  }, [options, width, height, containerRef]);

  return <div ref={containerRef} className="max-h-full min-h-0 grow w-full h-full" />;
}

export function ObservablePlot({ options, path }: ObservablePlotProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorDisplay error={error} reset={resetErrorBoundary} path={path} message="Failed to render plot" />
      )}
    >
      <PlotContent options={options} />
    </ErrorBoundary>
  );
}
