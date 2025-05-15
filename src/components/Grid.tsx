import { Button, DropdownMenu, IconButton } from "@radix-ui/themes";
import clsx from "clsx";
import { EllipsisVertical, GripHorizontal } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { ItemCallback } from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card } from "~/components/Card";
import { BREAKPOINTS, COLS, useBreakpoint } from "~/hooks/useBreakpoint";
import type {
  BreakPoint,
  GridState,
  IframeToParentMessage,
  Layout,
  Layouts,
  ParentToIframeMessage,
} from "~/lib/parent-rpc-types-autogen";
import { postMessageToParent } from "~/lib/postMessageToParent";
import { ErrorDisplay } from "./ErrorDisplay";

export function DynamicComponent({ path }: { path: string }) {
  const [key, setKey] = React.useState(0);
  const [importError, setImportError] = React.useState<Error | null>(null);

  const Component = React.useMemo(
    () =>
      React.lazy(() =>
        import(/* @vite-ignore */ path).catch((err) => {
          setImportError(err);
          throw err;
        }),
      ),
    [path],
  );

  if (importError) {
    return (
      <ErrorDisplay
        error={importError}
        reset={() => {
          setImportError(null);
          setKey((k) => k + 1);
        }}
        message="Failed to import component"
      />
    );
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorDisplay
          error={error}
          reset={() => {
            setKey((k) => k + 1);
            resetErrorBoundary();
          }}
          message="An error occurred."
        />
      )}
    >
      <React.Suspense fallback={null}>
        <Component key={key} />
      </React.Suspense>
    </ErrorBoundary>
  );
}

export function GridItem({
  id,
  path,
  children,
  onRemove,
  onEdit,
  hideHandles = false,
  hideDropdown = false,
}: {
  id: string;
  path: string;
  children?: React.ReactNode;
  onRemove: ({ id }: { id: string }) => void;
  onEdit: ({ id }: { id: string }) => void;
  hideHandles?: boolean;
  hideDropdown?: boolean;
}) {
  return (
    <>
      {!hideHandles && (
        <div className="drag-handle absolute left-1/2 top-[1.5px] z-10 -translate-x-[2px] cursor-move rounded px-2 pb-1.5 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
          <GripHorizontal className="size-3 text-neutral-900" />
        </div>
      )}
      {!hideDropdown && (
        <div className="absolute right-1 top-1 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" size="1" aria-label="Open card options" radius="full">
                <EllipsisVertical className="size-3.5 text-neutral-500 group-hover:text-neutral-900" />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="1">
              <DropdownMenu.Item onClick={() => onEdit({ id })}>Edit</DropdownMenu.Item>
              <DropdownMenu.Item color="red" onClick={() => onRemove({ id })}>
                Remove
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      )}
      <Card className="grid-item-inner-wrapper flex h-full w-full grow flex-col">
        {children ? children : <DynamicComponent path={path} />}
      </Card>
    </>
  );
}

export function Grid({ initialGrid }: { initialGrid: GridState }) {
  const [gridState, setGridState] = useState(initialGrid);
  const breakpoint = useBreakpoint();

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data as ParentToIframeMessage;
      // console.log("[child] message", message);
      if (message.type === "setGridState") {
        setGridState(message.state);
      } else if (message.type === "focusElement") {
        const element = document.getElementById(message.id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
    window.parent.postMessage(
      {
        type: "iframeReady",
      } satisfies IframeToParentMessage,
      "*",
    );
  }, []);

  const [isEditing] = useState(true);

  const handleEdit = useCallback(async ({ id }: { id: string }) => {
    window.parent.postMessage(
      {
        type: "handleEdit",
        id,
      } satisfies IframeToParentMessage,
      "*",
    );
  }, []);

  const handleRemove = useCallback(
    async ({ id }: { id: string }) => {
      const newGridState: GridState = {
        ...gridState,
        cards: gridState.cards.filter((card) => card.id !== id),
        layouts: (Object.keys(gridState.layouts) as BreakPoint[]).reduce<Layouts>((acc, key) => {
          acc[key] = gridState.layouts[key]?.filter((item) => item.i !== id) || [];
          return acc;
        }, {} as Layouts),
      };
      setGridState(newGridState);
      postMessageToParent({
        type: "gridStateUpdated",
        gridState: newGridState,
      });
    },
    [gridState],
  );

  const children = useMemo(() => {
    return gridState.cards.map(({ id, path }) => (
      <div
        key={id}
        id={id}
        className={clsx("grid-item group relative flex flex-col", isEditing ? "select-none" : undefined)}
      >
        <GridItem key={id} id={id} path={path} onRemove={handleRemove} onEdit={handleEdit} />
      </div>
    ));
  }, [gridState.cards, isEditing, handleRemove, handleEdit]);
  const ResponsiveGridLayout = useMemo(() => WidthProvider(Responsive), []);

  const onDragStop: ItemCallback = useCallback(
    (newLayout) => {
      postMessageToParent({
        type: "gridStateUpdated",
        gridState: {
          cards: gridState.cards,
          layouts: {
            ...gridState.layouts,
            [breakpoint]: newLayout,
          },
        },
      });
    },
    [gridState, breakpoint],
  );

  const onResizeStop: ItemCallback = useCallback(
    (newLayout) => {
      postMessageToParent({
        type: "gridStateUpdated",
        gridState: {
          cards: gridState.cards,
          layouts: {
            ...gridState.layouts,
            [breakpoint]: newLayout,
          },
        },
      });
    },
    [gridState, breakpoint],
  );

  const onLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: Layouts) => {
    setGridState((state) => ({
      ...state,
      layouts: allLayouts,
    }));
  }, []);

  return (
    <div>
      {gridState.cards.length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 pt-20">
          <div className="text-center text-sm text-neutral-500">
            Your dashboard is empty. Add your first chart or create a new one to get started.
          </div>
          <Button
            variant="soft"
            size="1"
            onClick={() =>
              postMessageToParent({
                type: "createComponent",
              })
            }
          >
            Create component
          </Button>
          <div className="flex gap-2">
            <Button
              variant="soft"
              size="1"
              onClick={() =>
                postMessageToParent({
                  type: "addComponent",
                })
              }
            >
              Add component
            </Button>
            <Button
              variant="soft"
              size="1"
              onClick={() =>
                postMessageToParent({
                  type: "connectDatabase",
                })
              }
            >
              Connect database
            </Button>
          </div>
        </div>
      )}
      <ResponsiveGridLayout
        className="layout m-0 h-screen w-screen p-0"
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={30}
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
        layouts={gridState.layouts}
        onLayoutChange={onLayoutChange}
        onDragStop={onDragStop}
        onResizeStop={onResizeStop}
        useCSSTransforms={false}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
}
