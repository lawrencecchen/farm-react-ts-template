import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import { GRID_CELL_HEIGHT } from "./const";

interface GridOverlayProps {
  isVisible: boolean;
  rowCount: number;
  gridRef: RefObject<HTMLDivElement>;
}

export function GridOverlay({ isVisible, rowCount, gridRef }: GridOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Main drawing function to keep code DRY
  const drawGrid = useCallback(() => {
    if (!gridRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get the grid dimensions
    const gridRect = gridRef.current.getBoundingClientRect();
    const width = gridRect.width;
    const height = rowCount * GRID_CELL_HEIGHT;

    // Handle high DPI displays (Retina)
    const dpr = window.devicePixelRatio || 1;

    // Set the canvas dimensions accounting for device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale the canvas for high DPI displays
    ctx.scale(dpr, dpr);

    // Set canvas display size in CSS pixels
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set line style
    ctx.strokeStyle = "rgba(212, 212, 212, 0.6)"; // Equivalent to bg-neutral-200 with lighter transparency
    ctx.lineWidth = 1;

    // Draw vertical grid lines
    const totalCols = 12;
    const cellWidth = width / 12;

    for (let col = 0; col <= totalCols; col++) {
      const x = col * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let row = 0; row <= rowCount; row++) {
      const y = row * GRID_CELL_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [gridRef, rowCount]);

  // Initial render and when dependencies change
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Re-render when visibility changes
  useEffect(() => {
    if (isVisible) {
      drawGrid();
    }
  }, [isVisible, drawGrid]);

  // Set up a resize observer to redraw when container size changes
  useEffect(() => {
    if (!gridRef.current) return;

    const handleResize = () => {
      drawGrid();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(gridRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [gridRef, drawGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute top-0 left-0"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 0,
        overflow: "visible",
      }}
    />
  );
}
