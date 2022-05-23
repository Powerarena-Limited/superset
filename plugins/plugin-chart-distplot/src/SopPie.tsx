import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import {
  COLOR_MISSING_ACTIVITY_COLUMN_C_C,
  COLOR_MISSING_ACTIVITY_COLUMN_C_W,
  COLOR_MISSING_ACTIVITY_COLUMN_M_C,
  COLOR_MISSING_ACTIVITY_COLUMN_M_W,
  MISSING_ACTIVITY_COLUMN,
  MISSING_ACTIVITY_COLUMN_C_C,
  MISSING_ACTIVITY_COLUMN_C_W,
  MISSING_ACTIVITY_COLUMN_MISSING,
  MISSING_ACTIVITY_COLUMN_M_C,
  MISSING_ACTIVITY_COLUMN_M_W,
  WRONG_SEQUENCE_COLUMN,
  WRONG_SEQUENCE_COLUMN_WRONG,
} from './constants';
import { SopPieProps } from './types';

export function SopPie(props: SopPieProps) {
  const { width, height, data, title, handleOnClick } = props;

  let setPieChart = () => {
    let missingPieData: Array<number> = [0, 0, 0, 0];
    for (let i = 0; i < data.length; i++) {
      let currentData: any = data[i];
      if (
        currentData[MISSING_ACTIVITY_COLUMN] === MISSING_ACTIVITY_COLUMN_MISSING
      ) {
        if (
          currentData[WRONG_SEQUENCE_COLUMN] === WRONG_SEQUENCE_COLUMN_WRONG
        ) {
          missingPieData[0] = missingPieData[0] + 1; // M + W
        } else {
          missingPieData[1] = missingPieData[1] + 1; // M + C
        }
      } else {
        if (currentData[WRONG_SEQUENCE_COLUMN] == WRONG_SEQUENCE_COLUMN_WRONG) {
          missingPieData[2] = missingPieData[2] + 1; // C +
        } else {
          missingPieData[3] = missingPieData[3] + 1; // C + C
        }
      }
    }
    return missingPieData;
  };

  let missingActivityLabels = [
    MISSING_ACTIVITY_COLUMN_M_W,
    MISSING_ACTIVITY_COLUMN_M_C,
    MISSING_ACTIVITY_COLUMN_C_W,
    MISSING_ACTIVITY_COLUMN_C_C,
  ];
  let missingActivityWidth: Array<number> = [0.1, 0.1, 0.1, 0.1];
  const [missingWidth, setMissingWidth] = useState<Array<number>>([0]);

  let handleOnHover = (event: any) => {
    let label = event.points[0].label;
    let pos = missingActivityLabels.indexOf(label);
    missingActivityWidth[pos] = 3;
    setMissingWidth(missingActivityWidth);
  };

  let handleOnUnHover = (event: any) => {
    let label = event.points[0].label;
    let pos = missingActivityLabels.indexOf(label);
    missingActivityWidth[pos] = 0.1;
    setMissingWidth(missingActivityWidth);
  };

  useMemo(() => {}, [missingWidth]);

  return (
    <div style={{ width: width, height: height }}>
      <Plot
        style={{ width: width, height: height }}
        onClick={event => handleOnClick(event)}
        onHover={event => handleOnHover(event)}
        onUnhover={event => handleOnUnHover(event)}
        data={[
          {
            name: MISSING_ACTIVITY_COLUMN_MISSING,
            values: setPieChart(),
            labels: missingActivityLabels,
            marker: {
              colors: [
                COLOR_MISSING_ACTIVITY_COLUMN_M_W,
                COLOR_MISSING_ACTIVITY_COLUMN_M_C,
                COLOR_MISSING_ACTIVITY_COLUMN_C_W,
                COLOR_MISSING_ACTIVITY_COLUMN_C_C,
              ],
              line: {
                width: missingWidth,
                color: COLOR_MISSING_ACTIVITY_COLUMN_C_W,
              },
            },
            type: 'pie',
            domain: {
              row: 0,
              column: 0,
            },
            textinfo: 'percent',
          },
        ]}
        layout={{
          hovermode: 'closest',
          grid: { rows: 1, columns: 1 },
          showlegend: true,
          title: title,
          autosize: true,
          margin: {
            l: 20,
            r: 20,
            b: 20,
            t: 20,
            pad: 4,
          },
        }}
      />
    </div>
  );
}
