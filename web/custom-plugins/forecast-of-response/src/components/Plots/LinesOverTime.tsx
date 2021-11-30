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

export type TLineChartDataPoint = {
  name: string
  [key: string]: number
}

export default (props: {
  data: TLineChartDataPoint[]
  graphNames: TGraphInfo[]
}): JSX.Element => {
  const { data, graphNames, warningLine, MaxLine, yAxisUnit } = props
  return (
    <div
      style={{ width: '100%', height: '300px', border: 'darkgrey 1px solid' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="2 2" />

          <XAxis dataKey="timestamp" />
          <YAxis unit={yAxisUnit} />
          <Tooltip />
          <Legend />
          {/*TODO: Read threshold values from result file*/}
          {graphNames &&
            graphNames.map((graphName: TGraphInfo, index) => {
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
