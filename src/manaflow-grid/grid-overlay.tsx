import React, { useCallback, useEffect, useRef } from "react";
import { GRID_CELL_HEIGHT } from "./const";

export interface GridOverlayProps {
  isVisible: boolean;
  rowCount: number;
  gridRef: React.RefObject<HTMLDivElement>;
  cols: number;
  lineStyle?: "solid" | "dotted";
  lineColor?: string;
}

export function GridOverlay({
  isVisible,
  rowCount,
  gridRef,
  cols,
  lineStyle = "solid",
  lineColor = "rgba(212, 212, 212, 0.4)",
}: GridOverlayProps) {
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
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    if (lineStyle === "dotted") {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw vertical grid lines
    const cellWidth = width / cols; // Use cols from props
    for (let col = 0; col <= cols; col++) {
      let xPos: number;
      if (col === 0) {
        xPos = 0.5; // Leftmost line
      } else if (col === cols) {
        // Ensure the rightmost line is drawn just inside the canvas boundary
        xPos = Math.max(0.5, width - 0.5);
      } else {
        xPos = Math.floor(col * cellWidth) + 0.5; // Internal lines
      }
      // Clamp to be safe, especially for width - 0.5 in very narrow cases
      xPos = Math.max(0.5, Math.min(xPos, width - 0.5));

      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let row = 0; row <= rowCount; row++) {
      let yPos: number;
      if (row === 0) {
        yPos = 0.5; // Topmost line
      } else if (row === rowCount) {
        // Ensure the bottommost line is drawn just inside the canvas boundary
        yPos = Math.max(0.5, height - 0.5);
      } else {
        yPos = Math.floor(row * GRID_CELL_HEIGHT) + 0.5; // Internal lines
      }
      // Clamp to be safe, especially for height - 0.5 in very short cases
      yPos = Math.max(0.5, Math.min(yPos, height - 0.5));

      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(width, yPos);
      ctx.stroke();
    }
  }, [gridRef, rowCount, cols, lineColor, lineStyle]); // Add cols to dependency array

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

  // Create an array for rows and columns based on rowCount and cols
  // const rows = Array.from({ length: rowCount });
  // const columns = Array.from({ length: cols });

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}
