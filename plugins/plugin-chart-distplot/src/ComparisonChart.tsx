import React, { createRef, useEffect } from 'react';
import StackBarChart from './StackBarChart';
import { StackBarProps } from './types';

export default function ComparisonChart(props: StackBarProps) {
  const { data, width, height, metrics } = props;

  const rootElem = createRef<HTMLDivElement>();
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, [data]);

  return (
    <div style={{ width: width, height: height }}>
      <StackBarChart
        width={width}
        height={height}
        data={data}
        barColumn={metrics[0].column.column_name}
      />
    </div>
  );
}
