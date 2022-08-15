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
import { ScatterPlotProps } from './types';
import {
  COLOR_SOP_WAITING_STEP_WAITING_HOVER,
  COLOR_DISTRUBUTION_BAR_HOVER,
  SCATTERPLOT_TITLE,
  COLOR_SOP_WAITING_STEP_PROCESS_HOVER,
  STACK_BAR_TITLE,
} from './constants';
import {
  EVENT_TS_COLUMN,
  SOP_DATA_COLUMN,
  SOP_DATA_COLUMN_EVENT_TS,
  SOP_DATA_COLUMN_VALUE,
  SOP_DATA_COLUMN_NAME,
  SOP_DATA_COLUMN_SEQUENCE,
  SOP_DATA_COLUMN_LEAN,
  SOP_DATA_COLUMN_TARGET,
  TARGET_CYCLE_TIME_COLUMN,
  CYCLE_TIME_COLUMN,
  SOP_DATA_COLUMN_KEY_PREFIX,
  COLOR_VA,
  COLOR_NVA,
  COLOR_RNVA,
  COLOR_CYCLE_TIME,
  // COLOR_GT_TARGET,
  // COLOR_LT_TARGET,
  COLOR_SOP_WAITING_STEP_WAITING,
} from './constants';

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

export default function ScatterPlot(props: ScatterPlotProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width, updatePlaybackDate } = props;
  // const [oneCycleData, setOneCycleData] = useState<any | any>({});
  // const [sopWithTargetData, setSopWithTargetData] = useState<Array<any>>([]);
  // const [showCurrentCycle, setShowCurrentCycle] = useState(false);
  // const [currentScatterData, setCurrentScatterData] = useState<any | any>([]);
  const [scatterPlotData, setScatterPlotData] = useState<any>({});
  data.sort((a: any, b: any, key = EVENT_TS_COLUMN) => {
    if (a[key] > b[key]) return 1;
    if (a[key] < b[key]) return -1;
    return 0;
  });

  // Init from first data.
  // @ts-ignore
  let sopData = JSON.parse(data[0][SOP_DATA_COLUMN]);
  let steps: Array<any> = [];
  let lean: Array<string> = [];
  let targetTime: Array<any> = [];
  Object.keys(sopData).map((key: any, index: number) => {
    steps.unshift(sopData[key][SOP_DATA_COLUMN_NAME]);
    if (index === 0) {
      // first step always waiting step
      lean.unshift('WAITING');
    } else {
      lean.unshift(sopData[key][SOP_DATA_COLUMN_LEAN]);
    }
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
  steps.push(CYCLE_TIME_COLUMN);
  lean.push(CYCLE_TIME_COLUMN);
  targetTime.push(data[0][TARGET_CYCLE_TIME_COLUMN]);
  let colors = generateColors(lean, {
    WAITING: COLOR_SOP_WAITING_STEP_WAITING,
    VA: COLOR_VA,
    RNVA: COLOR_RNVA,
    NVA: COLOR_NVA,
    [CYCLE_TIME_COLUMN]: COLOR_CYCLE_TIME,
  });

  let generateOneCycleData = (data: any): { [name: string]: Array<any> } => {
    let sopData = JSON.parse(data[SOP_DATA_COLUMN]);
    let times: Array<any> = [];
    let values: Array<any> = [];
    let names: Array<any> = [];
    let sequence: Array<any> = [];
    let lean: Array<string> = [];
    let target: Array<any> = [];
    Object.keys(sopData).map((key: any) => {
      if ('null' === sopData[key][SOP_DATA_COLUMN_VALUE].toString()) {
        sopData[key][SOP_DATA_COLUMN_VALUE] = 0;
      }
      times.unshift(sopData[key][SOP_DATA_COLUMN_EVENT_TS]);
      values.unshift(sopData[key][SOP_DATA_COLUMN_VALUE]);
      names.unshift(sopData[key][SOP_DATA_COLUMN_NAME]);
      sequence.unshift(sopData[key][SOP_DATA_COLUMN_SEQUENCE]);
      lean.unshift(sopData[key][SOP_DATA_COLUMN_LEAN]);
      target.unshift(sopData[key][SOP_DATA_COLUMN_TARGET]);
    });
    times.push(data[EVENT_TS_COLUMN]);
    names.push('Cycle Time');
    values.push(data[CYCLE_TIME_COLUMN]);
    sequence.push(0);
    lean.push('Cycle Time');
    target.push(data[TARGET_CYCLE_TIME_COLUMN]);
    return {
      times: times,
      values: values,
      names: names,
      sequence: sequence,
      lean: lean,
      target: target,
    };
  };

  let generateTrace = (
    x: Array<any>,
    steps: Array<any>,
    record: object,
    color: any,
    size: number,
    showlegend: boolean,
    name = '',
    symbol = 'circle',
    line_width = 0.3,
    type = 'scatter',
    mode = 'markers',
    marker = {
      color: color,
      symbol: symbol,
      size: size,
      opacity: 0.8,
      line: {
        width: line_width,
      },
    },
  ): any => {
    return {
      name: name,
      x: x,
      y: steps,
      record: record,
      type: type,
      mode: mode,
      showlegend: showlegend,
      marker: marker,
    };
  };

  let generateTraces = (data: any, steps: Array<string>): Array<any> => {
    let dataPlots = [];
    let count = 0;

    let perSopDatalist: { [step: string]: Array<any> } = {};
    for (let i = 0; i < steps.length; i++) {
      perSopDatalist[steps[i]] = [];
    }
    while (count < data.length) {
      let oneCycleData = generateOneCycleData(data[count]);
      let oneCycleDataValues = oneCycleData.values;
      let trace = generateTrace(
        oneCycleDataValues,
        steps,
        data[count],
        colors,
        12,
        false,
      );
      dataPlots.push(trace);
      for (let i = 0; i < steps.length; i++) {
        if (0 === oneCycleDataValues[i]) continue;
        perSopDatalist[steps[i]].push(oneCycleDataValues[i]);
      }
      count++;
    }
    const average = (arr: Array<number>): number =>
      arr.reduce((a, b) => a + b, 0) / arr.length;
    const median = (arr: Array<number>) => {
      const sorted = arr.slice().sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
      }
      return sorted[middle];
    };
    let averageList: Array<number> = [];
    let medianList: Array<number> = [];

    let averageData = JSON.parse(JSON.stringify(data[0]));
    let medianData = JSON.parse(JSON.stringify(data[0]));
    averageData[SOP_DATA_COLUMN] = JSON.parse(averageData[SOP_DATA_COLUMN]);
    medianData[SOP_DATA_COLUMN] = JSON.parse(medianData[SOP_DATA_COLUMN]);
    for (let i = 0; i < steps.length; i++) {
      let averageValue = average(perSopDatalist[steps[i]]);
      let medianValue = median(perSopDatalist[steps[i]]);
      averageList.push(averageValue);
      medianList.push(medianValue);
      if (i === steps.length - 1) continue;
      averageData[SOP_DATA_COLUMN][SOP_DATA_COLUMN_KEY_PREFIX + (i + 1)][
        SOP_DATA_COLUMN_VALUE
      ] = averageValue;
      medianData[SOP_DATA_COLUMN][SOP_DATA_COLUMN_KEY_PREFIX + (i + 1)][
        SOP_DATA_COLUMN_VALUE
      ] = medianValue;
    }
    let averageTrace = generateTrace(
      averageList,
      steps,
      averageData,
      '#D25C88',
      16,
      true,
      'average',
      '142',
      3,
    );
    let medianTrace = generateTrace(
      medianList,
      steps,
      medianData,
      '#525252',
      16,
      true,
      'median',
      '142',
      3,
    );
    let targetCycleTimeTrace = generateTrace(
      targetTime,
      steps,
      targetTime,
      '#9D91CD',
      16,
      true,
      'target time',
      '142',
      3,
    );
    dataPlots.push(averageTrace);
    dataPlots.push(medianTrace);
    dataPlots.push(targetCycleTimeTrace);
    return dataPlots;
  };

  let scatterPlotChartData: any = generateTraces(data, steps);
  let hoverColors: any = {
    [COLOR_SOP_WAITING_STEP_WAITING]: COLOR_SOP_WAITING_STEP_WAITING_HOVER,
    [COLOR_VA]: COLOR_SOP_WAITING_STEP_PROCESS_HOVER,
    [COLOR_RNVA]: COLOR_SOP_WAITING_STEP_PROCESS_HOVER,
    [COLOR_NVA]: COLOR_SOP_WAITING_STEP_PROCESS_HOVER,
    [COLOR_CYCLE_TIME]: COLOR_DISTRUBUTION_BAR_HOVER,
  };

  // const rootElem = createRef<HTMLDivElement>();
  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and the useEffect hook.
  useMemo(() => {
    // const root = rootElem.current as HTMLElement;
    // console.log('Plugin element', root);
    setScatterPlotData(scatterPlotChartData);
  }, [data]);

  let handleOnClick = (event: any): void => {
    console.log(
      '@281',
      event,
      scatterPlotChartData[event.points[0].curveNumber],
    );
    let record: any = scatterPlotChartData[event.points[0].curveNumber].record;
    let colors: any[] = [];
    for (const color of scatterPlotChartData[event.points[0].curveNumber].marker
      .color) {
      colors.push(
        color ? hoverColors[color] : COLOR_SOP_WAITING_STEP_PROCESS_HOVER,
      );
    }
    scatterPlotChartData.push({
      ...scatterPlotChartData[event.points[0].curveNumber],
      // showlegend: true,
      symbol: '142',
      marker: {
        color: colors,
        size: 16,
        opacity: 1,
        line: {
          width: 0.3,
        },
      },
    });
    setScatterPlotData(scatterPlotChartData);
    if (updatePlaybackDate) {
      updatePlaybackDate(
        typeof record.event_ts !== 'number'
          ? Date.parse(record.event_ts)
          : record.event_ts,
        record.device_id,
        record.pos,
        record.cycle_time,
      );
    }
    // if (CYCLE_TIME_COLUMN === event.points[0].y.toString()) {
    //   // setShowCurrentCycle(true);
    //   let data = event.points[0].data;
    //   if ('object' === typeof data.record[SOP_DATA_COLUMN]) {
    //     console.log("@180 it's already an Object., It's not a Cycle Data");
    //   } else {
    //     // setCurrentScatterData(data.record);
    //     let oneCycleData = generateOneCycleData(data.record);
    //     let sopTargetTrace = {
    //       y: oneCycleData.target.slice(0, -1),
    //       x: steps,
    //       name: 'target',
    //       type: 'bar',
    //       marker: {
    //         color: colors,
    //       },
    //       text: oneCycleData.target,
    //       // orientation: 'h',
    //     };
    //     let sopValueSubTarget: Array<any> = [];
    //     let sopValueSubColors: Array<string> = [];
    //     let fixedSopValues: Array<any> = [];
    //     for (let i = 0; i < oneCycleData.values.length - 1; i++) {
    //       let value = oneCycleData.values[i] - oneCycleData.target[i];
    //       sopValueSubTarget.push(value.toFixed(1));
    //       fixedSopValues.push(oneCycleData.values[i].toFixed(1));
    //       if (value > 0) {
    //         sopValueSubColors.push(COLOR_GT_TARGET);
    //       } else {
    //         sopValueSubColors.push(COLOR_LT_TARGET);
    //       }
    //     }
    //     let sopValueSubTargetDataTrace = {
    //       y: sopValueSubTarget,
    //       x: steps,
    //       name: 'target',
    //       type: 'bar',
    //       marker: {
    //         color: sopValueSubColors,
    //       },
    //       text: fixedSopValues,
    //       orientation: 'v',
    //       textposition: 'auto',
    //     };
    //     setSopWithTargetData([sopTargetTrace, sopValueSubTargetDataTrace]);
    // setOneCycleData(oneCycleData);
    // }
  };

  let scatterPlotStyle = {
    display: 'flex',
    width: width,
    height: height,
    flex: 2,
  };
  let plotStyle = {
    width: width,
    height: height,
  };

  return (
    <div style={scatterPlotStyle}>
      <Plot
        style={plotStyle}
        data={scatterPlotData}
        layout={{
          hovermode: 'closest',
          // legend: { orientation: 'h' },
          margin: {
            l: 50,
            r: 20,
            b: 40,
            t: 50,
            pad: 4,
          },
          xaxis: {
            title: STACK_BAR_TITLE,
            titlefont: {
              size: 16,
            },
          },
          yaxis: {
            automargin: true,
            title: { text: 'Activity', standoff: 10, font: { size: 16 } },
          },
          autosize: true,
          title: SCATTERPLOT_TITLE,
        }}
        onClick={(event: any) => handleOnClick(event)}
      />
      {/* <div style={{ justifyContent: 'center' }}>
        {showCurrentCycle && oneCycleData.values ? (
          <div
            className="current-cycle"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Plot
              style={{ width: 0 * width, height: 1 * height }}
              data={sopWithTargetData}
              layout={{
                barmode: 'stack',
                hovermode: 'closest',
                showlegend: false,
                title:
                  CYCLE_TIME_COLUMN +
                  ': ' +
                  oneCycleData.values[oneCycleData.values.length - 1],
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
            <button
              style={{
                alignSelf: 'flex-end',
                backgroundColor: 'white',
                border: '2px solid #4CAF50',
              }}
              onClick={() => {
                videoPlaybak(currentScatterData);
              }}
            >
              go to video
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h3> Click Cycle Time Plot To Show More Info. </h3>
          </div>
        )}
      </div> */}
    </div>
  );
}

// let videoPlaybak = (data: any) => {
//   console.log('@video playbak', data);
//   let url =
//     'https://manage-sales-demo.standalone.powerarena.com:10443/admin/mark-for-reason/?tab=single-view&entity_code=demo_demo_line_cam_007&pos=267&start_ts=1651623239000&end_ts=1651623389000&alert_type=1';
//   window.open(url, '_blank')?.focus();
// };
