import React from 'react';
import Plot from 'react-plotly.js';
import {
  COLOR_MISSING_ACTIVITY_COLUMN_C_C,
  COLOR_MISSING_ACTIVITY_COLUMN_C_W,
  COLOR_MISSING_ACTIVITY_COLUMN_M_C,
  COLOR_MISSING_ACTIVITY_COLUMN_M_W,
  COLOR_SOP_WAITING_STEP_PROCESS,
  COLOR_SOP_WAITING_STEP_WAITING,
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
  const {
    width,
    height,
    pieTitle,
    currentMissingPieData,
    currentWaitingPieData,
    handleOnClick,
  } = props;

  return (
    <Plot
      style={{ width: width, height: height }}
      onClick={event => handleOnClick(event)}
      data={[
        {
          name: MISSING_ACTIVITY_COLUMN_MISSING,
          values: currentMissingPieData,
          labels: [
            MISSING_ACTIVITY_COLUMN_M_W,
            MISSING_ACTIVITY_COLUMN_M_C,
            MISSING_ACTIVITY_COLUMN_C_W,
            MISSING_ACTIVITY_COLUMN_C_C,
          ],
          marker: {
            colors: [
              COLOR_MISSING_ACTIVITY_COLUMN_M_W,
              COLOR_MISSING_ACTIVITY_COLUMN_M_C,
              COLOR_MISSING_ACTIVITY_COLUMN_C_W,
              COLOR_MISSING_ACTIVITY_COLUMN_C_C,
            ],
          },
          type: 'pie',
          domain: {
            row: 0,
            column: 0,
          },
          textinfo: 'percent',
        },
        {
          name: SOP_WAITING_STEP_WAITING,
          values: currentWaitingPieData,
          labels: [SOP_WAITING_STEP_WAITING, SOP_WAITING_STEP_PROCESS],
          marker: {
            colors: [
              COLOR_SOP_WAITING_STEP_WAITING,
              COLOR_SOP_WAITING_STEP_PROCESS,
            ],
          },
          type: 'pie',
          domain: {
            row: 1,
            column: 0,
          },
          textinfo: 'percent',
        },
      ]}
      layout={{
        hovermode: 'closest',
        grid: { rows: 2, columns: 1 },
        showlegend: true,
        legend: {
          x: 1,
          y: 0.5,
        },
        title: pieTitle,
        margin: {
          l: 50,
          r: 20,
          b: 50,
          t: 50,
          pad: 4,
        },
        autosize: true
      }}
    />
  );
}
