import React, { useMemo, useState } from 'react';
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

  let missingActivityLabels = [
    MISSING_ACTIVITY_COLUMN_M_W,
    MISSING_ACTIVITY_COLUMN_M_C,
    MISSING_ACTIVITY_COLUMN_C_W,
    MISSING_ACTIVITY_COLUMN_C_C,
  ];
  let initSopWaitingLables = [SOP_WAITING_STEP_WAITING, SOP_WAITING_STEP_PROCESS];
  let missingActivityWidth = [0.1, 0.1, 0.1, 0.1];
  let initSopWaitingWidth = [0.1, 0.1, 0.1, 0.1];
  let missingActivityColors = [
    COLOR_MISSING_ACTIVITY_COLUMN_M_W,
    COLOR_MISSING_ACTIVITY_COLUMN_M_C,
    COLOR_MISSING_ACTIVITY_COLUMN_C_W,
    COLOR_MISSING_ACTIVITY_COLUMN_C_C,
  ];

  const [missingColors, setMissingColors] = useState<Array<string>>(
    missingActivityColors,
  );
  const [missingWidth, setMissingWidth] =
    useState<Array<number>>(missingActivityWidth);
  const [sopWaitingWidth, setSOPWaitingWidth] = useState<Array<number>>(
    initSopWaitingWidth
  );
  const [selected, setSelected] = useState(-1);

  // init component state when new data arrived.
  useMemo(() => {
    setMissingColors(missingActivityColors);
    setSelected(-1);
  }, [pieTitle, currentMissingPieData, currentWaitingPieData]);

  let handleOnHover = (event: any) => {
    let label = event.points[0].label;
    let pos = missingActivityLabels.indexOf(label);
    if (pos === -1) {
      pos = initSopWaitingLables.indexOf(label);
      initSopWaitingWidth[pos] = 3;
      setSOPWaitingWidth(initSopWaitingWidth);
    } else {
      missingActivityWidth[pos] = 3;
      setMissingWidth(missingActivityWidth);
    }
  };
  let handleOnUnHover = (event: any) => {
    let label = event.points[0].label;
    let pos = missingActivityLabels.indexOf(label);
    if (pos === -1) {
      setSOPWaitingWidth(initSopWaitingWidth);
    } else {
      setMissingWidth(missingActivityWidth);
    }
  };
  return (
    <Plot
      style={{ width: width, height: height }}
      onClick={(event: any) => {
        let label = event.points[0].label;
        let pos = missingActivityLabels.indexOf(label);
        if (selected === pos) {
          setMissingColors(missingActivityColors);
          setSelected(-1);
        } else {
          missingActivityColors[pos] = 'red';
          setMissingColors(missingActivityColors);
          setSelected(pos);
        }
        handleOnClick(event);
      }}
      onHover={(event: any) => handleOnHover(event)}
      onUnhover={(event: any) => handleOnUnHover(event)}
      data={[
        {
          name: MISSING_ACTIVITY_COLUMN_MISSING,
          values: currentMissingPieData,
          labels: missingActivityLabels,
          marker: {
            colors: missingColors,
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
        {
          name: SOP_WAITING_STEP_WAITING,
          values: currentWaitingPieData,
          labels: initSopWaitingLables,
          marker: {
            colors: [
              COLOR_SOP_WAITING_STEP_WAITING,
              COLOR_SOP_WAITING_STEP_PROCESS,
            ],
            line: {
              width: sopWaitingWidth,
              color: COLOR_MISSING_ACTIVITY_COLUMN_C_W,
            }
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
        autosize: true,
      }}
    />
  );
}
