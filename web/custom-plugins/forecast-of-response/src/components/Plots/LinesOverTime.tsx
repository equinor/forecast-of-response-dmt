import React, { useEffect, useState } from 'react'

import { getPlotColor } from '../Design/Colors'
import { PlotType, TGraphInfo } from '../Result'
import {
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory'

import { dayOfYear, getDayFromDateString, getTime } from './plotUtils'
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
  const [shadedBackgroundData, setShadedBackgroundData] = useState<any[]>([])
  const [currentTimeIndicatorData, setCurrentTimeIndicatorData] = useState<
    any[]
  >([])
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

  useEffect(() => {
    const maxYValue = calculateMaxY()

    let yOffset = 0

    if (maxYValue <= 6) {
      yOffset = 4
    } else if (maxYValue <= 15) {
      yOffset = 10
    } else if (maxYValue <= 30) {
      yOffset = 15
    } else {
      yOffset = 30
    }

    setShadedBackgroundData(getShadedBackgroundData(maxYValue, yOffset))
    setCurrentTimeIndicatorData(getCurrentTimeIndicatorData(maxYValue, yOffset))
  }, [data])

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

  const calculateMaxY = () => {
    let maxY: number = -10000000
    let excludedKeyes: string[] = []

    //create a list of keys to include. We only want to calcualate max y value for line and shaded plots (not arrow plots)
    excludedKeyes.push('timestamp')
    graphInfo.map((i) => {
      if (i.plotType !== PlotType.LINE && i.plotType !== PlotType.SHADED) {
        excludedKeyes.push(i.name)
      }
    })
    Object.values(data).map((x) => {
      Object.keys(x).map((key: string) => {
        if (!excludedKeyes.includes(key)) {
          if (Array.isArray(x[key])) {
            let max = Math.max.apply(null, x[key])
            if (max > maxY) {
              maxY = max
            }
          } else {
            if (x[key] > maxY) {
              maxY = x[key]
            }
          }
        }
      })
    })
    return maxY
  }

  const getShadedBackgroundData = (maxY: number, yOffset: number) => {
    //generate data to shade the plot background. Every second day gets a shaded background.
    //the data returned can be plotted using a VictoryBar component.
    let _data: any[] = []
    if (maxY < -10000) {
      return []
    }

    let startYear: number = new Date(data[0].timestamp).getFullYear()
    let dayAsBool: number
    let dayNumber: number
    data.map((dataPoint, index) => {
      dayNumber = dayOfYear(dataPoint['timestamp'])
      //adding start year is required to handle the overlap between 31. December and 1. January
      dayAsBool =
        (dayNumber +
          new Date(dataPoint['timestamp']).getFullYear() -
          startYear) %
        2

      _data.push({
        x: index + 1,
        y: dayAsBool * (maxY + yOffset),
      })
    })
    return _data
  }

  const getCurrentTimeIndicatorData = (maxY: number, yOffset: number) => {
    //function for generating data to display current time in the plot.
    //the returned data can be used in VictoryBar component.
    const emptyData = [{ x: 0, y: 0 }]
    if (maxY < -10000) {
      return emptyData
    }
    if (data.length === 0) {
      return emptyData
    }

    let timeNow = new Date().getTime()

    let smallestDifference = Infinity
    let smallestDifferenceIndex = 0
    let time = 0
    //if current time is not inside the time window of the result, return empty data
    if (
      timeNow > new Date(data[data.length - 1]['timestamp']).getTime() ||
      timeNow < new Date(data[0]['timestamp']).getTime()
    ) {
      return emptyData
    }

    data.map((dataPoint, index) => {
      time = new Date(dataPoint['timestamp']).getTime()
      if (Math.abs(time - timeNow) < smallestDifference) {
        smallestDifference = Math.abs(time - timeNow)
        smallestDifferenceIndex = index
      }
    })

    return [{ x: smallestDifferenceIndex + 1, y: maxY + yOffset }]
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
        domainPadding={{ y: 0 }}
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
        <VictoryBar
          barRatio={1.075}
          alignment="start"
          style={{
            data: { fill: 'lightgray', stroke: 'none', opacity: 0.15 },
          }}
          data={shadedBackgroundData}
        />
        <VictoryBar
          barWidth={1}
          alignment="start"
          style={{
            data: { fill: '#294f55', stroke: 'none', opacity: 0.95 },
          }}
          data={currentTimeIndicatorData}
        />
      </VictoryChart>
    </div>
  )
}
