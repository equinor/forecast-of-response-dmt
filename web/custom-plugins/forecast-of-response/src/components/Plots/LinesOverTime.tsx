import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { plotColors } from '../Design/Colors'

export type TLineChartDataPoint = {
  name: string
  [key: string]: number
}

export type TLineChartData = {
  data: TLineChartDataPoint[]
}

export default (props: {
  data: TLineChartData
  graphNames: string[]
  warningLine: number
  MaxLine: number
}): JSX.Element => {
  const { data, graphNames, warningLine, MaxLine } = props

  return (
    <div
      style={{ width: '100%', height: '300px', border: 'darkgrey 1px solid' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 2" />
          <XAxis dataKey="timestamp" />
          <YAxis unit="m" />
          <Tooltip />
          <Legend />
          {/*TODO: Read threshold values from result file*/}
          <ReferenceLine y={MaxLine} stroke="red" label="Max" />
          <ReferenceLine y={warningLine} stroke="orange" label="Warning" />
          {graphNames &&
            graphNames.map((dataKey: string, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={dataKey}
                stroke={plotColors[index]}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
