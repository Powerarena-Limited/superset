import React from 'react';
import Plot from 'react-plotly.js';
import {
  MISSING_ACTIVITY_COLUMN_C_C,
  MISSING_ACTIVITY_COLUMN_C_W,
  MISSING_ACTIVITY_COLUMN_MISSING,
  MISSING_ACTIVITY_COLUMN_M_C,
  MISSING_ACTIVITY_COLUMN_M_W,
  SOP_WAITING_STEP_PROCESS,
  SOP_WAITING_STEP_WAITING,
} from './constants';
import { PieProps } from './types';

export function Pie(props: PieProps) {
  return (
    <Plot
      style={{ width: props.width, height: props.height }}
      onClick={(event) => props.handleOnClick(event)}
      data={[
        {
          name: MISSING_ACTIVITY_COLUMN_MISSING,
          values: props.currentMissingPieData,
          labels: [
            MISSING_ACTIVITY_COLUMN_M_W,
            MISSING_ACTIVITY_COLUMN_M_C,
            MISSING_ACTIVITY_COLUMN_C_W,
            MISSING_ACTIVITY_COLUMN_C_C,
          ],
          type: 'pie',
          domain: {
            row: 0,
            column: 0,
          },
          textinfo: 'label+percent',
        },
        {
          name: SOP_WAITING_STEP_WAITING,
          values: props.currentWaitingPieData,
          labels: [SOP_WAITING_STEP_WAITING, SOP_WAITING_STEP_PROCESS],
          type: 'pie',
          domain: {
            row: 1,
            column: 0,
          },
          textinfo: 'label+percent',
        },
      ]}
      layout={{
        hovermode: 'closest',
        grid: { rows: 2, columns: 1 },
        showlegend: false,
        title: props.pieTitle,
      }}
    />
  );
}
