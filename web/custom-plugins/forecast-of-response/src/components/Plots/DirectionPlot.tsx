import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  Label,
} from 'recharts'
import { plotColors } from '../Design/Colors'
import { PlotType, TGraphInfo } from '../Result'
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryPie,
  VictoryScatter,
} from 'victory'
import { Image } from 'antd'
import { Icon } from '@equinor/eds-core-react'
export type TLineChartDataPoint = {
  name: string
  [key: string]: number
}

export type DirectionPlotData = {
  timestamp: string
  [key: string]: number
}

class RotatedArrow extends React.Component {
  render() {
    const { datum, x, y } = this.props
    const iconWidth = 24
    const testDataAttribute = 'VariableRun1-Environment-Wave direction (mean)'
    return (
      <g
        transform={`translate(${x - iconWidth / 2}, ${
          y - iconWidth / 2
        }) rotate(${datum[testDataAttribute]})`}
      >
        <Icon name="arrow_up" size={24} />
      </g>
    )
  }
}

export default (props: {
  data: DirectionPlotData[]
  graphNames: TGraphInfo[]
  yAxisUnit: string
  timestamp?: string
}): JSX.Element => {
  const { data, graphNames, yAxisUnit } = props
  const d = [
    { quarter: 1, earnings: 13000 },
    { quarter: 2, earnings: 16500 },
    { quarter: 3, earnings: 14250 },
    { quarter: 4, earnings: 19000 },
  ]

  const getDataSetTwo = () => {
    return [
      { x: new Date(2000, 1, 1), y: 5 },
      { x: new Date(2003, 1, 1), y: 6 },
      { x: new Date(2004, 1, 1), y: 4 },
      { x: new Date(2005, 1, 1), y: 10 },
      { x: new Date(2006, 1, 1), y: 12 },
      { x: new Date(2007, 2, 1), y: 48 },
      { x: new Date(2008, 1, 1), y: 19 },
      { x: new Date(2009, 1, 1), y: 31 },
      { x: new Date(2011, 1, 1), y: 49 },
      { x: new Date(2014, 1, 1), y: 40 },
      { x: new Date(2015, 1, 1), y: 21 },
    ]
  }

  const getTickValues = () => {
    return [
      new Date(1999, 1, 1),
      new Date(2000, 1, 1),
      new Date(2001, 1, 1),
      new Date(2002, 1, 1),
      new Date(2003, 1, 1),
      new Date(2004, 1, 1),
      new Date(2005, 1, 1),
      new Date(2006, 1, 1),
      new Date(2007, 1, 1),
      new Date(2008, 1, 1),
      new Date(2009, 1, 1),
      new Date(2010, 1, 1),
      new Date(2011, 1, 1),
      new Date(2012, 1, 1),
      new Date(2013, 1, 1),
      new Date(2014, 1, 1),
      new Date(2015, 1, 1),
      new Date(2016, 1, 1),
    ]
  }

  const testDataAttribute = 'VariableRun1-Environment-Wave direction (mean)'

  let xTickValues = data.map((d) => {
    return new Date(d.timestamp)
  })
  // xTickValues = xTickValues.filter((d, i) => i % 2 === 0)
  const dataWithConstantY = data.map((d) => {
    const newObject = { ...d, y: 10 }
    return newObject
  })

  if (data.length === 0) return <div>no data selected</div>
  return (
    <VictoryChart scale={{ x: 'time' }}>
      <VictoryAxis
        style={{ tickLabels: { fontSize: 12 } }}
        tickValues={xTickValues}
        tickFormat={(x) =>
          new Date(x).getHours() + ':' + new Date(x).getMinutes()
        }
      />
      <VictoryAxis dependentAxis />
      <VictoryScatter
        data={dataWithConstantY}
        x="timestamp"
        y="y"
        dataComponent={<RotatedArrow />}
      />
    </VictoryChart>
  )
}
