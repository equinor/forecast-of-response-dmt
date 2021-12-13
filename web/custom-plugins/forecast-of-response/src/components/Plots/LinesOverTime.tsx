import React, { useEffect, useState } from 'react'

import { plotColors } from '../Design/Colors'
import { PlotType, TGraphInfo } from '../Result'
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory'
import { Icon } from '@equinor/eds-core-react'
import { Checkbox } from 'antd'
import styled from 'styled-components'
export type TLineChartDataPoint = {
  name: string
  [key: string]: number | number[]
}

//using a custom checkbox style since EDS checkbox has a black border that cannot be removed
const CustomCheckbox = styled(Checkbox)`
  padding-top: 10px;
  padding-left: 20px;
  & .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #007079;
    border-color: #007079;
  }
`

type RotatedArrowProps = {
  datum: any
  x: number
  y: number
  attributeNameForData: string
  color: string
}

export default (props: {
  data: TLineChartDataPoint[]
  graphInfo: TGraphInfo[]
}): JSX.Element => {
  const { data, graphInfo } = props
  const [
    viewTooltipForShadedPlot,
    setViewTooltipForShadedPlot,
  ] = useState<boolean>(false)
  const fontSize: number = 8
  const victoryTooltip = (
    <VictoryTooltip
      style={{ fontSize: fontSize }}
      centerOffset={{ y: -10 }}
      flyoutPadding={({ text }) =>
        text.length > 1 ? { top: 10, bottom: 10, left: 15, right: 15 } : 7
      }
    />
  )
  const chartWidth: number = 800
  const plotHeight: number = 200
  //TODO: Read threshold values from result file

  const getVictoryLine = (
    graphInfo: TGraphInfo,
    index: number,
    plotData: TLineChartDataPoint[]
  ) => {
    return (
      <VictoryLine
        key={index}
        interpolation="natural"
        style={{
          data: { stroke: plotColors[index], strokeWidth: 1 },
        }}
        data={plotData}
        y={graphInfo.name}
        x={'timestamp'}
      />
    )
  }
  //todo fix types any
  const getVictoryLineScatterPlot = (
    plotData: any,
    style: any,
    graphInfo: any
  ) => {
    return (
      <VictoryScatter
        data={plotData}
        style={style}
        size={1.5}
        y={graphInfo.name}
        x={'timestamp'}
        labels={({ datum }) => {
          return `${datum.timestamp} \n ${graphInfo.name}: ${datum[
            graphInfo.name
          ].toFixed(2)} ${graphInfo.unit}`
        }}
        labelComponent={victoryTooltip} //
      />
    )
  }
  //size, label, labelcomponent
  const getVictoryAreaScatterPlot = (
    plotData: any,
    style: any,
    graphInfo: any
  ) => {
    return (
      <VictoryScatter
        size={0}
        data={plotData}
        style={style}
        labels={({ datum }) => {
          return `${datum.x} \n ${graphInfo.name}: ${datum.y0.toFixed(
            2
          )} - ${datum.y.toFixed(2)}  ${graphInfo.unit}`
        }}
        labelComponent={viewTooltipForShadedPlot ? victoryTooltip : <div />}
      />
    )
  }

  const getAreaPlotData = (
    data: TLineChartDataPoint[],
    graphInfo: TGraphInfo
  ) => {
    const plotData = data.map((dataPoint: TLineChartDataPoint) => {
      if (Array.isArray(dataPoint[graphInfo.name])) {
        return {
          x: dataPoint.timestamp,
          //@ts-ignore
          y0: dataPoint[graphInfo.name][0],
          //@ts-ignore
          y: dataPoint[graphInfo.name][1],
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

  const getVictoryAreaPlot = (plotData: any, index: number) => {
    return (
      <VictoryArea
        data={plotData}
        interpolation="natural"
        style={{
          data: {
            fill: plotColors[index],
            fillOpacity: 0.6,
            stroke: plotColors[index],
            strokeWidth: 1,
          },
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <CustomCheckbox
        onChange={() => setViewTooltipForShadedPlot(!viewTooltipForShadedPlot)}
      >
        View tooltip for shaded plots
      </CustomCheckbox>

      <VictoryChart
        width={chartWidth}
        height={plotHeight}
        theme={VictoryTheme.material}
        domainPadding={{ y: 15 }}
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
            if (graphInfo.plotType === PlotType.LINE) {
              return getVictoryLine(graphInfo, index, data)
            } else if (graphInfo.plotType === PlotType.SHADED) {
              const plotData = getAreaPlotData(data, graphInfo)
              return getVictoryAreaPlot(plotData, index)
            } else {
              return <div></div>
            }
          })}

        {graphInfo &&
          graphInfo.map((graphInfo: TGraphInfo, index) => {
            if (graphInfo.plotType === PlotType.LINE) {
              const linePlotScatterStyle = getScatterStyle(plotColors[index], 6)
              return getVictoryLineScatterPlot(
                data,
                linePlotScatterStyle,
                graphInfo
              )
            } else if (graphInfo.plotType === PlotType.SHADED) {
              const plotData = getAreaPlotData(data, graphInfo)
              const scatterPlotStyle = getScatterStyle(plotColors[index], 4)
              return getVictoryAreaScatterPlot(
                plotData,
                scatterPlotStyle,
                graphInfo
              )
            } else {
              return <div></div>
            }
          })}
      </VictoryChart>
    </div>
  )
}
