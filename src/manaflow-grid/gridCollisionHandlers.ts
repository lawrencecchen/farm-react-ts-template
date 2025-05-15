import { GRID_CELL_HEIGHT } from "./const";

// Check for collisions with other grid items
export const checkCollisions = (
  testId: string,
  newColStart: number,
  newRowStart: number,
  newColSpan: number,
  newRowSpan: number,
  gridItems: Record<
    string,
    {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
      componentName: string;
    }
  >
) => {
  // Get the cells that would be occupied by this grid item
  const occupiedCells = new Set<string>();
  for (let col = newColStart; col < newColStart + newColSpan; col++) {
    for (let row = newRowStart; row < newRowStart + newRowSpan; row++) {
      occupiedCells.add(`${col},${row}`);
    }
  }

  const collisions: Array<{
    id: string;
    colStart: number;
    rowStart: number;
    colSpan: number;
    rowSpan: number;
  }> = [];

  // Check each grid item for collisions
  for (const [id, item] of Object.entries(gridItems)) {
    // Skip checking against itself
    if (id === testId) continue;

    // Check if this item occupies any of the same cells
    let hasCollision = false;
    for (let col = item.colStart; col < item.colStart + item.colSpan; col++) {
      for (let row = item.rowStart; row < item.rowStart + item.rowSpan; row++) {
        if (occupiedCells.has(`${col},${row}`)) {
          hasCollision = true;
          break;
        }
      }
      if (hasCollision) break;
    }

    if (hasCollision) {
      collisions.push({
        id,
        ...item,
      });
    }
  }

  return collisions;
};

// Enhanced collision checking that separates horizontal and vertical collisions
export const checkAxisCollisions = (
  testId: string,
  horizontalOnly: {
    colStart: number;
    colSpan: number;
    rowStart: number;
    rowSpan: number;
  } | null,
  verticalOnly: {
    colStart: number;
    colSpan: number;
    rowStart: number;
    rowSpan: number;
  } | null,
  original: {
    colStart: number;
    colSpan: number;
    rowStart: number;
    rowSpan: number;
  },
  gridItems: Record<
    string,
    {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
      componentName: string;
    }
  >
): { horizontal: boolean; vertical: boolean } => {
  // Default result - no collisions on either axis
  const result = { horizontal: false, vertical: false };

  // Check horizontal collisions if a horizontal move/resize is requested
  if (horizontalOnly) {
    const horizontalCollisions = checkCollisions(
      testId,
      horizontalOnly.colStart,
      original.rowStart,
      horizontalOnly.colSpan,
      original.rowSpan,
      gridItems
    );
    result.horizontal = horizontalCollisions.length > 0;
  }

  // Check vertical collisions if a vertical move/resize is requested
  if (verticalOnly) {
    const verticalCollisions = checkCollisions(
      testId,
      original.colStart,
      verticalOnly.rowStart,
      original.colSpan,
      verticalOnly.rowSpan,
      gridItems
    );
    result.vertical = verticalCollisions.length > 0;
  }

  return result;
};

// Handle mouse movement for both resize and drag operations
export const handleMouseMove = (
  e: MouseEvent,
  params: {
    isResizingRef: React.MutableRefObject<boolean>;
    isDraggingRef: React.MutableRefObject<boolean>;
    gridItemRef: React.RefObject<HTMLDivElement>;
    itemId: string;
    resizeRef: React.MutableRefObject<{
      startX: number;
      startY: number;
      startColSpan: number;
      startRowSpan: number;
      startWidth: number;
      startHeight: number;
      corner: string;
      startColStart: number;
      startRowStart: number;
      startScrollX: number;
      startScrollY: number;
    }>;
    dragRef: React.MutableRefObject<{
      startX: number;
      startY: number;
      startColStart: number;
      startRowStart: number;
      startGridX: number;
      startGridY: number;
      startScrollX: number;
      startScrollY: number;
    }>;
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
    setActiveItemDimensions: (colSpan: number, rowSpan: number) => void;
    updateGridItemPosition: (
      id: string,
      colStart: number,
      rowStart: number,
      colSpan: number,
      rowSpan: number
    ) => void;
    expandRowsIfNeeded: (requestedRow: number) => void;
  }
) => {
  const {
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
  } = params;

  // Handle resize
  if (isResizingRef.current && gridItemRef.current) {
    // Calculate the delta movement
    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;

    // Account for scrolling
    const scrollDeltaX = window.scrollX - resizeRef.current.startScrollX;
    const scrollDeltaY = window.scrollY - resizeRef.current.startScrollY;

    // Adjust delta values with scroll changes
    const adjustedDeltaX = deltaX + scrollDeltaX;
    const adjustedDeltaY = deltaY + scrollDeltaY;

    // Get the current cell width based on the grid container width
    const gridContainer = gridItemRef.current.closest(".grid-wrapper");
    if (!gridContainer) return;

    const cellWidth = gridContainer.getBoundingClientRect().width / 12;

    // Calculate new width and height based on which corner is being dragged
    let newWidth = resizeRef.current.startWidth;
    let newColStart = gridItems[itemId].colStart;

    // Handle horizontal resizing
    if (
      resizeRef.current.corner.includes("Right") ||
      resizeRef.current.corner === "Right"
    ) {
      // Only allow horizontal resizing - right edge can only move horizontally
      newWidth += adjustedDeltaX;

      // Ensure we don't exceed grid boundaries
      const maxWidth = (13 - newColStart) * cellWidth;
      newWidth = Math.min(newWidth, maxWidth);
    } else if (
      resizeRef.current.corner.includes("Left") ||
      resizeRef.current.corner === "Left"
    ) {
      // For left resize, moving left (negative deltaX) should increase width
      // Moving right (positive deltaX) should decrease width

      // Calculate how many columns we need to adjust
      const deltaColumns = Math.round(adjustedDeltaX / cellWidth);

      // Calculate new colStart (moving left decreases colStart, moving right increases it)
      const potentialNewColStart =
        resizeRef.current.startColStart + deltaColumns;

      // Ensure colStart stays within valid range (1 to 12)
      let newPotentialColStart = Math.max(
        1,
        Math.min(12, potentialNewColStart)
      );

      // Don't allow moving beyond the right edge of the original element
      const rightEdgeLimit =
        resizeRef.current.startColStart + resizeRef.current.startColSpan - 1;
      if (newPotentialColStart > rightEdgeLimit) {
        newPotentialColStart = rightEdgeLimit;
      }

      newColStart = newPotentialColStart;

      // Adjust width based on how much we actually moved the start position
      const actualDeltaColumns = newColStart - resizeRef.current.startColStart;

      // When moving left (decreasing colStart), increase width
      // When moving right (increasing colStart), decrease width
      newWidth = resizeRef.current.startWidth - actualDeltaColumns * cellWidth;
    }

    let newHeight = resizeRef.current.startHeight;
    let newRowStart = gridItems[itemId].rowStart;

    // Handle vertical resizing
    if (
      resizeRef.current.corner.includes("Bottom") ||
      resizeRef.current.corner === "Bottom"
    ) {
      // Only allow vertical resizing - bottom edge can only move vertically
      newHeight += adjustedDeltaY;

      // Don't impose a strict maximum height, but ensure it's reasonable
      newHeight = Math.max(GRID_CELL_HEIGHT, newHeight);
    } else if (
      resizeRef.current.corner.includes("Top") ||
      resizeRef.current.corner === "Top"
    ) {
      // For top resize, moving up (negative deltaY) should increase height
      // Moving down (positive deltaY) should decrease height

      // Calculate how many rows we need to adjust
      const deltaRows = Math.round(adjustedDeltaY / GRID_CELL_HEIGHT);

      // Calculate new rowStart (moving up decreases rowStart, moving down increases it)
      const potentialNewRowStart = resizeRef.current.startRowStart + deltaRows;

      // Ensure rowStart stays within valid range (minimum 1)
      let newPotentialRowStart = Math.max(1, potentialNewRowStart);

      // Don't allow moving beyond the bottom edge of the original element
      const bottomEdgeLimit =
        resizeRef.current.startRowStart + resizeRef.current.startRowSpan - 1;
      if (newPotentialRowStart > bottomEdgeLimit) {
        newPotentialRowStart = bottomEdgeLimit;
      }

      newRowStart = newPotentialRowStart;

      // Adjust height based on how much we actually moved the start position
      const actualDeltaRows = newRowStart - resizeRef.current.startRowStart;

      // When moving up (decreasing rowStart), increase height
      // When moving down (increasing rowStart), decrease height
      newHeight =
        resizeRef.current.startHeight - actualDeltaRows * GRID_CELL_HEIGHT;
    }

    // For edge-only resizing (not corners), only apply changes to the relevant dimension
    if (
      resizeRef.current.corner === "Left" ||
      resizeRef.current.corner === "Right"
    ) {
      // Only horizontal resizing, keep height unchanged
      newHeight = resizeRef.current.startHeight;
      newRowStart = resizeRef.current.startRowStart;
    } else if (
      resizeRef.current.corner === "Top" ||
      resizeRef.current.corner === "Bottom"
    ) {
      // Only vertical resizing, keep width unchanged
      newWidth = resizeRef.current.startWidth;
      newColStart = resizeRef.current.startColStart;
    }

    // Ensure minimum dimensions
    newWidth = Math.max(cellWidth, newWidth);
    newHeight = Math.max(GRID_CELL_HEIGHT, newHeight);

    // Calculate new spans based on dynamic grid cell dimensions
    let newColSpan = Math.max(
      1,
      Math.min(12, Math.round(newWidth / cellWidth))
    );

    // For row span, use the fixed row height
    const newRowSpan = Math.max(1, Math.round(newHeight / GRID_CELL_HEIGHT));

    // Handle edge case: ensure we don't exceed grid boundaries
    if (newColStart + newColSpan > 13) {
      newColSpan = 13 - newColStart;
    }

    // Store current position to revert if collisions can't be resolved
    const originalPosition = {
      colStart: gridItems[itemId].colStart,
      rowStart: gridItems[itemId].rowStart,
      colSpan: gridItems[itemId].colSpan,
      rowSpan: gridItems[itemId].rowSpan,
    };

    // Determine if we're changing horizontal or vertical dimensions or both
    const isHorizontalChange =
      newColStart !== originalPosition.colStart ||
      newColSpan !== originalPosition.colSpan;

    const isVerticalChange =
      newRowStart !== originalPosition.rowStart ||
      newRowSpan !== originalPosition.rowSpan;

    // If doing a corner drag, check both axes separately
    if (isHorizontalChange && isVerticalChange) {
      // Create horizontal-only and vertical-only change objects
      const horizontalOnly = {
        colStart: newColStart,
        colSpan: newColSpan,
        rowStart: originalPosition.rowStart,
        rowSpan: originalPosition.rowSpan,
      };

      const verticalOnly = {
        colStart: originalPosition.colStart,
        colSpan: originalPosition.colSpan,
        rowStart: newRowStart,
        rowSpan: newRowSpan,
      };

      // Check for collisions on each axis separately
      const axisCollisions = checkAxisCollisions(
        itemId,
        horizontalOnly,
        verticalOnly,
        originalPosition,
        gridItems
      );

      // Determine final positions based on collision results
      const finalColStart = axisCollisions.horizontal
        ? originalPosition.colStart
        : newColStart;

      const finalColSpan = axisCollisions.horizontal
        ? originalPosition.colSpan
        : newColSpan;

      const finalRowStart = axisCollisions.vertical
        ? originalPosition.rowStart
        : newRowStart;

      const finalRowSpan = axisCollisions.vertical
        ? originalPosition.rowSpan
        : newRowSpan;

      // Only update if at least one axis can move
      if (!axisCollisions.horizontal || !axisCollisions.vertical) {
        updateGridItemPosition(
          itemId,
          finalColStart,
          finalRowStart,
          finalColSpan,
          finalRowSpan
        );

        // Update the active item dimensions in the context
        setActiveItemDimensions(finalColSpan, finalRowSpan);
      }
    } else {
      // For single-axis movements, do the regular collision check
      const collisions = checkCollisions(
        itemId,
        newColStart,
        newRowStart,
        newColSpan,
        newRowSpan,
        gridItems
      );

      // If there are no collisions, update position
      if (collisions.length === 0) {
        // Only update if dimensions or position have changed
        const currentItem = gridItems[itemId];
        if (
          newColSpan !== currentItem.colSpan ||
          newRowSpan !== currentItem.rowSpan ||
          newColStart !== currentItem.colStart ||
          newRowStart !== currentItem.rowStart
        ) {
          // Update grid context with new dimensions for this item
          updateGridItemPosition(
            itemId,
            newColStart,
            newRowStart,
            newColSpan,
            newRowSpan
          );

          // Update the active item dimensions in the context
          setActiveItemDimensions(newColSpan, newRowSpan);
        }
      }
    }
  }

  // Handle drag
  else if (isDraggingRef.current && gridItemRef.current) {
    // Calculate the delta movement
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    // Account for scrolling
    const scrollDeltaX = window.scrollX - dragRef.current.startScrollX;
    const scrollDeltaY = window.scrollY - dragRef.current.startScrollY;

    // Adjust delta values with scroll changes
    const adjustedDeltaX = deltaX + scrollDeltaX;
    const adjustedDeltaY = deltaY + scrollDeltaY;

    // Get the current cell width based on the grid container width
    const gridContainer = gridItemRef.current.closest(".grid-wrapper");
    if (!gridContainer) return;

    const cellWidth = gridContainer.getBoundingClientRect().width / 12;

    // Calculate new grid positions
    const deltaColStart = Math.round(adjustedDeltaX / cellWidth);
    const deltaRowStart = Math.round(adjustedDeltaY / GRID_CELL_HEIGHT);

    // Calculate new colStart and rowStart with constraints
    // For horizontal movement: ensure we don't exceed grid boundaries (1 to 13-colSpan)
    const newColStart = Math.max(
      1,
      Math.min(
        13 - gridItems[itemId].colSpan,
        dragRef.current.startColStart + deltaColStart
      )
    );

    // For vertical movement: only constrain to minimum of 1 (no maximum)
    const newRowStart = Math.max(
      1,
      dragRef.current.startRowStart + deltaRowStart
    );

    // Calculate the bottom-most row this item will occupy
    const bottomRow = newRowStart + gridItems[itemId].rowSpan - 1;

    // If we're moving beyond current grid bounds, expand the grid
    expandRowsIfNeeded(bottomRow);

    // Store current position to revert if needed
    const originalPosition = {
      colStart: gridItems[itemId].colStart,
      rowStart: gridItems[itemId].rowStart,
      colSpan: gridItems[itemId].colSpan,
      rowSpan: gridItems[itemId].rowSpan,
    };

    // Determine if we're trying to move horizontally or vertically or both
    const isHorizontalMove = newColStart !== originalPosition.colStart;
    const isVerticalMove = newRowStart !== originalPosition.rowStart;

    // If trying to move both horizontally and vertically
    if (isHorizontalMove && isVerticalMove) {
      // Create move objects for each axis
      const horizontalOnly = {
        colStart: newColStart,
        colSpan: originalPosition.colSpan,
        rowStart: originalPosition.rowStart,
        rowSpan: originalPosition.rowSpan,
      };

      const verticalOnly = {
        colStart: originalPosition.colStart,
        colSpan: originalPosition.colSpan,
        rowStart: newRowStart,
        rowSpan: originalPosition.rowSpan,
      };

      // Check for collisions on each axis separately
      const axisCollisions = checkAxisCollisions(
        itemId,
        horizontalOnly,
        verticalOnly,
        originalPosition,
        gridItems
      );

      // Determine final positions based on collision results
      const finalColStart = axisCollisions.horizontal
        ? originalPosition.colStart
        : newColStart;

      const finalRowStart = axisCollisions.vertical
        ? originalPosition.rowStart
        : newRowStart;

      // Only update if at least one axis can move
      if (!axisCollisions.horizontal || !axisCollisions.vertical) {
        updateGridItemPosition(
          itemId,
          finalColStart,
          finalRowStart,
          originalPosition.colSpan,
          originalPosition.rowSpan
        );
      }
    } else {
      // For single-axis moves, use the regular collision check
      const collisions = checkCollisions(
        itemId,
        newColStart,
        newRowStart,
        gridItems[itemId].colSpan,
        gridItems[itemId].rowSpan,
        gridItems
      );

      // Only update position if there are no collisions
      if (collisions.length === 0) {
        // Update position
        updateGridItemPosition(
          itemId,
          newColStart,
          newRowStart,
          gridItems[itemId].colSpan,
          gridItems[itemId].rowSpan
        );
      }
    }
  }
};
