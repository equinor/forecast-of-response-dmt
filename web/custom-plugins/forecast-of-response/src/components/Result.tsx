import React, { useEffect, useState } from 'react'
import LinesOverTime, { TLineChartDataPoint } from './Plots/LinesOverTime'
import { Button, Chip, Progress } from '@equinor/eds-core-react'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'
import { useDocument } from '@dmt/common'
import { plotColors } from './Design/Colors'
import { DEFAULT_DATASOURCE_ID } from '../const'
import { StyledSelect } from './Input'
import { IconWrapper } from './Other'

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
  border: #f6f6f6 2px solid;
  margin: 15px 15px;
  padding: 10px;
  width: 500px;
  justify-content: space-evenly;
`

function GraphSelect(props: {
  variableRuns: any[]
  chartData: any
  setChartData: Function
  graphNames: string[]
  setGraphNames: Function
}) {
  const {
    variableRuns,
    chartData,
    setChartData,
    graphNames,
    setGraphNames,
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
    const plotName = `${runName}-${responseName}-${statisticName}`

    if (graphNames.includes(plotName)) return // Skip if trying to add an existing plot
    let newDataDict: any = {}

    // Create a object for the chartData array (so we can lookup on timestamp)
    chartData.forEach((dataPoint: any) => {
      newDataDict[dataPoint.timestamp] = dataPoint
    })

    // Add the new values into the possibly existing timestamp (x-axis), spreading any existing values into it
    result.datetimes.forEach((timestamp: string, index: number) => {
      let newDataPoint: TLineChartDataPoint = newDataDict[timestamp]
      newDataPoint = {
        timestamp: timestamp,
        [plotName]: result.values[index],
        ...newDataDict[timestamp],
      }
      newDataDict[timestamp] = newDataPoint
    })
    setGraphNames([...graphNames, plotName])
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
        {variableRuns[run].responses.map((response: any, index) => (
          <option key={index} value={index}>
            {response.name}
          </option>
        ))}
      </StyledSelect>
      <StyledSelect onChange={(e: Event) => setStatistic(e.target.value)}>
        {variableRuns[run].responses[response].statistics.map(
          (statistic: any, index) => (
            <option key={index} value={index}>
              {statistic.name}
            </option>
          )
        )}
      </StyledSelect>
      <Button style={{ width: '120px' }} onClick={() => addGraph()}>
        Add graph
      </Button>
    </GraphSelectorWrapper>
  )
}

export default (props: { result: any }) => {
  const { result } = props
  const [graphNames, setGraphNames] = useState<string[]>([])
  const [variableRuns, setVariableRuns] = useState<any[]>([])
  const [chartData, setChartData] = useState<TLineChartDataPoint[]>([])
  const [document, isLoading, updateDocument, error] = useDocument(
    DEFAULT_DATASOURCE_ID,
    result._id
  )

  useEffect(() => {
    if (document && Object.keys(document).length)
      setVariableRuns(document.variableRuns)
  }, [document])

  function removeGraph(name: string) {
    let newDataDict: any = {}

    chartData.forEach((dataPoint: any) => {
      delete dataPoint[name]
      newDataDict[dataPoint.timestamp] = dataPoint
    })

    setGraphNames(graphNames.filter((existingName) => name !== existingName))
    setChartData(Object.values(newDataDict))
  }

  if (!variableRuns.length) return <>No variableRuns in result</>

  if (error) {
    NotificationManager.error(error.message)
    return <div />
  }
  if (isLoading) return <Progress.Linear />

  return (
    <ResultWrapper>
      <div>
        <GraphSelect
          variableRuns={variableRuns}
          chartData={chartData}
          setChartData={setChartData}
          setGraphNames={setGraphNames}
          graphNames={graphNames}
        />
        {graphNames.length >= 1 && (
          <AddedGraphWrapper>
            {graphNames.map((name, index) => (
              <Chip
                key={index}
                style={{ margin: '10px 5px' }}
                variant="active"
                onDelete={() => removeGraph(name)}
              >
                <IconWrapper color={plotColors[index]}>&#9679;</IconWrapper>
                {name}
              </Chip>
            ))}
          </AddedGraphWrapper>
        )}
      </div>
      <LinesOverTime
        data={chartData}
        warningLine={1.2}
        MaxLine={2.7}
        graphNames={graphNames}
      />
    </ResultWrapper>
  )
}
