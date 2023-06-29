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
import React, { useState, useMemo } from 'react';
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
  COLOR_HOVER_ACTIVITY_COLUMN_C_C,
  COLOR_DISTRUBUTION_BAR_HOVER,
  COLOR_TABLE_FILL,
  COLOR_VIEW_VIDEO_BUTTON,
  TARGET_CYCLE_TIME_COLUMN_VALUE,
  DISTRIBUTION_CHART_ON_THE_TOP_TITLE,
  DISTRIBUTION_CHART_ON_THE_BOTTOM_RIGHT,
  COLOR_DISABLE_VIEW_VIDEO,
} from './constants';
import { Pie } from './Pie';
import ScatterPlot from './ScatterPlot';
import CountBar from './CountBar';
import Vector from './images/Vector.svg';

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
  // const [pieTitle, setPieTitle] = useState(
  //   'Click to left bar to show Pie Chart',
  // );
  const [distData, setDistData] = useState<Array<any>>([{}]);
  const [selected, setSelected] = useState<Array<any>>([]);
  const [selectedPie, setSelectedPie] = useState<Array<string>>([]);
  const [playbackData, setPlaybackData] = useState<any>({});

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
    // setPieTitle('Cycle Time From: ' + start + ' To ' + end);
    setScatterData(scatterData);
    setScatterRawData(scatterData);
    setCurrentMissingPieRawData(missingPieRawData);
  };

  let parseActivities = (activities: any): any => JSON.parse(activities);
  let handleOnClickPie = (event: any) => {
    setPlaybackData({});
    let label = event.points[0].label,
      selectedPieData: Array<any> = selectedPie;
    if (selectedPieData.indexOf(label) === -1) {
      selectedPieData.push(label);
      setSelectedPie(selectedPieData);
    } else {
      selectedPieData = selectedPieData.filter(
        (item: string) => item !== label,
      );
      setSelectedPie(selectedPieData);
    }
    console.log('@142', selectedPieData, label);
    let pieData: Array<any> = [];
    for (let i = 0; i < selectedPieData.length; i++) {
      if (MISSING_ACTIVITY_COLUMN_M_W === selectedPieData[i]) {
        pieData = pieData.concat(currentMissingPieRawData[0]);
      } else if (MISSING_ACTIVITY_COLUMN_M_C === selectedPieData[i]) {
        pieData = pieData.concat(currentMissingPieRawData[1]);
      } else if (MISSING_ACTIVITY_COLUMN_C_W === selectedPieData[i]) {
        pieData = pieData.concat(currentMissingPieRawData[2]);
      } else if (MISSING_ACTIVITY_COLUMN_C_C === selectedPieData[i]) {
        pieData = pieData.concat(currentMissingPieRawData[3]);
      }
    }
    if (selectedPieData.length === 0) {
      setScatterData(scatterRawData);
    } else {
      setScatterData(pieData);
    }
  };
  let updatePlaybackDate = (
    eventTs: any,
    deviceId: any,
    pos: any,
    cycleTime: any,
  ) => {
    if (eventTs !== undefined)
      setPlaybackData({ eventTs, deviceId, pos, cycleTime });
    else setPlaybackData({});
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
      hoverinfo: 'x+text',
      text: 'target time: ' + targetCycleTime + 'sec',
      x: [targetCycleTime, targetCycleTime],
      y: [0, data.length / 2],
      name: TARGET_CYCLE_TIME_COLUMN_VALUE,
      line: {
        color: COLOR_LINE,
        width: 3,
      },
    },
  ];
  let handleOnClick = (event: any) => {
    setSelectedPie([]);
    setPlaybackData({});
    let selectedData = selected;
    if (
      selectedData.filter((item: any) => item.id === event.points[0].binNumber)
        .length === 0
    ) {
      let indices: Array<number> = event.points[0].pointIndices;
      selectedData.push({ id: event.points[0].binNumber, indices: indices });
      setSelected(selectedData);
    } else {
      selectedData = selectedData.filter(
        (item: any) => item.id !== event.points[0].binNumber,
      );
      setSelected(selectedData);
    }
    let indices: Array<any> = [];
    for (const item of selectedData) {
      indices = indices.concat(item.indices);
    }
    if (selectedData.length > 0) {
      setPieChart(
        indices,
        (event.points[0].x - DIST_X_SIZE / 2).toString(),
        (event.points[0].x + DIST_X_SIZE / 2).toString(),
      );
    }
    let updateDistChartData = distChartData;
    let colors = Array.from(
      Array((DIST_X_END - DIST_X_START) / DIST_X_SIZE).keys(),
    ).map((index: number) => {
      if (selectedData.filter((item: any) => item.id === index).length > 0) {
        return COLOR_DISTRUBUTION_BAR_HOVER;
      } else {
        return COLOR_DISTRUBUTION_BAR;
      }
    });
    updateDistChartData[0].marker = { color: colors };
    setDistData(updateDistChartData);
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
        color: COLOR_HOVER_ACTIVITY_COLUMN_C_C,
      },
    };
    setDistData(updateDistChartData);
  };

  let handleOnUnHover = (event: any) => {
    let updateDistChartData = distChartData;
    updateDistChartData[0].marker = {
      ...distData[0].marker,
      line: { width: 0.1 },
    };
    setDistData(updateDistChartData);
  };

  // const rootElem = createRef<HTMLDivElement>();
  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and the useEffect hook.
  useMemo(() => {
    // const root = rootElem.current as HTMLElement;
    // console.log('Plugin element', root);
    let initIndices = Array.from(Array(data.length).keys());
    if (selected.length === 0) {
      setPieChart(initIndices, DIST_X_START.toString(), DIST_X_END.toString());
      setDistData(distChartData);
    }
  }, [width, height, selected, data]);
  let distplotDivStyle = {
    display: 'flex',
    width: width,
    height: (height - 75) * 0.5,
    flex: 3,
  };

  let distplotStyle = {
    width: width * 0.62,
    height: (height - 75) * 0.5,
  };

  let viewVideoButton: any = {
    width: '100%',
    height: '40px',
    background: COLOR_VIEW_VIDEO_BUTTON,
    borderRadius: '8px',
    border: 0,
    color: COLOR_TABLE_FILL,
    marginTop: '10px',
  };

  // let tableData: any = [
  //   {
  //     type: 'table',
  //     header: {
  //       values: [
  //         ['<b>CT Event Ratio</b>'],
  //         ['<b>COUNT</b>'],
  //         ['<b>TTL MISING</b>'],
  //         ['<b>TTL WRONG</b>'],
  //         ['<b>Mean CT</b>'],
  //       ],
  //       align: 'center',
  //       line: { width: 1, color: 'black' },
  //       fill: { color: 'white' },
  //       font: { family: 'Arial', size: 15, color: 'Black' },
  //     },
  //     cells: {
  //       values: [
  //         [0],
  //         [0],
  //         [0],
  //         [0],
  //         [0],
  //       ],
  //       align: 'center',
  //       line: { color: 'black', width: 1 },
  //       font: { family: 'Arial', size: 14, color: ['black'] },
  //     },
  //   },
  // ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: width,
        height: height,
      }}
    >
      <div
        className="displot"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 2,
          width: width,
          height: (height - 75) * 0.5,
        }}
      >
        {/* <div
        style={{
          width: width,
        }}
      >
        <Plot
          style={{ width: width, height: 0.1 * height }}
          data={tableData}
          layout={{
            margin: {
              l: 50,
              r: 50,
              b: 0,
              t: 0,
              pad: 4,
            },
            autosize: true,
          }}
        /> */}
        {/* </div> */}
        <button
          style={{
            width: '84px',
            height: '25px',
            border: '1px solid #357470',
            borderRadius: '8px',
            marginLeft: 'auto',
            background: COLOR_TABLE_FILL,
          }}
          onClick={() => {
            setSelectedPie([]);
            setPlaybackData({});
            setSelected([]);
            setScatterData([...scatterRawData]);
            setCurrentMissingPieData([...currentMissingPieData]);
          }}
        >
          <Vector></Vector>Reset
        </button>
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
                yaxis: {
                  title: {
                    text: 'No. of Cycle',
                    font: { size: 16 },
                  },
                },
                xaxis: {
                  title: {
                    text: 'Cycle Time (s)',
                    font: { size: 16 },
                    standoff: 10,
                  },
                },
                autosize: true,
                title: DISTRIBUTION_CHART_ON_THE_TOP_TITLE,
              }}
              onClick={(event: any) => handleOnClick(event)}
              onHover={(event: any) => handleOnHover(event)}
              onUnhover={(event: any) => handleOnUnHover(event)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Pie
              width={width * 0.38}
              height={(height - 75) * 0.5 * 0.55}
              currentMissingPieData={currentMissingPieData}
              // pieTitle={pieTitle}
              handleOnClick={(event: any) => handleOnClickPie(event)}
            />
            <Pie
              width={width * 0.38}
              height={(height - 75) * 0.5 * 0.45}
              currentWaitingPieData={currentWaitingPieData}
              // pieTitle={pieTitle}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <ScatterPlot
            width={width * 0.62}
            height={(height - 75) * 0.5}
            data={scatterData}
            updatePlaybackDate={updatePlaybackDate}
          />
          <div>
            <CountBar
              width={0.38 * width}
              height={(height - 75) * 0.5}
              data={scatterData}
              title={DISTRIBUTION_CHART_ON_THE_BOTTOM_RIGHT}
            />
          </div>
        </div>
      </div>
      <button
        style={
          JSON.stringify(playbackData) !== '{}'
            ? { ...viewVideoButton }
            : {
                ...viewVideoButton,
                background: COLOR_DISABLE_VIEW_VIDEO,
                cursor: 'no-drop',
              }
        }
        onClick={() => videoPlaybak(playbackData)}
        disabled={JSON.stringify(playbackData) !== '{}' ? false : true}
      >
        View Video
      </button>
    </div>
  );
}

let videoPlaybak = (data: any) => {
  let clientName = '';
  let port = '10443';
  try {
    clientName =
      window.location.href.split('superset-')[1].split('.standalone')[0] || '';
    port =
      window.location.href.split('powerarena.com:')[1].split('/')[0] || '10443';
  } catch {}
  let endTime = data['eventTs'];
  let startTime = endTime - parseInt(data['cycleTime']) * 1000;
  endTime += 1000;
  startTime -= 1000;
  console.log('@video playbak', data, clientName, port);
  let url =
    'https://manage-' +
    clientName +
    '.standalone.powerarena.com:' +
    port +
    '/app/mes/repository/playback/?entity_code=' +
    data.deviceId +
    '&pos=' +
    data.pos +
    '&start_ts=' +
    startTime +
    '&end_ts=' +
    endTime;
  window.open(url, '_blank')?.focus();
};
