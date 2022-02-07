import React, { useState } from 'react'

import { getPlotColor } from '../Design/Colors'
import { PlotType, TGraphInfo } from '../Result'
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory'

import { getDayFromDateString, getTime } from './plotUtils'
export type TLineChartDataPoint = {
  // @ts-ignore
  timestamp: string
  [key: string]: number | number[]
}

export default (props: {
  data: TLineChartDataPoint[]
  useLocalTimezone: boolean
  issueWithTimeFormat: boolean
  graphInfo: TGraphInfo[]
}): JSX.Element => {
  const { data, graphInfo, useLocalTimezone, issueWithTimeFormat } = props
  const fontSize: number = 8
  const victoryTooltip = (
    <VictoryTooltip
      style={{ fontSize: fontSize }}
      pointerLength={5}
      centerOffset={{ y: -10 }}
      constrainToVisibleArea
      flyoutPadding={({ text }) =>
        text.length > 1 ? { top: 10, bottom: 10, left: 15, right: 15 } : 7
      }
    />
  )
  const chartWidth: number = 800
  const plotHeight: number = 200

  const getAreaPlotData = (
    data: TLineChartDataPoint[],
    graphInfo: TGraphInfo
  ) => {
    const plotData = data.map((dataPoint: TLineChartDataPoint) => {
      let timeString: string = getTime(
        dataPoint.timestamp,
        issueWithTimeFormat,
        useLocalTimezone
      )
      const day: string = getDayFromDateString(dataPoint.timestamp)
      if (Array.isArray(dataPoint[graphInfo.name])) {
        const x = `${timeString} ㅤ\n ${day}`
        // const x = `${timeString}` //+ 'a\n' + day
        //@ts-ignore - ok since the if check makes sure dataPoint[graphInfo.name] is an array
        const y = dataPoint[graphInfo.name][1]
        //@ts-ignore - ok since the if check makes sure dataPoint[graphInfo.name] is an array
        const y0 = dataPoint[graphInfo.name][0]
        return {
          x: x,
          y0: y0,
          y: y,
          customLabel: `${timeString} \n ${graphInfo.name}: ${y0.toFixed(
            2
          )} - ${y.toFixed(2)}  ${graphInfo.unit}`,
        }
      } else {
        throw new Error(
          `Data for plot not in correct format! (Expected ${
            dataPoint[graphInfo.name]
          } to be an array)`
        )
      }
    })
    return plotData
  }
  const getLinePlotData = (
    data: TLineChartDataPoint[],
    graphInfo: TGraphInfo
  ) => {
    const plotData = data.map((dataPoint: TLineChartDataPoint) => {
      let timeString: string = getTime(
        dataPoint.timestamp,
        issueWithTimeFormat,
        useLocalTimezone
      )
      const day: string = getDayFromDateString(dataPoint.timestamp)
      return {
        ...dataPoint,
        timestamp: `${timeString} ㅤ\n ${day}`,
        customLabel: `${timeString} \n ${graphInfo.name}: ${dataPoint[
          graphInfo.name
        ].toFixed(2)} ${graphInfo.unit}`,
      }
    })
    return plotData
  }

  const getScatterStyle = (color: string, strokeWidth: number) => {
    return {
      data: {
        fill: color,
        fillOpacity: 1,
        strokeOpacity: 0,
        strokeWidth: strokeWidth,
      },
      labels: { fill: color },
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
      }}
    >
      <p style={{ color: 'red', paddingTop: 5 }}>
        {issueWithTimeFormat && useLocalTimezone
          ? 'Cannot display local timezone. Timeseries date in result file is not in ISO8601 format.'
          : ''}
      </p>
      <VictoryChart
        width={chartWidth}
        height={plotHeight}
        theme={VictoryTheme.material}
        domainPadding={{ y: 45 }}
        padding={{ top: 5, bottom: 55, right: 5, left: 55 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => datum.customLabel}
            labelComponent={victoryTooltip}
            voronoiBlacklist={['Line', 'Area']}
          />
        }
      >
        <VictoryAxis
          fixLabelOverlap={true}
          style={{ tickLabels: { fontSize: fontSize } }}
        />
        <VictoryAxis
          dependentAxis
          style={{ tickLabels: { fontSize: fontSize } }}
        />

        {graphInfo &&
          graphInfo.map((graphInfo: TGraphInfo, index) => {
            const color: string = getPlotColor(index)
            if (graphInfo.plotType === PlotType.LINE) {
              const linePlotScatterStyle = getScatterStyle(color, 6)
              const plotData = getLinePlotData(data, graphInfo)
              return (
                <VictoryGroup key={index}>
                  <VictoryLine
                    name={'Line'}
                    key={index}
                    interpolation="natural"
                    style={{
                      data: { stroke: color, strokeWidth: 1 },
                    }}
                    data={plotData}
                    y={graphInfo.name}
                    x={'timestamp'}
                  />
                  <VictoryScatter
                    name="LineScatter"
                    data={plotData}
                    style={linePlotScatterStyle}
                    size={1.5}
                    y={graphInfo.name}
                    x={'timestamp'}
                  />
                </VictoryGroup>
              )
            } else if (graphInfo.plotType === PlotType.SHADED) {
              const plotData = getAreaPlotData(data, graphInfo)
              const scatterPlotStyle = getScatterStyle(color, 4)
              return (
                <VictoryGroup key={index}>
                  <VictoryArea
                    name={'Area'}
                    data={plotData}
                    interpolation="natural"
                    style={{
                      data: {
                        fill: color,
                        fillOpacity: 0.6,
                        stroke: color,
                        strokeWidth: 1,
                      },
                    }}
                  />
                  <VictoryScatter
                    name={'AreaScatter'}
                    size={0}
                    data={plotData}
                    style={scatterPlotStyle}
                  />
                </VictoryGroup>
              )
            } else {
              return <div key={index}></div>
            }
          })}
      </VictoryChart>
    </div>
  )
}
