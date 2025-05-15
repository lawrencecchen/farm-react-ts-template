import { Grid, GridItem } from "@manaflow/grid";
import { Button, DateRangePicker } from "@tremor/react";
import { useState } from "react";
// import CustomComponent from "virtual:custom/admin_panels_by_month_chart@2"; // TODO test it
// import CustomComponent from "~/custom/admin_panels_by_month_chart@2"; // TODO test it

function ComponentLoader({
  onComponentLoaded,
}: {
  onComponentLoaded?: (component: React.ReactElement) => void;
}) {
  async function loadComponent() {
    const key = prompt("Enter key@version");
    if (!key) {
      return;
    }
    // Convention: prefix a virtual module with `virtual:` to distinguish with normal file system module
    const Component = await import.meta.loadManaComponent(
      `~/custom/${key}.tsx`,
    );
    console.log("got module", Component);
    onComponentLoaded?.(<Component />);
  }

  return (
    <div>
      <Button onClick={loadComponent}>Load Component</Button>
    </div>
  );
}

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Button
        onClick={() => setCount(count + 1)}
        className="h-full w-full tabular-nums"
      >
        Increment {count}
      </Button>
    </div>
  );
}

export default function App() {
  const [loadedComponents, setLoadedComponents] = useState<
    React.ReactElement[]
  >([]);

  const addComponent = (component: React.ReactElement) => {
    setLoadedComponents((prev) => [...prev, component]);
  };

  return (
    <Grid>
      <GridItem colSpan={2} rowSpan={6} colStart={1} rowStart={1}>
        <DateRangePicker />
      </GridItem>
      <GridItem colSpan={2} rowSpan={6} colStart={3} rowStart={1}>
        <Counter />
      </GridItem>
      {/* <GridItem colSpan={4} rowSpan={40} colStart={5} rowStart={1}>
        <CustomComponent />
      </GridItem> */}
      <GridItem colSpan={4} rowSpan={6} colStart={9} rowStart={1}>
        <ComponentLoader onComponentLoaded={addComponent} />
      </GridItem>
      {loadedComponents.map((component, index) => (
        <GridItem
          // biome-ignore lint/suspicious/noArrayIndexKey: who cares
          key={index}
          colSpan={12}
          rowSpan={40}
          colStart={1}
          rowStart={7 + index * 40}
        >
          {component}
        </GridItem>
      ))}
    </Grid>
  );
}
