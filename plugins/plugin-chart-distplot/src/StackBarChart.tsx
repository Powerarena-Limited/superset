import React, { useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  COLOR_SOP_WAITING_STEP_PROCESS,
  COLOR_SOP_WAITING_STEP_WAITING,
  CYCLE_TIME_COLUMN,
  SOP_DATA_COLUMN,
  SOP_DATA_COLUMN_VALUE,
  SOP_WAITING_STEP,
  WAITING_TIME,
  WAITING_TIME_WORKING,
  WORKSTATION_COLUMN,
} from './constants';
import CountBar from './CountBar';
import { SopPie } from './SopPie';
import { StackBarProps } from './types';

export default function StackBarChart(props: StackBarProps) {
  const { data, width, height } = props;

  let getValueIndexFromArray = (array: Array<any>, value: any): number => {
    let index = -1;
    for (let i = 0; i < array.length; i++) {
      if (value == array[i]) {
        index = i;
      }
    }
    return index;
  };

  let listX = (data: any, column_name: string): Array<string> => {
    let x: Array<string> = [];
    for (let i = 0; i < data.length; i++) {
      if (getValueIndexFromArray(x, data[i][column_name]) === -1) {
        x.push(data[i][WORKSTATION_COLUMN]);
      }
    }
    return x;
  };

  let listWaiting = (data: any, column_name: string, x: Array<string>): any => {
    let waiting: Array<number> = [];
    let process: Array<number> = [];
    let xCount: Array<number> = [];
    let waitingAverage: Array<number> = [];
    let proccessAverage: Array<number> = [];
    let xDataSet: Array<any> = [];

    x.forEach(item => {
      waiting.push(0);
      process.push(0);
      xCount.push(0);
      waitingAverage.push(0);
      proccessAverage.push(0);
      xDataSet.push([]);
    });
    data.forEach((item: any, index: number) => {
      let i = getValueIndexFromArray(x, item[column_name]);
      let sopData = JSON.parse(item[SOP_DATA_COLUMN]);
      waiting[i] += sopData[SOP_WAITING_STEP][SOP_DATA_COLUMN_VALUE];
      process[i] +=
        item[CYCLE_TIME_COLUMN] -
        sopData[SOP_WAITING_STEP][SOP_DATA_COLUMN_VALUE];
      xCount[i] += 1;
      waitingAverage[i] = waiting[i] / xCount[i];
      proccessAverage[i] = process[i] / xCount[i];
      xDataSet[i].push(item);
    });
    return {
      waitingAverage: waitingAverage,
      processAverage: proccessAverage,
      dataFilteredByXAxis: xDataSet,
      xAxisCount: xCount,
      xLength: xCount.length,
    };
  };

  let x: Array<string> = listX(data, WORKSTATION_COLUMN);
  let stackBarChartData = listWaiting(data, WORKSTATION_COLUMN, x);
  console.log('@101', stackBarChartData);
  let dataFilteredByXAxis: Array<any> = stackBarChartData.dataFilteredByXAxis; // list data grouped by x axis
  let generateData = (): any => {
    let trace1 = {
      x: x,
      y: stackBarChartData.processAverage,
      marker: {
        color: COLOR_SOP_WAITING_STEP_PROCESS,
      },
      text: stackBarChartData.processAverage.map(String),
      textposition: 'auto',
      name: WAITING_TIME_WORKING,
      type: 'bar',
    };
    let trace2 = {
      x: x,
      y: stackBarChartData.waitingAverage,
      marker: {
        color: COLOR_SOP_WAITING_STEP_WAITING,
      },
      text: stackBarChartData.waitingAverage.map(String),
      textposition: 'auto',
      name: WAITING_TIME,
      type: 'bar',
    };
    return [trace1, trace2];
  };
  let stackBarData = generateData();

  let handleOnClickBar = (event: any): any => {
    console.log('@81', event);
    return event;
  };

  useEffect(() => {
    console.log('@108');
  }, [stackBarChartData.xLength]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 3,
        width: width,
        height: height,
      }}
    >
      <Plot
        style={{
          height: height / 3,
        }}
        onClick={event => handleOnClickBar(event)}
        data={stackBarData}
        layout={{
          barmode: 'stack',
          hovermode: 'closest',
          showlegend: false,
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
      <div style={{ display: 'flex', flexDirection: 'row', width: width }}>
        {dataFilteredByXAxis.map(item => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SopPie
              width={width / dataFilteredByXAxis.length}
              height={height / 3}
              data={item}
            />
            <CountBar
              width={width / dataFilteredByXAxis.length}
              height={height / 3}
              data={item}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
