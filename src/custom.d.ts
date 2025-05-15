declare module '~/custom/*' {
  import type React from 'react';
  const TestComponent: React.FC;
  export default TestComponent;
}

declare module '../custom/*' {
  import type React from 'react';
  const TestComponent: React.FC;
  export default TestComponent;
}

declare module '@manaflow/grid-component' {
  import type React from 'react';
  import type { GridItemProps } from '~/grid/GridItemProps';
  const GridComponent: React.FC<GridItemProps & { componentKey: string }>;
  export default GridComponent;
}
