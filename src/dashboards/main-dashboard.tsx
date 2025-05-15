import { useState } from 'react';
import { Grid, GridItem } from '~/manaflow-grid/manaflow-grid';
import { Button } from '~/tremor/components';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Button onClick={() => setCount(count + 1)} className="h-full w-full">
        Increment {count}
      </Button>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="h-screen w-screen p-1">
      <Grid>
        <GridItem colSpan={2} rowSpan={6} colStart={1} rowStart={1}>
          <Counter />
        </GridItem>
        <GridItem colSpan={2} rowSpan={6} colStart={1} rowStart={1}>
          <Counter />
        </GridItem>
        <GridItem colSpan={2} rowSpan={6} colStart={1} rowStart={1}>
          <Counter />
        </GridItem>
        <GridItem colSpan={2} rowSpan={6} colStart={1} rowStart={1}>
          <Counter />
        </GridItem>

        {/* <GridComponent componentKey="agent_creation_over_time@1" colSpan={3} rowSpan={30} colStart={4} rowStart={1} />
        <GridComponent componentKey="agent_creation_over_time@1" colSpan={3} rowSpan={30} colStart={4} rowStart={31} /> */}
        {/* <GridComponent componentKey="agent_creation_over_time@1" colSpan={3} rowSpan={30} colStart={4} rowStart={61} /> */}
        {/* <GridComponent componentKey="agent_creation_over_time@1" colSpan={3} rowSpan={30} colStart={4} rowStart={61} /> */}

        {/* <GridItem colSpan={3} rowSpan={30} colStart={4} rowStart={61}>
          <Component_agent_creation_over_time_v1 />
        </GridItem> */}
      </Grid>
    </div>
  );
}
