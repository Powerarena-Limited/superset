import React from 'react';
import Plot from 'react-plotly.js';
import {
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


  return (
    <div>
      <Plot
        style={{ width: width, height: height }}
        onClick={event => handleOnClick(event)}
        data={[
          {
            name: MISSING_ACTIVITY_COLUMN_MISSING,
            values: setPieChart(),
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
        ]}
        layout={{
          hovermode: 'closest',
          grid: { rows: 1, columns: 1 },
          showlegend: false,
          title: title,
        }}
      />
    </div>
  );
}