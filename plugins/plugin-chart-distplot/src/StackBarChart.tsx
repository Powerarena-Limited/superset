import React, { useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  COLOR_MEDIAN,
  COLOR_SOP_WAITING_STEP_PROCESS,
  COLOR_SOP_WAITING_STEP_WAITING,
  CYCLE_TIME_COLUMN,
  SOP_DATA_COLUMN,
  SOP_DATA_COLUMN_VALUE,
  SOP_WAITING_STEP,
  TARGET_CYCLE_TIME_COLUMN,
  WAITING_TIME,
  WAITING_TIME_WORKING,
  COLOR_COUNT_BAR_CYCLE,
  COLOR_COUNT_BAR_CT,
  COUNT_BAR_CYCLE,
  TARGET_CYCLE_TIME_COLUMN_VALUE,
  MISSING_ACTIVITY_COLUMN_M_W,
  MISSING_ACTIVITY_COLUMN_M_C,
  MISSING_ACTIVITY_COLUMN_C_W,
  MISSING_ACTIVITY_COLUMN_C_C,
  COLOR_MISSING_ACTIVITY_COLUMN_M_W,
  COLOR_MISSING_ACTIVITY_COLUMN_C_C,
  COUNT_BAR_CT,
  COLOR_MISSING_ACTIVITY_COLUMN_M_C,
  COLOR_MISSING_ACTIVITY_COLUMN_C_W,
  SOP_DATA_COLUMN_NAME,
  QPL,
  STACK_BAR_TITLE,
  COLOR_TABLE_FILL,
} from './constants';
import CountBar from './CountBar';
import { SopPie } from './SopPie';
import { StackBarProps } from './types';
import Popover from 'src/components/Popover';

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
    let bestPerformance: any = '';
    let best: any = '';
    let worst: any = '';
    let average: any = 0;
    let rate: any = '80%';

    x.forEach((name: string, index: number) => {
      totalTime += data.cycleTimeAverage[index] * data.xAxisCount[index];
      uph += data.xAxisCount[index];
      average += parseInt(data.cycleTimeAverage[index]);
    });
    best = Math.min(...data.processAverage);
    worst = Math.max(...data.processAverage);
    let bottleneckIndex = data.processAverage.indexOf(worst.toFixed(2));
    let bestPerformanceIndex = data.processAverage.indexOf(best.toFixed(2));
    // console.log(data, bottleneckIndex, x);
    bottleneck = x[bottleneckIndex];
    bestPerformance = x[bestPerformanceIndex];

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
      bestPerformance: bestPerformance,
      best: best,
      average: average / data.xLength,
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
      name: WAITING_TIME_WORKING + ' time',
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
      name: WAITING_TIME + ' time',
      type: 'bar',
    };
    // let trace3 = {
    //   x: x,
    //   y: stackBarChartData.cycleTimeAverage,
    //   error_y: {
    //     type: 'data',
    //     symmetric: false,
    //     array: stackBarChartData.max,
    //     arrayminus: stackBarChartData.min,
    //     visible: true,
    //   },
    //   text: stackBarChartData.cycleTimeAverage.map(String),
    //   textposition: 'auto',
    //   name: CYCLE_TIME_COLUMN,
    //   mode: 'markers',
    //   type: 'scatter',
    // };
    let trace4 = {
      x: x,
      y: stackBarChartData.target,
      text: stackBarChartData.target.map(
        (item: any) => TARGET_CYCLE_TIME_COLUMN_VALUE + ': ' + item + 'sec',
      ),
      hoverinfo: 'text',
      textposition: 'auto',
      name: TARGET_CYCLE_TIME_COLUMN_VALUE,
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: COLOR_MEDIAN,
        symbol: '142',
        size: 2,
        line: {
          width: (width / x.length / 2) * 1.5,
        },
      },
    };
    return [trace1, trace2, trace4];
  };

  let countY: any = [];
  x.forEach(_ => countY.push(500));
  console.log('countY', countY, x);
  let countBarData: any = [
    {
      name: 'count',
      x: x,
      y: countY,
      hoverinfo: 'none',
      textposition: 'inside',
      insidetextanchor: 'middle',
      text: stackBarChartData.xAxisCount.map((item: any, index: number) => {
        item = parseInt(item);
        return (
          `${COUNT_BAR_CT}: ` +
          stackBarChartData.cycleTimeAverage[index].toString()
        );
      }),
      textfont: {
        color: COLOR_TABLE_FILL,
      },
      type: 'bar',
      mode: 'markers+text',
      marker: {
        color: COLOR_COUNT_BAR_CT,
      },
    },
    {
      name: 'count',
      x: x,
      y: countY,
      hoverinfo: 'none',
      textposition: 'inside',
      insidetextanchor: 'middle',
      text: stackBarChartData.xAxisCount.map((item: any, index: number) => {
        item = parseInt(item);
        return `${COUNT_BAR_CYCLE}: ` + item.toString();
      }),
      textfont: {
        color: COLOR_TABLE_FILL,
      },
      type: 'bar',
      mode: 'markers+text',
      marker: {
        color: COLOR_COUNT_BAR_CYCLE,
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

  // let tableData: any = [
  //   {
  //     type: 'table',
  //     header: {
  //       values: [
  //         [`<b>${TOTAL_HOUR}</b>`],
  //         [`<b>${UPH}</b>`],
  //         [`<b>${BOTTLENECK}</b>`],
  //         [`<b>${BEST}</b>`],
  //         [`<b>${WORST}</b>`],
  //         [`<b>${BALANCE_RATE}</b>`],
  //       ],
  //       align: 'center',
  //       line: { width: 0, color: COLOR_TABLE_LINE },
  //       fill: { color: COLOR_TABLE_FILL },
  //       font: { family: 'Arial', size: 15, color: COLOR_TABLE_LINE },
  //     },
  //     cells: {
  //       values: [
  //         [tableRawData.totalTime],
  //         [tableRawData.uph],
  //         [tableRawData.bottleneck],
  //         [tableRawData.best],
  //         [tableRawData.worst],
  //         [tableRawData.rate],
  //       ],
  //       height: 35,
  //       align: 'center',
  //       line: { color: COLOR_TABLE_LINE, width: 0 },
  //       font: { family: 'Arial', size: 30, color: [COLOR_TABLE_LINE] },
  //     },
  //   },
  // ];
  const currentMinWidth =
    (width - 300) / dataFilteredByXAxis.length < 200
      ? dataFilteredByXAxis.length * 200 + 300
      : width;

  let legendContainerStyle: any = {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    alignItems: 'center',
    justifyContent: 'center',
  };
  let legendStyle: any = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 280,
    fontSize: 12,
  };
  let legendLineStyle: any = {
    width: '12px',
    height: '2px',
    marginRight: '8px',
  };
  let legendSquareStyle: any = {
    width: '12px',
    height: '12px',
    marginRight: '8px',
  };
  let missingActivityLabels: any[] = [
    MISSING_ACTIVITY_COLUMN_M_W,
    MISSING_ACTIVITY_COLUMN_M_C,
    MISSING_ACTIVITY_COLUMN_C_W,
    MISSING_ACTIVITY_COLUMN_C_C,
  ];
  let missingActivityColors: any[] = [
    COLOR_MISSING_ACTIVITY_COLUMN_M_W,
    COLOR_MISSING_ACTIVITY_COLUMN_M_C,
    COLOR_MISSING_ACTIVITY_COLUMN_C_W,
    COLOR_MISSING_ACTIVITY_COLUMN_C_C,
  ];
  let barColumns: any = { qpl: QPL, workstation_name: 'Workstation' };
  let steps: Array<any> = [];
  if (dataFilteredByXAxis.length > 0) {
    let sopData = JSON.parse(dataFilteredByXAxis[0][0][SOP_DATA_COLUMN]);
    Object.keys(sopData).map((key: any) => {
      steps.push(sopData[key][SOP_DATA_COLUMN_NAME]);
    });
  }
  let tableListStyle: any = {
    width: 0,
    flexGrow: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };
  let tableLineStyle: any = {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  };
  let tableTextStyle: any = {
    width: 0,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  };
  let tableData: any = {
    qpl: [
      [
        'Output',
        ['Target UPH', 'Current UPH'],
        [
          { text: tableRawData.uph, popup: 'UPH' },
          {
            text: (3600 / tableRawData.average).toFixed(2),
            popup: '3600 / AVG CT',
          },
        ],
      ],
      [
        'Fastest QPL',
        ['QPL', 'Avg. CT'],
        [
          { text: tableRawData.bestPerformance, popup: 'QPL name' },
          {
            text: tableRawData.best + ' | ↓ x%',
            popup: '(CT1+CT2+...CTn)/n | CT/ST %',
          },
        ],
      ],
      [
        'Slowest QPL',
        ['QPL', 'Avg. CT'],
        [
          { text: tableRawData.bottleneck, popup: 'QPL name' },
          {
            text: tableRawData.worst + ' | ↑ x%',
            popup: '(CT1+CT2+...CTn)/n | CT/ST %',
          },
        ],
      ],
      ['QPL-1 cycle time', [], [{ text: '', popup: '' }]],
    ],
    workstation_name: [
      [
        'Output',
        ['Target UPH', 'Current bottleneck UPH'],
        [
          { text: tableRawData.uph, popup: 'UPH' },
          {
            text: (3600 / tableRawData.worst).toFixed(2),
            popup: '3600 / AVG CT',
          },
        ],
      ],
      [
        'Current bottleneck UPH',
        ['Workstation', 'Avg. CT'],
        [
          { text: tableRawData.bestPerformance, popup: 'Workstation name' },
          {
            text: tableRawData.best + ' | ↓ x%',
            popup: '(CT1+CT2+...CTn)/n',
          },
        ],
      ],
      [
        'Slowest QPL',
        ['QPL', 'Avg. CT'],
        [
          { text: tableRawData.bottleneck, popup: 'Workstation name' },
          {
            text: tableRawData.worst + ' | ↑ x%',
            popup: '(CT1+CT2+...CTn)/n',
          },
        ],
      ],
      [
        'Balance Rate',
        [],
        [
          {
            text: tableRawData.rate,
            popup: '(CT1+CT2+...CTn) / (n*CThighest)',
          },
        ],
      ],
    ],
  };

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
      {/* <Popover content={<div>11111</div>} trigger="hover">
        <div>Hover me</div>
      </Popover> */}
      <div
        style={{
          width: width,
        }}
      >
        <div
          style={{
            width: width,
            height: 0.12 * height,
            display: 'flex',
            flexDirection: 'row',
            padding: '0 0 10px 0',
          }}
        >
          {tableData[barColumn].map((item: any, index: number) => (
            <div
              style={{
                ...tableListStyle,
                flexGrow: index !== 3 ? 3 : 1,
              }}
            >
              <div style={{ ...tableLineStyle, height: '25%' }}>{item[0]}</div>
              <div style={{ ...tableLineStyle, height: '25%' }}>
                {item[1].map((text: any) => (
                  <div style={tableTextStyle}>{text}</div>
                ))}
              </div>
              <div
                style={{
                  ...tableLineStyle,
                  height: '50%',
                  fontSize: '28px',
                  paddingTop: 10,
                }}
              >
                {item[2].map((text: any) => (
                  <Popover content={<div>{text.popup}</div>} trigger="hover">
                    <div style={tableTextStyle}>{text.text}</div>
                  </Popover>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* <Plot
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
        /> */}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: width,
          overflowX: 'auto',
          width: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: currentMinWidth,
          }}
        >
          <div style={legendContainerStyle}></div>
          <Plot
            style={{ height: 0.05 * height, width: 'calc(100% - 300px)' }}
            data={countBarData}
            layout={{
              hovermode: 'closest',
              font: {
                size: 16,
              },
              margin: {
                l: 50,
                r: 50,
                b: 0,
                t: 10,
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
              showlegend: false,
              bargroupgap: 0.1,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: currentMinWidth,
          }}
        >
          <div style={legendContainerStyle}>
            {stackBarData.map((data: any, index: number) => (
              <div style={legendStyle}>
                <div
                  style={{
                    ...(data.type === 'scatter'
                      ? legendLineStyle
                      : legendSquareStyle),
                    backgroundColor: data.marker.color,
                  }}
                ></div>
                <div>{data.name}</div>
              </div>
            ))}
          </div>
          <Plot
            style={{
              height: height * 0.35,
              width: 'calc(100% - 300px)',
            }}
            onClick={(event: any) => handleOnClickBar(event)}
            data={stackBarData}
            layout={{
              barmode: 'stack',
              hovermode: 'closest',
              showlegend: false,
              autosize: true,
              yaxis: {
                title: STACK_BAR_TITLE,
                titlefont: {
                  size: 16,
                },
              },
              xaxis: {
                title: barColumns[barColumn],
                titlefont: {
                  size: 16,
                },
              },
              margin: {
                l: 50,
                r: 50,
                b: 40,
                t: 20,
                pad: 4,
              },
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: currentMinWidth,
          }}
        >
          <div style={legendContainerStyle}>
            <div style={{ ...legendContainerStyle, height: height * 0.2 }}>
              {missingActivityLabels.map((label: string, index: number) => (
                <div style={legendStyle}>
                  <div
                    style={{
                      ...legendSquareStyle,
                      backgroundColor: missingActivityColors[index],
                    }}
                  ></div>
                  <div>{label}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                ...legendContainerStyle,
                height: height * 0.28 - 20,
                justifyContent: 'flex-end',
                flexDirection: 'row',
                padding: '20px 0 20px 0',
              }}
            >
              <div
                style={{
                  width: 20,
                  fontSize: 16,
                  transform: 'rotate(-90deg)',
                }}
              >
                Activity
              </div>
              <div
                style={{
                  ...legendContainerStyle,
                  width: 'auto',
                  height: '100%',
                  marginLeft: 10,
                  alignItems: 'flex-end',
                }}
              >
                {steps.map((step: number, index: number) => (
                  <div
                    style={{
                      ...legendStyle,
                      width: 'auto',
                      flexGrow: 1,
                      height: 0,
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              width: 'calc(100% - 300px)',
              display: 'flex',
              flexDirection: 'row',
              marginLeft: 50,
              marginRight: 50,
            }}
          >
            {dataFilteredByXAxis.map((item, index) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: 0,
                  flexGrow: 1,
                }}
              >
                <SopPie
                  width={'100%'}
                  height={height * 0.2}
                  data={item}
                  showlegend={false}
                  margin={{
                    l: 20,
                    r: 20,
                    b: 20,
                    t: 20,
                    pad: 4,
                  }}
                />
                <CountBar
                  width={'100%'}
                  height={height * 0.28 - 20}
                  data={item}
                  isShowticklabels={true}
                  margin={{
                    l: 40,
                    r: 20,
                    b: 40,
                    t: 20,
                    pad: 4,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            width: currentMinWidth,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 20,
            paddingLeft: 300,
          }}
        >
          Count
        </div>
      </div>
    </div>
  );
}
