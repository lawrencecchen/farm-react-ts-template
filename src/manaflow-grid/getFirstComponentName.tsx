import React from "react";

// Helper function to extract component name from React children
export const getFirstComponentName = (children: React.ReactNode): string => {
  if (!children) return "Unknown";

  // If children is a single element
  if (React.isValidElement(children)) {
    const childType = children.type;
    // Handle different types of components
    if (typeof childType === "function") {
      // Use type assertion to safely access displayName and name properties
      return (childType as any).displayName || (childType as any).name || "UnnamedComponent";
    }
    // Handle string type (HTML elements)
    if (typeof childType === "string") {
      return childType;
    }
  }

  // If children is an array, check the first element
  else if (Array.isArray(children) && children.length > 0 && React.isValidElement(children[0])) {
    const childType = children[0].type;
    if (typeof childType === "function") {
      return (childType as any).displayName || (childType as any).name || "UnnamedComponent";
    }
    if (typeof childType === "string") {
      return childType;
    }
  }

  return "Unknown";
};
