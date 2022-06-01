import React, { useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  COLOR_SOP_WAITING_STEP_PROCESS,
  COLOR_SOP_WAITING_STEP_WAITING,
  CYCLE_TIME_COLUMN,
  SOP_DATA_COLUMN,
  SOP_DATA_COLUMN_VALUE,
  SOP_WAITING_STEP,
  TARGET_CYCLE_TIME_COLUMN,
  WAITING_TIME,
  WAITING_TIME_WORKING,
} from './constants';
import CountBar from './CountBar';
import { SopPie } from './SopPie';
import { StackBarProps } from './types';

export default function StackBarChart(props: StackBarProps) {
  const { data, width, height, barColumn } = props;

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
        x.push(data[i][barColumn]);
      }
    }
    return x.sort();
  };

  function getMinMaxParamFromListOfObject(
    data: any,
    param: string,
  ): Array<number> {
    let min: number = 9999999999;
    let max: number = -9999999999;

    data.forEach((o: any) => {
      Object.keys(o).forEach(k => {
        if (k === param && o[k] !== null) {
          min = Math.min(min, o[k]);
          max = Math.max(max, o[k]);
        }
      });
    });
    return [min, max];
  }

  let generateStackBarChartRawData = (
    data: any,
    column_name: string,
    x: Array<string>,
  ): any => {
    // list values of x axis
    let waiting: Array<number> = [];
    let process: Array<number> = [];
    let target: Array<any> = [];
    let min: Array<any> = [];
    let max: Array<any> = [];
    let xCount: Array<number> = [];
    let waitingAverage: Array<any> = [];
    let proccessAverage: Array<any> = [];
    let cycleTimeAverage: Array<any> = [];
    let xDataSet: Array<any> = [];

    x.forEach(item => {
      waiting.push(0);
      process.push(0);
      target.push(-1);
      min.push(0);
      max.push(0);
      xCount.push(0);
      waitingAverage.push(0);
      proccessAverage.push(0);
      cycleTimeAverage.push(0);
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
      waitingAverage[i] = (waiting[i] / xCount[i]).toFixed(2);
      proccessAverage[i] = (process[i] / xCount[i]).toFixed(2);
      xDataSet[i].push(item);
      if (target[i] === -1) {
        target[i] = xDataSet[i][0][TARGET_CYCLE_TIME_COLUMN];
      }
    });
    xDataSet.forEach((item: any, index: number) => {
      let minMax = getMinMaxParamFromListOfObject(item, CYCLE_TIME_COLUMN);
      cycleTimeAverage[index] = (
        parseFloat(waitingAverage[index]) + parseFloat(proccessAverage[index])
      ).toFixed(2);
      min[index] = (-(minMax[0] - parseFloat(cycleTimeAverage[index]))).toFixed(
        2,
      );
      max[index] = (minMax[1] - parseFloat(cycleTimeAverage[index])).toFixed(2);
    });

    return {
      waitingAverage: waitingAverage, // list waiting average by x(barColumn) axis[5, 1, 6]
      processAverage: proccessAverage, // list process average by x axis[50, 51, 46]
      target: target,
      min: min, // list min cycle time by x axis
      max: max, // list max cycle time by x axis
      cycleTimeAverage: cycleTimeAverage,
      dataFilteredByXAxis: xDataSet, // list data grouped by x axis [[], [], []]
      xAxisCount: xCount, // list number of data by x axis [100, 200, 300]
      xLength: xCount.length,
    };
  };

  let generateTableRawData = (x: Array<string>, data: any) => {
    let totalTime: any = 0;
    let uph: number = 0;
    let bottleneck: any = '';
    let best: any = '';
    let worst: any = '';
    let rate: any = '80%';

    x.forEach((name: string, index: number) => {
      totalTime += data.cycleTimeAverage[index] * data.xAxisCount[index];
      uph += data.xAxisCount[index];
    });
    best = Math.min(...data.cycleTimeAverage);
    worst = Math.max(...data.cycleTimeAverage);
    let bottleneckIndex = data.cycleTimeAverage.indexOf(worst.toFixed(2));
    console.log(data.cycleTimeAverage, bottleneckIndex);
    bottleneck = x[bottleneckIndex];

    rate =
      data.cycleTimeAverage.reduce(
        (a: any, b: any) => parseFloat(a) + parseFloat(b),
        0,
      ) /
      (worst * x.length);

    return {
      totalTime: (totalTime / 3600).toFixed(2), // hour
      uph: uph,
      bottleneck: bottleneck,
      best: best,
      worst: worst,
      rate: (rate * 100).toFixed(2) + '%',
    };
  };

  let x: Array<string> = listX(data, barColumn);
  let stackBarChartData = generateStackBarChartRawData(data, barColumn, x);
  let dataFilteredByXAxis: Array<any> = stackBarChartData.dataFilteredByXAxis; // list data grouped by x axis
  let tableRawData = generateTableRawData(x, stackBarChartData);

  let generateStackBarChartData = (): any => {
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
    let trace3 = {
      x: x,
      y: stackBarChartData.cycleTimeAverage,
      error_y: {
        type: 'data',
        symmetric: false,
        array: stackBarChartData.max,
        arrayminus: stackBarChartData.min,
        visible: true,
      },
      text: stackBarChartData.cycleTimeAverage.map(String),
      textposition: 'auto',
      name: CYCLE_TIME_COLUMN,
      mode: 'markers',
      type: 'scatter',
    };
    let trace4 = {
      x: x,
      y: stackBarChartData.target,
      text: stackBarChartData.target.map(String),
      textposition: 'auto',
      name: 'target',
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: 'yellow',
        symbol: '142',
        size: 2,
        line: {
          width: width / x.length / 2 * 1.5,
        }
      }
    }
    return [trace1, trace2, trace3, trace4];
  };

  let countY: any = [];
  x.forEach(_ => countY.push(1000));
  console.log("countY", countY);
  let countBarData: any = [
    {
      name: 'count',
      x: x,
      y: countY,
      textposition: 'auto',
      text: stackBarChartData.xAxisCount.map((item: any, index: number) => {
        item = parseInt(item);
        return (
          'COUNT: ' +
          item.toString() +
          ' CT: ' +
          stackBarChartData.cycleTimeAverage[index].toString()
        );
      }),
      type: 'bar',
      mode: 'markers+text',
      marker: {
        color: '147DD6',
      },
    },
  ];
  let stackBarData = generateStackBarChartData();

  let handleOnClickBar = (event: any): any => {
    return event;
  };

  useEffect(() => {
    console.log('@108');
  }, [stackBarChartData.xLength]);

  let tableData: any = [
    {
      type: 'table',
      header: {
        values: [
          ['<b>Total Hour</b>'],
          ['<b>UPH</b>'],
          ['<b>Bottleneck</b>'],
          ['<b>Best</b>'],
          ['<b>Worst</b>'],
          ['<b>Balance Rate</b>'],
        ],
        align: 'center',
        line: { width: 1, color: 'black' },
        fill: { color: 'white' },
        font: { family: 'Arial', size: 15, color: 'Black' },
      },
      cells: {
        values: [
          [tableRawData.totalTime],
          [tableRawData.uph],
          [tableRawData.bottleneck],
          [tableRawData.best],
          [tableRawData.worst],
          [tableRawData.rate],
        ],
        height: 35,
        align: 'center',
        line: { color: 'black', width: 1 },
        font: { family: 'Arial', size: 30, color: ['black'] },
      },
    },
  ];

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
      <div
        style={{
          width: width,
        }}
      >
        <Plot
          style={{ width: width, height: 0.12 * height }}
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
        />
      </div>

      <Plot
        style={{ width: width, height: 0.05 * height }}
        data={countBarData}
        layout={{
          hovermode: 'closest',
          font: {
            size: 16
          },
          margin: {
            l: 50,
            r: 50,
            b: 0,
            t: 0,
            pad: 4,
          },
          autosize: true,
          yaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            showticklabels: false,
          },
        }}
      />

      <Plot
        style={{
          height: height * 0.35,
        }}
        onClick={event => handleOnClickBar(event)}
        data={stackBarData}
        layout={{
          barmode: 'stack',
          hovermode: 'closest',
          showlegend: false,
          autosize: true,
          margin: {
            l: 50,
            r: 50,
            b: 20,
            t: 20,
            pad: 4,
          },
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'row', width: width }}>
        {dataFilteredByXAxis.map((item, index) => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SopPie
              width={width / dataFilteredByXAxis.length}
              height={height * 0.2}
              data={item}
              showlegend={index === 0 ? true : false}
            />
            <CountBar
              width={width / dataFilteredByXAxis.length}
              height={height * 0.28}
              data={item}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
