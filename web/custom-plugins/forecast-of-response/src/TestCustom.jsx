import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory'
import React from 'react'
import { Icon } from '@equinor/eds-core-react'

export class RotatedArrow extends React.Component {
  render() {
    const { datum, x, y, attributeName, numArrowPlots } = this.props
    const iconWidth = 24

    const yAxisOffset = numArrowPlots * iconWidth //* iconWidth //165 //distance down to x axis

    return (
      <g
        transform={`translate(${x - iconWidth / 2}, ${y +
          yAxisOffset -
          iconWidth / 2}) rotate(${datum[attributeName]}, ${iconWidth /
          2}, ${iconWidth / 2})`}
      >
        <Icon name="arrow_up" size={iconWidth} />
      </g>
    )
  }
}

const getStyles = () => {
  const BLUE_COLOR = '#00a3de'
  const RED_COLOR = '#7c270b'

  return {
    parent: {
      background: 'white',
      boxSizing: 'border-box',
      display: 'inline',
      padding: 0,
      fontFamily: "'Fira Sans', sans-serif",
    },
    title: {
      textAnchor: 'start',
      verticalAnchor: 'end',
      fill: '#000000',
      fontFamily: 'inherit',
      fontSize: '18px',
      fontWeight: 'bold',
    },
    labelNumber: {
      textAnchor: 'middle',
      fill: '#ffffff',
      fontFamily: 'inherit',
      fontSize: '14px',
    },

    // INDEPENDENT AXIS
    axisYears: {
      axis: { stroke: 'black', strokeWidth: 1 },
      ticks: {
        size: ({ tick }) => {
          const tickSize = tick.getFullYear() % 5 === 0 ? 10 : 5
          return tickSize
        },
        stroke: 'black',
        strokeWidth: 1,
      },
      tickLabels: {
        fill: 'black',
        fontFamily: 'inherit',
        fontSize: 16,
      },
    },

    // DATA SET ONE
    axisOne: {
      grid: {
        stroke: ({ tick }) => (tick === -10 ? 'transparent' : '#ffffff'),
        strokeWidth: 2,
      },
      axis: { stroke: BLUE_COLOR, strokeWidth: 0 },
      ticks: { strokeWidth: 0 },
      tickLabels: {
        fill: BLUE_COLOR,
        fontFamily: 'inherit',
        fontSize: 16,
      },
    },
    labelOne: {
      fill: BLUE_COLOR,
      fontFamily: 'inherit',
      fontSize: 12,
      fontStyle: 'italic',
    },
    lineOne: {
      data: { stroke: BLUE_COLOR, strokeWidth: 4.5 },
    },
    axisOneCustomLabel: {
      fill: BLUE_COLOR,
      fontFamily: 'inherit',
      fontWeight: 300,
      fontSize: 21,
    },

    // DATA SET TWO
    axisTwo: {
      axis: { stroke: RED_COLOR, strokeWidth: 0 },
      tickLabels: {
        fill: RED_COLOR,
        fontFamily: 'inherit',
        fontSize: 16,
      },
    },
    labelTwo: {
      textAnchor: 'end',
      fill: RED_COLOR,
      fontFamily: 'inherit',
      fontSize: 12,
      fontStyle: 'italic',
    },
    lineTwo: {
      data: { stroke: RED_COLOR, strokeWidth: 4.5 },
    },

    // HORIZONTAL LINE
    lineThree: {
      data: { stroke: '#e95f46', strokeWidth: 2 },
    },
  }
}

const plotData = [
  {
    timestamp: '01/Sep/2019, 00:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 32.67283166340876,
    y: 0,
  },
  {
    timestamp: '01/Sep/2019, 03:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 41.78981884472788,
    y: 0,
  },
  {
    timestamp: '01/Sep/2019, 06:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 48.2552651815123,
    y: 0,
  },
  {
    timestamp: '01/Sep/2019, 09:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 64.83836890883627,
    y: 0,
  },
  {
    timestamp: '01/Sep/2019, 12:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 90.25905866241362,
    y: 0,
  },
  {
    timestamp: '01/Sep/2019, 15:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 106.89920178505857,
    y: 0,
  },
  {
    timestamp: '01/Sep/2019, 18:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 116.80551262673957,
    y: 0,
  },
  {
    timestamp: '01/Sep/2019, 21:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 123.04331860391716,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 00:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 126.89291075374095,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 03:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 128.55046727988355,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 06:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 127.25755749954958,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 09:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 122.30252628077382,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 12:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 112.64323791932773,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 15:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 98.80647659801748,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 18:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 88.29523974182563,
    y: 0,
  },
  {
    timestamp: '02/Sep/2019, 21:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 84.13478475361394,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 00:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 85.88155813855478,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 03:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 100.31616218691656,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 06:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 112.69807066053869,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 09:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 116.88512304103828,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 12:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 119.19575813875768,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 15:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 121.73081898049124,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 18:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 124.03150595837002,
    y: 0,
  },
  {
    timestamp: '03/Sep/2019, 21:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 125.88105735341085,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 00:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 127.11866145766626,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 03:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 128.15688124765953,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 06:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 131.20354773668905,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 09:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 134.34430778865737,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 12:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 138.96539598123923,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 15:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 142.34554462254937,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 18:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 145.0438289117775,
    y: 0,
  },
  {
    timestamp: '04/Sep/2019, 21:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 144.91093396639258,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 00:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 143.8172746933135,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 03:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 143.0439504788705,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 06:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 142.85850661309897,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 09:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 142.3494072678943,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 12:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 141.75791858061982,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 15:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 140.6117089214352,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 18:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 138.60962446232597,
    y: 0,
  },
  {
    timestamp: '05/Sep/2019, 21:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 136.15911044937016,
    y: 0,
  },
  {
    timestamp: '06/Sep/2019, 00:00:00',
    'VariableRun1-Environment-Wave direction (mean)': 132.21185350025814,
    y: 0,
  },
]
const graphInfo = {
  name: 'VariableRun1-Environment-Wave direction (mean)',
  plotType: 'arrow',
  unit: 'deg',
  arrowPlotIndex: 1,
}

export default () => {
  const styles = getStyles()
  return (
    <svg style={styles.parent} viewBox="0 0 450 350">
      {/* Create stylistic elements */}

      {/* Define labels */}
      <VictoryLabel x={430} y={20} style={styles.labelNumber} text="1" />
      <VictoryLabel
        x={25}
        y={55}
        style={styles.labelOne}
        text={'Economy \n % change on a year earlier'}
      />

      <g transform={'translate(0, 10)'}>
        {/*<VictoryAxis standalone={false} domain={{ x: [0, 5], y: [0, 7] }} />*/}

        {/* dataset two */}
        {/*<VictoryLine*/}
        {/*  data={dataSetTwo}*/}
        {/*  domain={{*/}
        {/*    x: [new Date(1999, 1, 1), new Date(2016, 1, 1)],*/}
        {/*    y: [0, 50],*/}
        {/*  }}*/}
        {/*  interpolation="monotoneX"*/}
        {/*  scale={{ x: 'time', y: 'linear' }}*/}
        {/*  standalone={false}*/}
        {/*  style={styles.lineTwo}*/}
        {/*/>*/}

        {/*<VictoryLine*/}
        {/*  data={[*/}
        {/*    { x: 1, y: 1 },*/}
        {/*    { x: 2, y: 4 },*/}
        {/*  ]}*/}
        {/*  domain={{ x: [0, 5], y: [0, 7] }}*/}
        {/*  standalone={false}*/}
        {/*  style={styles.lineThree}*/}
        {/*/>*/}
        {/*<VictoryChart containerComponent={<VictoryVoronoiContainer />}>*/}
        <VictoryScatter
          standalone={false}
          data={plotData}
          x="timestamp"
          y="y"
          dataComponent={
            //@ts-ignore
            <RotatedArrow
              attributeName={graphInfo.name}
              numArrowPlots={graphInfo.arrowPlotIndex}
            />
          }
          labels={({ datum }) => {
            return `${datum.timestamp} \n direction: ${datum[
              graphInfo.name
            ].toFixed(2)} ${graphInfo.unit}`
          }}
          labelComponent={
            <VictoryTooltip
              flyoutPadding={({ text }) =>
                text.length > 1
                  ? { top: 10, bottom: 10, left: 15, right: 15 }
                  : 7
              }
            />
          }
        />
        {/*</VictoryChart>*/}
      </g>
    </svg>
  )
}
