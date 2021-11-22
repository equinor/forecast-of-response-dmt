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
} from 'recharts'
import { plotColors } from '../Design/Colors'
import { PlotType, TGraphNames } from '../Result'

export type TLineChartDataPoint = {
  name: string
  [key: string]: number
}

export default (props: {
  data: TLineChartDataPoint[]
  graphNames: TGraphNames[]
  warningLine: number
  MaxLine: number
}): JSX.Element => {
  const { data, graphNames, warningLine, MaxLine } = props

  return (
    <div
      style={{ width: '100%', height: '300px', border: 'darkgrey 1px solid' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="2 2" />
          <XAxis dataKey="timestamp" />
          <YAxis unit="m" />
          <Tooltip />
          <Legend />
          {/*TODO: Read threshold values from result file*/}
          <ReferenceLine y={MaxLine} stroke="red" label="Max" />
          <ReferenceLine y={warningLine} stroke="orange" label="Warning" />
          {graphNames &&
            graphNames.map((graphName: TGraphNames, index) => {
              if (graphName.plotType === PlotType.LINE) {
                return (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={graphName.name}
                    stroke={plotColors[index]}
                  />
                )
              }
              if (graphName.plotType === PlotType.SHADED) {
                return (
                  <Area
                    key={index}
                    dataKey={graphName.name}
                    stroke={plotColors[index]}
                    fill={plotColors[index]}
                  />
                )
              }
            })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
