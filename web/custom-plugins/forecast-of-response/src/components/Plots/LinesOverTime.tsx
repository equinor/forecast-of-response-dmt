import React, { useState } from 'react'

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
import { Checkbox, Icon } from '@equinor/eds-core-react'

export type TLineChartDataPoint = {
  name: string
  [key: string]: number | number[]
}

type RotatedArrowProps = {
  datum: any
  x: number
  y: number
  attributeNameForData: string
  color: string
}

//RotatedArrow must be class component to get correct props from VicotryChart
class RotatedArrow extends React.Component<RotatedArrowProps> {
  render() {
    const { datum, x, y, attributeNameForData, color } = this.props
    const iconWidth: 16 | 24 | 32 | 40 | 48 = 16

    //offset to center the arrows in the plot - this value depends on height of plot window
    const yAxisOffset: number = 25
    const translation: string = `${x - iconWidth / 2}, ${
      y + yAxisOffset - iconWidth / 2
    }`
    const rotation: string = `${datum[attributeNameForData]}, ${
      iconWidth / 2
    }, ${iconWidth / 2}`

    return (
      <g transform={`translate(${translation}) rotate(${rotation})`}>
        <Icon name="arrow_up" size={iconWidth} color={color} />
      </g>
    )
  }
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
      flyoutPadding={({ text }) =>
        text.length > 1 ? { top: 10, bottom: 10, left: 15, right: 15 } : 7
      }
    />
  )
  const chartWidth: number = 800
  const plotHeight: number = 200
  //TODO: Read threshold values from result file
  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <Checkbox
        onChange={() => setViewTooltipForShadedPlot(!viewTooltipForShadedPlot)}
        label="View tooltip for shaded plots"
      ></Checkbox>
      <VictoryChart
        width={chartWidth}
        height={plotHeight}
        theme={VictoryTheme.material}
        domainPadding={{ y: 15 }}
        containerComponent={<VictoryVoronoiContainer />}
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
            const linePlotScatterStyle = {
              data: {
                fill: plotColors[index],
                fillOpacity: 1,
                strokeOpacity: 0,
                strokeWidth: 6,
              },
              labels: { fill: plotColors[index] },
            }
            if (graphInfo.plotType === PlotType.LINE) {
              return (
                <VictoryGroup>
                  <VictoryLine
                    key={index}
                    interpolation="natural"
                    style={{
                      data: { stroke: plotColors[index], strokeWidth: 1 },
                    }}
                    data={data}
                    y={graphInfo.name}
                    x={'timestamp'}
                  />
                  <VictoryScatter
                    data={data}
                    style={linePlotScatterStyle}
                    size={1.5}
                    y={graphInfo.name}
                    x={'timestamp'}
                    labels={({ datum }) => {
                      return `${datum.timestamp} \n ${graphInfo.name}: ${datum[
                        graphInfo.name
                      ].toFixed(2)} ${graphInfo.unit}`
                    }}
                    labelComponent={victoryTooltip}
                  />
                </VictoryGroup>
              )
            } else if (graphInfo.plotType === PlotType.SHADED) {
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

              return (
                <VictoryGroup>
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
                  <VictoryScatter
                    size={0}
                    data={plotData}
                    style={{
                      data: { fillOpacity: 0 },
                      labels: { fill: plotColors[index] },
                    }}
                    labels={({ datum }) => {
                      return `${datum.x} \n ${
                        graphInfo.name
                      }: ${datum.y0.toFixed(2)} - ${datum.y.toFixed(2)}  ${
                        graphInfo.unit
                      }`
                    }}
                    labelComponent={
                      viewTooltipForShadedPlot ? victoryTooltip : <div />
                    }
                  />
                </VictoryGroup>
              )
            } else {
              return <div></div>
            }
          })}
      </VictoryChart>
    </div>
  )
}
