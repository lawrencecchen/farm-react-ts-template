// Helper function to generate source code from gridItems
export function generateLayoutSourceCode({
  gridItems,
}: {
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
}): string {
  // Start with the component declaration
  let sourceCode = "export function Layout() {\n";
  sourceCode += "  return (\n";
  sourceCode += '    <div className="h-screen w-screen p-1">\n';
  sourceCode += "      <Grid>\n";

  // Sort grid items by position (first row then column) for readability
  const sortedItems = Object.entries(gridItems).sort(
    ([, a], [, b]) => a.rowStart - b.rowStart || a.colStart - b.colStart,
  );

  // Add each grid item
  for (const [, item] of sortedItems) {
    sourceCode += `        <GridItem colSpan={${item.colSpan}} rowSpan={${item.rowSpan}} colStart={${item.colStart}} rowStart={${item.rowStart}}>\n`;
    sourceCode += `          <${item.componentName} />\n`;
    sourceCode += "        </GridItem>\n";
  }

  // Close the component
  sourceCode += "      </Grid>\n";
  sourceCode += "    </div>\n";
  sourceCode += "  );\n";
  sourceCode += "}\n";

  return sourceCode;
}
