// DO NOT MODIFY THIS FILE DIRECTLY
// Instead, edit apps/web/src/shared/penpal-types.ts

import { z } from "zod";

export const cardSchema = z.object({
  id: z.string(),
  path: z.string(),
});

export type Card = z.infer<typeof cardSchema>;

export const layoutSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  maxW: z.number().optional(),
  minH: z.number().optional(),
  maxH: z.number().optional(),
  static: z.boolean().optional(),
  isDraggable: z.boolean().optional(),
  isResizable: z.boolean().optional(),
});

export const breakpoints = ["lg", "md", "sm", "xs", "xxs"] as const;
export const breakpointSchema = z.enum(breakpoints);
export type BreakPoint = z.infer<typeof breakpointSchema>;

export const layoutsSchema = z.record(breakpointSchema, z.array(layoutSchema));

export type Layouts = z.infer<typeof layoutsSchema>;

export type Layout = z.infer<typeof layoutSchema>;

export const gridStateSchema = z.object({
  cards: z.array(cardSchema),
  layouts: layoutsSchema,
});

export type GridState = z.infer<typeof gridStateSchema>;

// Parent to iframe messages
type SetGridState = {
  type: "setGridState";
  state: GridState;
};

type FocusElement = {
  type: "focusElement";
  id: string;
};

export type ParentToIframeMessage = SetGridState | FocusElement;

type IframeReady = {
  type: "iframeReady";
};

// Iframe to parent messages
type GridStateUpdated = {
  type: "gridStateUpdated";
  gridState: GridState;
};

type HandleEdit = {
  type: "handleEdit";
  id: string;
};

type AddComponent = {
  type: "addComponent";
};

type CreateComponent = {
  type: "createComponent";
};

type ComponentError = {
  type: "componentError";
  error: {
    message: string;
    stack?: string;
  };
  path: string;
};

type ConnectDatabase = {
  type: "connectDatabase";
};

export type IframeToParentMessage =
  | IframeReady
  | GridStateUpdated
  | HandleEdit
  | AddComponent
  | CreateComponent
  | ComponentError
  | ConnectDatabase;
