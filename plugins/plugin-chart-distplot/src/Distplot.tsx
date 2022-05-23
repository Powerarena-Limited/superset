/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import Plot from 'react-plotly.js';
import React, { useState, useEffect, useMemo } from 'react';
import { DistplotProps } from './types';
import {
  COLOR_DISTRUBUTION_BAR,
  COLOR_LINE,
  CYCLE_TIME_COLUMN,
  DIST_X_END,
  DIST_X_SIZE,
  DIST_X_START,
  MISSING_ACTIVITY_COLUMN,
  MISSING_ACTIVITY_COLUMN_C_C,
  MISSING_ACTIVITY_COLUMN_C_W,
  MISSING_ACTIVITY_COLUMN_MISSING,
  MISSING_ACTIVITY_COLUMN_M_C,
  MISSING_ACTIVITY_COLUMN_M_W,
  SOP_DATA_COLUMN,
  SOP_DATA_COLUMN_VALUE,
  SOP_WAITING_STEP,
  TARGET_CYCLE_TIME_COLUMN,
  WRONG_SEQUENCE_COLUMN,
  WRONG_SEQUENCE_COLUMN_WRONG,
} from './constants';
import { Pie } from './Pie';
import ScatterPlot from './ScatterPlot';
import CountBar from './CountBar';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function Distplot(props: DistplotProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { width, height, data } = props;
  const [currentMissingPieData, setCurrentMissingPieData] = useState<
    Array<number>
  >([0, 0, 0, 0]);
  const [currentMissingPieRawData, setCurrentMissingPieRawData] = useState<
    Array<any>
  >([[], [], [], []]);
  const [currentWaitingPieData, setCurrentwaitingPieData] = useState<
    Array<number>
  >([0, 0]);
  const [scatterData, setScatterData] = useState(data);
  const [scatterRawData, setScatterRawData] = useState<any>(data);
  const [pieTitle, setPieTitle] = useState(
    'Click to left bar to show Pie Chart',
  );
  const [distData, setDistData] = useState<Array<any>>([{}]);
  const [selected, setSelected] = useState<number>(-1);
  const [selectedPie, setSelectedPie] = useState<string>('-1');

  let targetCycleTime = data[0][TARGET_CYCLE_TIME_COLUMN];
  let cycleTimeList: Array<number> = [];
  data.forEach((item: any) => {
    let cycleTime: number =
      item[CYCLE_TIME_COLUMN] < DIST_X_END
        ? item[CYCLE_TIME_COLUMN]
        : DIST_X_END - 1;
    cycleTimeList.push(cycleTime);
  });

  let setPieChart = (indices: any, start: string, end: string) => {
    let missingPieData: Array<number> = [0, 0, 0, 0];
    let missingPieRawData: Array<any> = [[], [], [], []];
    // 1. M + W, 2, M + C, 3. C + C, 4. C + W
    // 1. missing + wrong, 2. missing + correct, 3. complete + wrong, 4. compelete + correct
    let waitingPieData: Array<number> = [0, 0];
    let scatterData: Array<any> = [];
    for (let i = 0; i < indices.length; i++) {
      let currentData: any = data[indices[i]];
      if (
        currentData[MISSING_ACTIVITY_COLUMN] === MISSING_ACTIVITY_COLUMN_MISSING
      ) {
        if (
          currentData[WRONG_SEQUENCE_COLUMN] === WRONG_SEQUENCE_COLUMN_WRONG
        ) {
          missingPieData[0] = missingPieData[0] + 1; // M + W
          missingPieRawData[0].push(currentData);
        } else {
          missingPieData[1] = missingPieData[1] + 1; // M + C
          missingPieRawData[1].push(currentData);
        }
      } else {
        if (currentData[WRONG_SEQUENCE_COLUMN] == WRONG_SEQUENCE_COLUMN_WRONG) {
          missingPieData[2] = missingPieData[2] + 1; // C + W
          missingPieRawData[2].push(currentData);
        } else {
          missingPieData[3] = missingPieData[3] + 1; // C + C
          missingPieRawData[3].push(currentData);
        }
      }

      let activities: any = parseActivities(currentData[SOP_DATA_COLUMN]);
      let waitingTime: number =
        activities[SOP_WAITING_STEP][SOP_DATA_COLUMN_VALUE];
      waitingPieData[0] = waitingPieData[0] + waitingTime;
      let currentCycleTime: number = currentData[CYCLE_TIME_COLUMN];
      waitingPieData[1] = waitingPieData[1] + currentCycleTime - waitingTime;
      scatterData.push(data[indices[i]]);
    }
    setCurrentMissingPieData(missingPieData);
    setCurrentwaitingPieData(waitingPieData);
    setPieTitle('Cycle Time From: ' + start + ' To ' + end);
    setScatterData(scatterData);
    setScatterRawData(scatterData);
    setCurrentMissingPieRawData(missingPieRawData);
  };

  let parseActivities = (activities: any): any => JSON.parse(activities);
  let handleOnClickPie = (event: any) => {
    let label = event.points[0].label;
    console.log("@142", selectedPie, label);
    if (selectedPie === label) {
      setScatterData(scatterRawData);
      setSelectedPie('');
    } else {
      setSelectedPie(label);
      if (MISSING_ACTIVITY_COLUMN_M_W === label) {
        setScatterData(currentMissingPieRawData[0]);
      } else if (MISSING_ACTIVITY_COLUMN_M_C === label) {
        setScatterData(currentMissingPieRawData[1]);
      } else if (MISSING_ACTIVITY_COLUMN_C_W === label) {
        setScatterData(currentMissingPieRawData[2]);
      } else if (MISSING_ACTIVITY_COLUMN_C_C === label) {
        setScatterData(currentMissingPieRawData[3]);
      }
    }
  };

  let distChartData: Array<any> = [
    {
      type: 'histogram',
      x: cycleTimeList,
      histnorm: 'count',
      marker: {
        color: COLOR_DISTRUBUTION_BAR,
      },
      xbins: {
        end: DIST_X_END,
        size: DIST_X_SIZE,
        start: DIST_X_START,
      },
      name: 'count',
    },
    {
      type: 'line',
      // mode: 'lines',
      x: [targetCycleTime, targetCycleTime],
      y: [0, data.length / 2],
      name: TARGET_CYCLE_TIME_COLUMN,
      line: {
        color: COLOR_LINE,
        width: 3,
      },
    },
  ];
  let handleOnClick = (event: any) => {
    setSelectedPie('');
    if (selected === event.points[0].binNumber) {
      setSelected(-1);
    } else {
      let indices: Array<number> = event.points[0].pointIndices;
      setPieChart(
        indices,
        (event.points[0].x - DIST_X_SIZE / 2).toString(),
        (event.points[0].x + DIST_X_SIZE / 2).toString(),
      );
      let updateDistChartData = distChartData;
      let colors = Array.from(
        Array((DIST_X_END - DIST_X_START) / DIST_X_SIZE).keys(),
      ).map((index: number) => {
        if (index === event.points[0].binNumber) {
          setSelected(index);
          return 'red';
        } else {
          return COLOR_DISTRUBUTION_BAR;
        }
      });
      updateDistChartData[0].marker = { color: colors };
      setDistData(updateDistChartData);
    }
  };

  let handleOnHover = (event: any) => {
    let width = Array.from(
      Array((DIST_X_END - DIST_X_START) / DIST_X_SIZE).keys(),
    ).map((index: number) => {
      if (index === event.points[0].binNumber) {
        return 3;
      } else {
        return 0.1;
      }
    });
    let updateDistChartData = distChartData;
    updateDistChartData[0].marker = {
      ...distData[0].marker,
      // opacity: opacities,
      line: {
        width: width,
        color: '#2B7EF5',
      }
    };
    setDistData(updateDistChartData);
  };

  let handleOnUnHover = (event: any) => {
    let updateDistChartData = distChartData;
updateDistChartData[0].marker = { ...distData[0].marker, line: { width: 0.1 } };
    setDistData(updateDistChartData);
  };

  // const rootElem = createRef<HTMLDivElement>();
  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and the useEffect hook.
  useMemo(() => {
    // const root = rootElem.current as HTMLElement;
    // console.log('Plugin element', root);
    let initIndices = Array.from(Array(data.length).keys());
    if (selected === -1) {
      setPieChart(initIndices, DIST_X_START.toString(), DIST_X_END.toString());
      setDistData(distChartData);
    }
  }, [width, height, selected, data]);

  let distplotDivStyle = {
    display: 'flex',
    width: width,
    height: height * 0.3,
    flex: 3,
  };

  let distplotStyle = {
    width: width * 0.62,
    height: height / 2,
  };

  return (
    <div
      className="displot"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 2,
        width: width,
        height: height,
      }}
    >
      <div style={distplotDivStyle}>
        <div>
          <Plot
            style={distplotStyle}
            data={distData}
            layout={{
              hovermode: 'x',
              bargap: 0.05,
              legend: { orientation: 'h' },
              margin: {
                l: 50,
                r: 20,
                b: 20,
                t: 50,
                pad: 4,
              },
              autosize: true,
            }}
            onClick={(event: any) => handleOnClick(event)}
            onHover={(event: any) => handleOnHover(event)}
            onUnhover={(event: any) => handleOnUnHover(event)}
          />
        </div>

        <div style={{ display: 'flex' }}>
          <Pie
            width={width * 0.38}
            height={height / 2}
            currentMissingPieData={currentMissingPieData}
            currentWaitingPieData={currentWaitingPieData}
            pieTitle={pieTitle}
            handleOnClick={(event: any) => handleOnClickPie(event)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <ScatterPlot
          width={width * 0.62}
          height={height * 0.5}
          data={scatterData}
        />
        <div>
          <CountBar
            width={0.38 * width}
            height={height / 2}
            data={scatterData}
          />
        </div>
      </div>
    </div>
  );
}
