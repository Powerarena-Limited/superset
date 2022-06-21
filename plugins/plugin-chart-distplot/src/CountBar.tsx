import React from 'react';
import Plot from 'react-plotly.js';
import {
  SOP_DATA_COLUMN,
  SOP_DATA_COLUMN_NAME,
  SOP_DATA_COLUMN_LEAN,
  SOP_DATA_COLUMN_TARGET,
  CYCLE_TIME_COLUMN,
  COLOR_VA,
  COLOR_RNVA,
  COLOR_NVA,
  COLOR_CYCLE_TIME,
  SOP_DATA_COLUMN_EVENT_TS,
  DISTRIBUTION_CHART_ON_THE_BOTTOM_RIGHT,
  COLOR_VA_HOVER,
  COLOR_RNVA_HOVER,
  COLOR_NVA_HOVER,
} from './constants';
import { CountBarProps } from './types';

export default function CountBar(props: CountBarProps) {
  const { data, width, height } = props;

  //   const [counts, setCounts] = useState<Array<any>>();
  let sopData = JSON.parse(data[0][SOP_DATA_COLUMN]);
  let steps: Array<any> = [];
  let lean: Array<string> = [];
  let targetTime: Array<any> = [];
  Object.keys(sopData).map((key: any) => {
    steps.unshift(sopData[key][SOP_DATA_COLUMN_NAME]);
    lean.unshift(sopData[key][SOP_DATA_COLUMN_LEAN]);
    targetTime.unshift(sopData[key][SOP_DATA_COLUMN_TARGET]);
  });
  let generateColors = (data: any, stringColorMap: any): Array<any> => {
    let listColor: Array<any> = [];
    if (data) {
      data.forEach((lean: any) => {
        listColor.push(stringColorMap[lean]);
      });
    }
    return listColor;
  };
  let accomplishColors = generateColors(lean, {
    VA: COLOR_VA,
    RNVA: COLOR_RNVA,
    NVA: COLOR_NVA,
    [CYCLE_TIME_COLUMN]: COLOR_CYCLE_TIME,
  });
  let missingColors = generateColors(lean, {
    VA: COLOR_VA_HOVER,
    RNVA: COLOR_RNVA_HOVER,
    NVA: COLOR_NVA_HOVER,
    [CYCLE_TIME_COLUMN]: COLOR_CYCLE_TIME,
  });

  let generateCounts = (data: any) => {
    let missingCounts: Array<any> = [],
      accomplishCounts: Array<any> = [];
    for (let i = 0; i < steps.length; i++) {
      missingCounts.push(0);
    }
    for (let i = 0; i < data.length; i++) {
      let sopData = JSON.parse(data[i][SOP_DATA_COLUMN]);
      let keys = Object.keys(sopData);
      for (let i = 0; i < keys.length; i++) {
        if (-1 === sopData[keys[i]][SOP_DATA_COLUMN_EVENT_TS]) {
          missingCounts[i] = missingCounts[i] + 1;
        }
      }
    }
    for (let i = 0; i < steps.length; i++) {
      accomplishCounts[i] = data.length - missingCounts[i];
    }
    return { accomplishCounts, missingCounts };
  };

  const { accomplishCounts, missingCounts } = generateCounts(data);
  return (
    <Plot
      style={{ width: width, height: height }}
      data={[
        {
          x: accomplishCounts.reverse(),
          y: steps,
          name: 'counts',
          type: 'bar',
          marker: {
            color: accomplishColors,
          },
          orientation: 'h',
        },
        {
          x: missingCounts.reverse(),
          y: steps,
          name: 'counts',
          type: 'bar',
          marker: {
            color: missingColors,
            size: 12,
          },
          orientation: 'h',
        },
      ]}
      layout={{
        barmode: 'stack',
        hovermode: 'closest',
        showlegend: false,
        margin: {
          l: 50,
          r: 20,
          b: 33,
          t: 58 + (height - 70) / (steps.length + 1),
          pad: 4,
        },
        autosize: true,
        yaxis: {
          ticks: 'outside',
          automargin: true,
        },
        title: {
          text: DISTRIBUTION_CHART_ON_THE_BOTTOM_RIGHT,
        },
      }}
    />
  );
}
