import React, { useEffect, useState } from 'react'
import LinesOverTime, { TLineChartDataPoint } from './Plots/LinesOverTime'
import { Button, Chip, Icon, Progress, Tooltip } from '@equinor/eds-core-react'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'
import { useDocument } from '@dmt/common'
import { plotColors } from './Design/Colors'
import { DEFAULT_DATASOURCE_ID } from '../const'
import { StyledSelect } from './Input'
import { IconWrapper } from './Other'

import ArrowPlots from './Plots/ArrowPlots'

const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
`

const AddedGraphWrapper = styled.div`
  display: flex;
  margin: 15px 15px;
  flex-wrap: wrap;
`

const GraphSelectorWrapper = styled.div`
  display: flex;
`

function GraphSelect(props: {
  variableRuns: any[]
  chartData: any
  setChartData: Function
  graphInfo: TGraphInfo[]
  setGraphInfo: Function
  index?: string
  deleteResultGraph?: Function
}) {
  const {
    variableRuns,
    chartData,
    setChartData,
    graphInfo,
    setGraphInfo,
    index,
    deleteResultGraph,
  } = props
  const [run, setRun] = useState<number>(0)
  const [response, setResponse] = useState<number>(0)
  const [statistic, setStatistic] = useState<number>(0)

  function addGraph() {
    // Get the timeseries and values from the selected statistic
    const result = variableRuns[run].responses[response].statistics[statistic]

    // Generate a unique name for the graph based on the names of the parents
    const runName = `${variableRuns[run].name}`
    const responseName = `${variableRuns[run].responses[response].name}`
    const statisticName = `${variableRuns[run].responses[response].statistics[statistic].name}`
    const plotName = `${runName}: ${responseName} ${statisticName}`

    const description = `${variableRuns[run].responses[response].statistics[statistic].description}`

    if (graphInfo.map((graph) => graph.name).includes(plotName)) return // Skip if trying to add an existing plot
    let newDataDict: any = {}

    // Create a object for the chartData array (so we can lookup on timestamp)
    chartData.forEach(
      (dataPoint: any) => (newDataDict[dataPoint.timestamp] = dataPoint)
    )

    // Add the new values into the possibly existing timestamp (x-axis), spreading any existing values into it
    result.datetimes.forEach((timestamp: string, index: number) => {
      let newDataPoint: TLineChartDataPoint = newDataDict[timestamp]
      if (result?.plotType == 'shaded') {
        // For AreaChart(shaded), there are twice as many values (upper and lower), as timestamps.
        // Value @ index 1 is lower value for upper value found at index=values.length/2+index
        newDataPoint = {
          timestamp: timestamp,
          [plotName]: [
            result.values[index],
            result.values[result.values.length / 2 + index],
          ],
          ...newDataDict[timestamp],
        }
      } else {
        newDataPoint = {
          timestamp: timestamp,
          [plotName]: result.values[index],
          ...newDataDict[timestamp],
        }
      }
      newDataDict[timestamp] = newDataPoint
    })

    setGraphInfo([
      ...graphInfo,
      {
        name: plotName,
        plotType: result?.plotType,
        unit: result?.unit,
        description: description,
      },
    ])
    setChartData(Object.values(newDataDict))
  }

  return (
    <GraphSelectorWrapper>
      <StyledSelect onChange={(e: Event) => setRun(e.target.value)}>
        {variableRuns.map((run: any, index) => (
          <option key={index} value={index}>
            {run.name}
          </option>
        ))}
      </StyledSelect>
      <StyledSelect onChange={(e: Event) => setResponse(e.target.value)}>
        {variableRuns[run].responses.map((response: any, index: number) => (
          <option key={index} value={index}>
            {response.name}
          </option>
        ))}
      </StyledSelect>
      <StyledSelect onChange={(e: Event) => setStatistic(e.target.value)}>
        {variableRuns[run].responses[response].statistics.map(
          (statistic: any, index: number) => (
            <option key={index} value={index}>
              {statistic.name}
            </option>
          )
        )}
      </StyledSelect>
      <Button
        style={{ width: '120px', marginLeft: '10px' }}
        onClick={() => addGraph()}
      >
        Add graph
      </Button>
      {index ? (
        <Button
          style={{ marginLeft: 'auto', marginRight: 0 }}
          variant="ghost_icon"
          onClick={() => {
            deleteResultGraph(index)
          }}
        >
          <Icon name="close" title="close graph"></Icon>
        </Button>
      ) : (
        <></>
      )}
    </GraphSelectorWrapper>
  )
}

export enum PlotType {
  SHADED = 'shaded',
  LINE = 'line',
  ARROW = 'arrow',
}

export type TGraphInfo = {
  name: string
  unit: string
  plotType: PlotType
  description: string
}

export default (props: {
  result: any
  index?: string
  deleteResultGraph?: Function
  addResultGraph?: Function
}) => {
  const { result, index, deleteResultGraph, addResultGraph } = props
  const [graphInfo, setGraphInfo] = useState<TGraphInfo[]>([])
  const [variableRuns, setVariableRuns] = useState<any[]>([])
  const [chartData, setChartData] = useState<TLineChartDataPoint[]>([])
  const [document, isLoading, updateDocument, error] = useDocument(
    DEFAULT_DATASOURCE_ID,
    result._id
  )

  useEffect(() => {
    if (!isLoading && document && Object.keys(document).length) {
      setVariableRuns(document.variableRuns)
    }
  }, [document, isLoading])

  function removeGraph(name: string) {
    let newDataDict: any = {}

    chartData.forEach((dataPoint: any) => {
      delete dataPoint[name]
      newDataDict[dataPoint.timestamp] = dataPoint
    })

    setGraphInfo(graphInfo.filter((graph) => name !== graph.name))
    setChartData(Object.values(newDataDict))
  }

  if (isLoading) return <Progress.Linear style={{ margin: '20px' }} />

  if (!variableRuns.length)
    return <div style={{ paddingTop: '10px' }}>No variableRuns in result</div>

  if (error) {
    NotificationManager.error(error.message)
    return <div />
  }

  return (
    <ResultWrapper>
      <div>
        <GraphSelect
          variableRuns={variableRuns}
          chartData={chartData}
          setChartData={setChartData}
          setGraphInfo={setGraphInfo}
          graphInfo={graphInfo}
          index={index}
          deleteResultGraph={deleteResultGraph}
        />
        {graphInfo.length >= 1 ? (
          <AddedGraphWrapper>
            {graphInfo.map((graph, index) => (
              <Tooltip title={graph.description} key={index}>
                <Chip
                  key={index}
                  style={{ margin: '10px 5px', cursor: 'help', zIndex: 1 }}
                  variant="active"
                  onDelete={() => removeGraph(graph.name)}
                >
                  <IconWrapper color={plotColors[index]}>&#9679;</IconWrapper>
                  {graph.name}
                </Chip>
              </Tooltip>
            ))}
          </AddedGraphWrapper>
        ) : (
          <div style={{ height: '30px' }}></div>
        )}
      </div>
      <LinesOverTime data={chartData} graphInfo={graphInfo} />
      <ArrowPlots data={chartData} graphInfo={graphInfo} />
      {index ? (
        <></>
      ) : (
        <Button
          style={{ width: '240px', marginLeft: '10px' }}
          variant="outlined"
          onClick={() => {
            addResultGraph()
          }}
        >
          Add extra graph window
        </Button>
      )}
    </ResultWrapper>
  )
}
