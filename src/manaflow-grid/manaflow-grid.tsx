import clsx from "clsx";
import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { GRID_CELL_HEIGHT, MIN_ROWS } from "./const";
import { generateLayoutSourceCode } from "./generateLayoutSourceCode";
import { getFirstComponentName } from "./getFirstComponentName";
import { GridOverlay } from "./grid-overlay";
import { handleMouseMove } from "./gridCollisionHandlers";

interface GridItemProps {
  colSpan?: number;
  rowSpan?: number;
  colStart?: number;
  rowStart?: number;
}

// Enhanced GridContext with grid item tracking
const GridContext = React.createContext<{
  isResizing: boolean;
  isDragging: boolean;
  activeItemColSpan: number;
  activeItemRowSpan: number;
  activeItemId: string | null;
  gridItems: Record<
    string,
    {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
      componentName: string;
    }
  >;
  setIsResizing: (isResizing: boolean) => void;
  setIsDragging: (isDragging: boolean) => void;
  setActiveItemDimensions: (colSpan: number, rowSpan: number) => void;
  setActiveItemId: (id: string | null) => void;
  registerGridItem: (
    id: string,
    colStart: number,
    rowStart: number,
    colSpan: number,
    rowSpan: number,
    componentName: string,
  ) => void;
  unregisterGridItem: (id: string) => void;
  updateGridItemPosition: (
    id: string,
    colStart: number,
    rowStart: number,
    colSpan: number,
    rowSpan: number,
  ) => void;
  expandRowsIfNeeded: (requestedRow: number) => void;
}>({
  isResizing: false,
  isDragging: false,
  activeItemColSpan: 0,
  activeItemRowSpan: 0,
  activeItemId: null,
  gridItems: {},
  setIsResizing: () => {},
  setIsDragging: () => {},
  setActiveItemDimensions: () => {},
  setActiveItemId: () => {},
  registerGridItem: () => {},
  unregisterGridItem: () => {},
  updateGridItemPosition: () => {},
  expandRowsIfNeeded: () => {},
});

// Custom hook to calculate grid rows based on container height
function useGridRows(containerRef: React.RefObject<HTMLDivElement>) {
  const [rowCount, setRowCount] = useState(MIN_ROWS);

  // Add function to manually expand rows when needed
  const expandRowsIfNeeded = useCallback((requestedRow: number) => {
    setRowCount((prevCount) => Math.max(prevCount, requestedRow + 5)); // Add 5 extra rows for buffer
  }, []);

  useEffect(() => {
    // Function to calculate rows based on container height
    const calculateRows = () => {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const calculatedRows = Math.max(
        MIN_ROWS,
        Math.ceil(containerHeight / GRID_CELL_HEIGHT),
      );
      setRowCount(calculatedRows);
    };

    // Calculate initially
    calculateRows();

    // Set up resize observer to recalculate when container size changes
    const resizeObserver = new ResizeObserver(calculateRows);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Clean up observer on unmount
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return { rowCount, expandRowsIfNeeded };
}

export function GridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  colStart = 1,
  rowStart = 1,
}: GridItemProps & { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const gridItemRef = useRef<HTMLDivElement>(null);

  // Generate a unique ID for this grid item
  const itemId = useId();

  // Get component name for registration
  const componentName = getFirstComponentName(children);

  // Get grid context
  const {
    setIsResizing,
    setIsDragging,
    setActiveItemDimensions,
    setActiveItemId,
    activeItemId,
    isResizing,
    isDragging,
    gridItems,
    registerGridItem,
    unregisterGridItem,
    updateGridItemPosition,
    expandRowsIfNeeded,
  } = useContext(GridContext);

  // Add isResizing and isDragging as refs for this specific item
  const isResizingRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Register this grid item with the context when mounted
  useEffect(() => {
    // Now also passing component name to registerGridItem
    registerGridItem(
      itemId,
      colStart,
      rowStart,
      colSpan,
      rowSpan,
      componentName,
    );

    // Unregister when unmounted
    return () => {
      unregisterGridItem(itemId);
    };
  }, [
    itemId,
    registerGridItem,
    unregisterGridItem,
    colStart,
    rowStart,
    colSpan,
    rowSpan,
    componentName,
  ]);

  // Reference to track initial positions during resize
  const resizeRef = useRef({
    startX: 0,
    startY: 0,
    startColSpan: colSpan,
    startRowSpan: rowSpan,
    startWidth: 0,
    startHeight: 0,
    corner: "",
    startColStart: colStart,
    startRowStart: rowStart,
    startScrollX: 0,
    startScrollY: 0,
  });

  // Reference to track initial positions during drag
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startColStart: colStart,
    startRowStart: rowStart,
    startGridX: 0,
    startGridY: 0,
    startScrollX: 0,
    startScrollY: 0,
  });

  // Handle mouse movement (for both resize and drag)
  const handleMouseMoveCallback = useCallback(
    (e: MouseEvent) => {
      handleMouseMove(e, {
        isResizingRef,
        isDraggingRef,
        gridItemRef,
        itemId,
        resizeRef,
        dragRef,
        gridItems,
        setActiveItemDimensions,
        updateGridItemPosition,
        expandRowsIfNeeded,
      });
    },
    [
      itemId,
      setActiveItemDimensions,
      gridItems,
      updateGridItemPosition,
      expandRowsIfNeeded,
    ],
  );

  // Handle mouse up (for both resize and drag)
  const handleMouseUp = useCallback(() => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      setIsResizing(false);
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  }, [setIsResizing, setIsDragging]);

  // Set up global event listeners once
  useEffect(() => {
    // Add event listeners
    document.addEventListener("mousemove", handleMouseMoveCallback);
    document.addEventListener("mouseup", handleMouseUp);

    // Clean up
    return () => {
      document.removeEventListener("mousemove", handleMouseMoveCallback);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMoveCallback, handleMouseUp]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, corner: string) => {
      e.stopPropagation();
      e.preventDefault();

      if (!gridItemRef.current) return;

      // Update ref
      isResizingRef.current = true;
      setIsResizing(true);
      setFocused(true);
      setActiveItemId(itemId);

      // Store initial dimensions
      const rect = gridItemRef.current.getBoundingClientRect();
      const currentItem = gridItems[itemId];

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startColSpan: currentItem.colSpan,
        startRowSpan: currentItem.rowSpan,
        startWidth: rect.width,
        startHeight: rect.height,
        corner: corner,
        startColStart: currentItem.colStart,
        startRowStart: currentItem.rowStart,
        startScrollX: window.scrollX,
        startScrollY: window.scrollY,
      };

      // Update the grid context with initial dimensions
      setActiveItemDimensions(currentItem.colSpan, currentItem.rowSpan);
    },
    [
      gridItems,
      setIsResizing,
      setActiveItemId,
      itemId,
      setActiveItemDimensions,
    ],
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!gridItemRef.current) return;

      isDraggingRef.current = true;
      setIsDragging(true);
      setFocused(true);
      setActiveItemId(itemId);

      const currentItem = gridItems[itemId];

      // Store initial positions
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startColStart: currentItem.colStart,
        startRowStart: currentItem.rowStart,
        startGridX: 0,
        startGridY: 0,
        startScrollX: window.scrollX,
        startScrollY: window.scrollY,
      };
    },
    [gridItems, setIsDragging, setActiveItemId, itemId],
  );

  // If an item is being dragged or resized, only that item can respond.
  // Otherwise, all items can show interactive state.
  const canShowInteractiveState =
    (!isResizing && !isDragging) || activeItemId === itemId;

  // Compute effective hover/focus states
  const effectiveHovered = canShowInteractiveState && hovered;
  const effectiveFocused = canShowInteractiveState && focused;

  // Auto-focus when this item starts resizing or dragging
  useEffect(() => {
    if ((isResizingRef.current || isDraggingRef.current) && !focused) {
      setFocused(true);
    }
  }, [focused]);

  // Add click outside handler to lose focus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Skip if we're resizing or dragging
      if (isResizingRef.current || isDraggingRef.current) return;

      // Check if the click was outside this grid item
      if (
        gridItemRef.current &&
        !gridItemRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
        if (activeItemId === itemId) {
          setActiveItemId(null);
        }
      }
    };

    // Only add the listener if this item is focused
    if (focused) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [focused, activeItemId, itemId, setActiveItemId]);

  // Whenever the active item changes to a different item, lose focus
  useEffect(() => {
    if (activeItemId !== itemId && focused) {
      setFocused(false);
    }
  }, [activeItemId, itemId, focused]);

  // Derive dotted border visibility directly from props/context
  const showDottedBorder =
    (isResizing || isDragging) && activeItemId !== itemId;

  // Get current item position from context
  const currentItem = gridItems[itemId] || {
    colStart,
    rowStart,
    colSpan,
    rowSpan,
  };

  return (
    <div
      ref={gridItemRef}
      // biome-ignore lint/a11y/useSemanticElements: haha no
      role="button"
      className="relative h-full w-full bg-white text-left"
      onMouseOver={() => canShowInteractiveState && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => canShowInteractiveState && setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={() => {
        if (canShowInteractiveState) {
          setFocused(true);
          setActiveItemId(itemId);
        }
      }}
      onKeyDown={(e) => {
        if (canShowInteractiveState && (e.key === "Enter" || e.key === " ")) {
          setFocused(true);
          setActiveItemId(itemId);
        }
      }}
      tabIndex={0}
      style={{
        gridColumn: `${currentItem.colStart} / span ${currentItem.colSpan}`,
        gridRow: `${currentItem.rowStart} / span ${currentItem.rowSpan}`,
      }}
    >
      <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden">
        <div className="flex h-full w-full flex-col p-[4px]">{children}</div>

        {/* Overlay for hover state */}
        {effectiveHovered && !effectiveFocused && (
          <div className="pointer-events-none absolute inset-0 border border-blue-500" />
        )}

        {/* Overlay for focus state */}
        {effectiveFocused && (
          <div className="pointer-events-none absolute inset-0 border-2 border-blue-500" />
        )}

        {/* Dotted border for inactive items during drag/resize with fade animation */}
        <div
          className={`pointer-events-none absolute inset-0 border border-dashed border-neutral-400 ${
            showDottedBorder ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Drag handle - position at top-left or bottom-left based on available space */}
      {(effectiveHovered || effectiveFocused) && (
        <div
          className={clsx(
            "absolute z-20 flex h-8 w-8 cursor-move items-center justify-center",
            "-top-3 left-0",
            // TODO: Add this back in when we have a way to handle the top row
            // currentItem.rowStart > 2
            //   ? "-top-5 left-0"
            //   : "top-full left-0 transform -translate-y-3",
          )}
          onMouseDown={handleDragStart}
        >
          <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 shadow-md transition-colors hover:bg-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Drag handle</title>
              <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M12 12h.01M12 12v.01M12 12h-.01M12 12v-.01" />
            </svg>
          </div>
        </div>
      )}

      {/* Resizers - show when hovered or focused */}
      {(effectiveHovered || effectiveFocused) && (
        <>
          {/* Top-middle resizer - full width edge */}
          <div
            className="absolute -top-3 left-0 right-0 z-10 h-6 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, "Top")}
          >
            <div className="absolute left-8 right-8 top-3 h-[1px] bg-blue-500 opacity-70 group-hover:opacity-100" />
            <div className="absolute left-8 right-8 top-0 h-6 bg-transparent" />
          </div>

          {/* Middle-left resizer - full height edge */}
          <div
            className="absolute -left-3 bottom-0 top-0 z-10 w-6 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, "Left")}
          >
            <div className="absolute bottom-8 left-3 top-8 w-[1px] bg-blue-500 opacity-70 group-hover:opacity-100" />
            <div className="absolute bottom-8 left-0 top-8 w-6 bg-transparent" />
          </div>

          {/* Middle-right resizer - full height edge */}
          <div
            className="absolute -right-3 bottom-0 top-0 z-10 w-6 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, "Right")}
          >
            <div className="absolute bottom-8 right-3 top-8 w-[1px] bg-blue-500 opacity-70 group-hover:opacity-100" />
            <div className="absolute bottom-8 right-0 top-8 w-6 bg-transparent" />
          </div>

          {/* Bottom-middle resizer - full width edge */}
          <div
            className="absolute -bottom-3 left-0 right-0 z-10 h-6 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, "Bottom")}
          >
            <div className="absolute bottom-3 left-8 right-8 h-[1px] bg-blue-500 opacity-70 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-8 right-8 h-6 bg-transparent" />
          </div>

          {/* Top-left resizer */}
          <div
            className="absolute -left-3 -top-3 z-20 flex h-6 w-6 cursor-nwse-resize items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "TopLeft")}
          >
            <div className="size-3 rounded-full border border-neutral-400 bg-white shadow-md transition-transform hover:scale-110" />
          </div>

          {/* Top-right resizer */}
          <div
            className="absolute -right-3 -top-3 z-20 flex h-6 w-6 cursor-nesw-resize items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "TopRight")}
          >
            <div className="size-3 rounded-full border border-neutral-400 bg-white shadow-md transition-transform hover:scale-110" />
          </div>

          {/* Bottom-left resizer */}
          <div
            className="absolute -bottom-3 -left-3 z-20 flex h-6 w-6 cursor-nesw-resize items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "BottomLeft")}
          >
            <div className="size-3 rounded-full border border-neutral-400 bg-white shadow-md transition-transform hover:scale-110" />
          </div>

          {/* Bottom-right resizer */}
          <div
            className="absolute -bottom-3 -right-3 z-20 flex h-6 w-6 cursor-nwse-resize items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "BottomRight")}
          >
            <div className="size-3 rounded-full border border-neutral-400 bg-white shadow-md transition-transform hover:scale-110" />
          </div>
        </>
      )}
    </div>
  );
}

// This is a placeholder that gets compiled out in remote-files-plugin.ts
export function GridComponent(props: GridItemProps & { componentKey: string }) {
  return <GridItem {...props}>Loading...</GridItem>;
}

export function Grid({ children }: { children: React.ReactNode }) {
  // State to track if any grid item is being resized or dragged
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeItemColSpan, setActiveItemColSpan] = useState(0);
  const [activeItemRowSpan, setActiveItemRowSpan] = useState(0);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  // Add state for grid overlay animation
  // Add state to track all grid items
  const [gridItems, setGridItems] = useState<
    Record<
      string,
      {
        colStart: number;
        rowStart: number;
        colSpan: number;
        rowSpan: number;
        componentName: string;
      }
    >
  >({});

  // Function to update active item dimensions
  const setActiveItemDimensions = useCallback(
    (colSpan: number, rowSpan: number) => {
      setActiveItemColSpan(colSpan);
      setActiveItemRowSpan(rowSpan);
    },
    [],
  );

  // Function to register a grid item
  const registerGridItem = useCallback(
    (
      id: string,
      colStart: number,
      rowStart: number,
      colSpan: number,
      rowSpan: number,
      componentName = "Unknown",
    ) => {
      setGridItems((prevItems) => ({
        ...prevItems,
        [id]: { colStart, rowStart, colSpan, rowSpan, componentName },
      }));
    },
    [],
  );

  // Function to unregister a grid item
  const unregisterGridItem = useCallback((id: string) => {
    setGridItems((prevItems) => {
      const newItems = { ...prevItems };
      delete newItems[id];
      return newItems;
    });
  }, []);

  // Function to update a grid item's position
  const updateGridItemPosition = useCallback(
    (
      id: string,
      colStart: number,
      rowStart: number,
      colSpan: number,
      rowSpan: number,
    ) => {
      setGridItems((prevItems) => {
        // Preserve the componentName from the existing item
        const existingItem = prevItems[id];
        const componentName = existingItem?.componentName || "Unknown";

        return {
          ...prevItems,
          [id]: { colStart, rowStart, colSpan, rowSpan, componentName },
        };
      });
    },
    [],
  );

  // Reference to the grid container
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get dynamic row count based on container height
  const { rowCount, expandRowsIfNeeded } = useGridRows(containerRef);

  const handleSetIsResizing = useCallback((value: boolean) => {
    setIsResizing(value);
  }, []);
  const handleSetIsDragging = useCallback((value: boolean) => {
    setIsDragging(value);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isResizing,
      isDragging,
      activeItemColSpan,
      activeItemRowSpan,
      activeItemId,
      gridItems,
      setIsResizing: handleSetIsResizing,
      setIsDragging: handleSetIsDragging,
      setActiveItemDimensions,
      setActiveItemId,
      registerGridItem,
      unregisterGridItem,
      updateGridItemPosition,
      expandRowsIfNeeded,
    }),
    [
      isResizing,
      isDragging,
      activeItemColSpan,
      activeItemRowSpan,
      activeItemId,
      gridItems,
      handleSetIsResizing,
      handleSetIsDragging,
      setActiveItemDimensions,
      registerGridItem,
      unregisterGridItem,
      updateGridItemPosition,
      expandRowsIfNeeded,
    ],
  );

  // Create grid template rows style
  const gridTemplateRows = `repeat(${rowCount}, ${GRID_CELL_HEIGHT}px)`;

  useEffect(() => {
    const layoutCode = generateLayoutSourceCode({ gridItems });
    console.log(layoutCode);
  }, [gridItems]);

  return (
    <GridContext.Provider value={contextValue}>
      <div className="h-screen w-screen p-1">
        <div ref={containerRef} className="relative h-full overflow-visible">
          <GridOverlay
            isVisible={isResizing || isDragging}
            rowCount={rowCount}
            gridRef={gridRef}
          />
          <div
            ref={gridRef}
            className="grid-wrapper relative z-10 grid grid-cols-12 gap-0"
            style={{ gridTemplateRows }}
          >
            {children}
          </div>
        </div>
      </div>
    </GridContext.Provider>
  );
}
