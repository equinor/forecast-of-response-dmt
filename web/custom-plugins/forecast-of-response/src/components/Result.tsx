import React, { useEffect, useState } from 'react'
import LinesOverTime, { TLineChartDataPoint } from './Plots/LinesOverTime'
import { Button, Chip, Progress, Tooltip } from '@equinor/eds-core-react'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'
import { useDocument } from '@dmt/common'
import { getPlotColor } from './Design/Colors'
import { DEFAULT_DATASOURCE_ID } from '../const'
import { StyledSelect } from './Input'
import { IconWrapper } from './Other'

import ArrowPlots from './Plots/ArrowPlots'
import { TGraph, TPlot } from '../Types'
import { poorMansUUID } from '../utils/uuid'
import Icons from './Design/Icons'
import moment from 'moment'

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
  padding-top: 20px;
`

function GraphSelect(props: {
  variableRuns: any[]
  chartData: any
  setChartData: Function
  graphInfo: TGraphInfo[]
  setGraphInfo: Function
  plotKey: string
  plotWindowHandlers: {
    deletePlotWindow: (plotKey: string) => void
    addGraph: (graph: TGraph) => void
    getGraphs: () => TGraph[]
  }
  isRootPlot?: boolean
}) {
  const {
    variableRuns,
    chartData,
    setChartData,
    graphInfo,
    setGraphInfo,
    plotKey,
    plotWindowHandlers,
    isRootPlot,
  } = props
  const [chosenRun, setChosenRun] = useState<number>(0)
  const [chosenResponse, setChosenResponse] = useState<number>(0)
  const [chosenStatistic, setChosenStatistic] = useState<number>(0)

  useEffect(() => {
    setChosenResponse(0)
  }, [chosenRun])

  useEffect(() => {
    setChosenStatistic(0)
  }, [chosenResponse])

  useEffect(() => {
    const storedGraphs = plotWindowHandlers.getGraphs()
    if (storedGraphs) {
      let newGraphInfo: TGraphInfo[] = []
      let newDataDict: any = {}
      try {
        storedGraphs.forEach((storedGraph) => {
          let [newGraph, newData] = createGraph(
            storedGraph.run,
            storedGraph.response,
            storedGraph.statistic,
            storedGraph.uuid
          )
          newGraphInfo.push(newGraph)
          Object.entries(newData).forEach(([key, value]: any) => {
            newDataDict[key] = { ...newDataDict[key], ...value }
          })
        })
        setGraphInfo(newGraphInfo)
        setChartData(Object.values(newDataDict))
      } catch (error) {
        NotificationManager.error(`${error}`)
      }
    }
  }, [])

  function addGraphFromSelector() {
    let uuid = poorMansUUID()
    let newGraphInfo: TGraphInfo[] = graphInfo
    let newDataDict: any = {}
    try {
      let [newGraph, newData] = createGraph(
        chosenRun,
        chosenResponse,
        chosenStatistic,
        uuid
      )
      // Add graph if not already present
      if (newGraph) {
        newGraphInfo.push(newGraph)
        setGraphInfo(newGraphInfo)
        Object.entries(newData).forEach(([key, value]: any) => {
          newDataDict[key] = { ...newDataDict[key], ...value }
        })
        setChartData(Object.values(newDataDict))
        let graph: TGraph = {
          run: chosenRun,
          response: chosenResponse,
          statistic: chosenStatistic,
          uuid: uuid,
        }
        plotWindowHandlers.addGraph(graph)
      } else {
        NotificationManager.info(
          'The selected graph is already present in the plot.'
        )
      }
    } catch (error) {
      NotificationManager.error(`${error}`)
    }
  }

  function createGraph(
    run: number,
    response: number,
    statistic: number,
    uuid: string = poorMansUUID()
  ) {
    // Get the timeseries and values from the selected statistic

    if (
      run > variableRuns.length - 1 ||
      response > variableRuns[run].responses.length - 1 ||
      statistic > variableRuns[run].responses[response].statistics.length
    ) {
      throw new Error(
        'Could not display plot(s). Index of chosen parameters were out of bounds. Switch result and delete plots if possible.'
      )
    }
    const result = variableRuns[run].responses[response].statistics[statistic]
    const runName = `${variableRuns[run].name}`
    const responseName = `${variableRuns[run].responses[response].name}`
    const statisticName = `${variableRuns[run].responses[response].statistics[statistic].name}`
    // Generate a unique name for the graph based on the names of the parents
    const graphName = `${runName}: ${responseName} ${statisticName}`
    const description = `${variableRuns[run].responses[response].statistics[statistic].description}`

    if (graphInfo.map((graph) => graph.name).includes(graphName))
      return [false, {}] // graph already present
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
          [graphName]: [
            result.values[index],
            result.values[result.values.length / 2 + index],
          ],
          ...newDataDict[timestamp],
        }
      } else {
        newDataPoint = {
          timestamp: timestamp,
          [graphName]: result.values[index],
          ...newDataDict[timestamp],
        }
      }
      newDataDict[timestamp] = newDataPoint
    })

    return [
      {
        name: graphName,
        plotType: result?.plotType,
        unit: result?.unit,
        description: description,
        uuid: uuid,
      },
      newDataDict,
    ]
  }

  return (
    <GraphSelectorWrapper>
      <StyledSelect
        onChange={(e: Event) => setChosenRun(e.target.value)}
        value={chosenRun}
      >
        {variableRuns.map((run: any, index) => (
          <option key={index} value={index}>
            {run.name}
          </option>
        ))}
      </StyledSelect>
      {variableRuns[chosenRun] && (
        <StyledSelect
          onChange={(e: Event) => setChosenResponse(e.target.value)}
          value={chosenResponse}
        >
          {variableRuns[chosenRun].responses.map(
            (response: any, index: number) => (
              <option key={index} value={index}>
                {response.name}
              </option>
            )
          )}
        </StyledSelect>
      )}
      {variableRuns[chosenRun].responses[chosenResponse] && (
        <StyledSelect
          onChange={(e: Event) => setChosenStatistic(e.target.value)}
          value={chosenStatistic}
        >
          {variableRuns[chosenRun].responses[chosenResponse].statistics.map(
            (statistic: any, index: number) => (
              <option key={index} value={index}>
                {statistic.name}
              </option>
            )
          )}
        </StyledSelect>
      )}
      <Button
        style={{ width: '140px', marginLeft: '10px' }}
        onClick={() => {
          addGraphFromSelector()
        }}
      >
        Add graph
        <Icons name="add" title="add" />
      </Button>
      {!isRootPlot && (
        <Button
          style={{ marginLeft: 'auto', marginRight: 0 }}
          variant="ghost_icon"
          onClick={() => plotWindowHandlers.deletePlotWindow(plotKey)}
        >
          <Icons name="close" title="close graph" />
        </Button>
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
  uuid: string
}

export default (props: {
  result: any
  plotKey: string
  useLocalTimezone: boolean
  plotWindowHandlers: {
    addPlotWindow: (plotKey?: string | undefined) => void
    deletePlotWindow: (plotKey: string) => void
    addGraph: (graph: TGraph) => void
    getGraphs: () => TGraph[]
    deleteGraph: (uuid: string) => void
  }
  isRootPlot?: boolean
}) => {
  const {
    result,
    plotKey,
    plotWindowHandlers,
    isRootPlot,
    useLocalTimezone,
  } = props
  const [graphInfo, setGraphInfo] = useState<TGraphInfo[]>([])
  const [variableRuns, setVariableRuns] = useState<any[]>([])
  const [chartData, setChartData] = useState<TLineChartDataPoint[]>([])

  //issueWithTimeFormat will be set to true if time format in result file does not follow the ISO 8601 standard
  let issueWithTimeFormat: boolean
  if (
    chartData[0] &&
    moment(chartData[0].timestamp, moment.ISO_8601, true).isValid()
  ) {
    issueWithTimeFormat = false
  } else {
    issueWithTimeFormat = true
  }
  const [document, isLoading, updateDocument, error] = useDocument(
    DEFAULT_DATASOURCE_ID,
    result._id
  )
  useEffect(() => {
    if (!isLoading && document && Object.keys(document).length) {
      setVariableRuns(document.variableRuns)
    }
  }, [document, isLoading])

  useEffect(() => {
    setGraphInfo([])
    setVariableRuns([])
    setChartData([])
  }, [result])

  function removeGraph(name: string, uuid: string) {
    let newDataDict: any = {}

    chartData.forEach((dataPoint: any) => {
      delete dataPoint[name]
      newDataDict[dataPoint.timestamp] = dataPoint
    })

    setGraphInfo(graphInfo.filter((graph: TGraphInfo) => name !== graph.name))
    setChartData(Object.values(newDataDict))
    plotWindowHandlers.deleteGraph(uuid)
  }

  if (isLoading) return <Progress.Linear style={{ margin: '20px' }} />

  if (!variableRuns.length)
    return <div style={{ paddingTop: '10px' }}>No variableRuns in result</div>

  if (error) {
    NotificationManager.error(error.message)
    return <div />
  }

  return (
    <div>
      <ResultWrapper>
        <div>
          <GraphSelect
            variableRuns={variableRuns}
            chartData={chartData}
            setChartData={setChartData}
            setGraphInfo={setGraphInfo}
            graphInfo={graphInfo}
            plotKey={plotKey}
            plotWindowHandlers={{
              deletePlotWindow: (plotKey: string) =>
                plotWindowHandlers.deletePlotWindow(plotKey),
              addGraph: (graph: TGraph) => plotWindowHandlers.addGraph(graph),
              getGraphs: () => plotWindowHandlers.getGraphs(),
            }}
            isRootPlot={isRootPlot}
          />
          {graphInfo.length >= 1 && (
            <AddedGraphWrapper>
              {graphInfo.map((graph: TGraphInfo, graphIndex) => (
                <Tooltip title={graph.description} key={graphIndex}>
                  <Chip
                    key={graphIndex}
                    style={{
                      margin: '10px 5px',
                      cursor: 'help',
                      zIndex: 1,
                    }}
                    variant="active"
                    onDelete={() => removeGraph(graph.name, graph.uuid)}
                  >
                    <IconWrapper color={getPlotColor(graphIndex)}>
                      &#9679;
                    </IconWrapper>
                    {graph.name}
                  </Chip>
                </Tooltip>
              ))}
            </AddedGraphWrapper>
          )}
        </div>
        <LinesOverTime
          data={chartData}
          issueWithTimeFormat={issueWithTimeFormat}
          graphInfo={graphInfo}
          useLocalTimezone={useLocalTimezone}
        />
        <ArrowPlots
          data={chartData}
          issueWithTimeFormat={issueWithTimeFormat}
          graphInfo={graphInfo}
          useLocalTimezone={useLocalTimezone}
        />
        {isRootPlot && (
          <Button
            style={{ width: '140px', marginLeft: '10px' }}
            variant="outlined"
            onClick={() => plotWindowHandlers.addPlotWindow()}
          >
            Add plot
            <Icons name="add" title="add" />
          </Button>
        )}
      </ResultWrapper>
    </div>
  )
}
