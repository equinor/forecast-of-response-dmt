import React, { useState } from 'react'
import { TPhase, TSimulationConfig } from '../../Types'
import Result from '../Result'
import { sortSimulationsByNewest } from '../../utils/sort'

export default (props: { phase: TPhase }): JSX.Element => {
  const { phase } = props
  const publishedSimulation: TSimulationConfig = phase.simulationConfigs.find(
    (simConf: TSimulationConfig) => simConf?.published === true
  )
  const [resultGraphs, setResultGraphs] = useState<any>({})
  const simulations = sortSimulationsByNewest(publishedSimulation.results)

  const addPlotWindow = () => {
    const index: string = (Math.random() * 100).toString()
    setResultGraphs({ ...resultGraphs, [index]: true })
  }

  const removePlotWindow = (index: string) => {
    const graphs: any = resultGraphs
    delete graphs[index]
    setResultGraphs({ ...graphs })
  }

  if (!publishedSimulation)
    return <div>No results have been published for this operation phase</div>
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      <div
        style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}
      >
        <label>Viewing result: {simulations[0].name}</label>

        {simulations[0]?._id ? (
          <div>
            <Result result={simulations[0]} addPlotWindow={addPlotWindow} />
            {resultGraphs &&
              Object.keys(resultGraphs).map((index: string) => (
                <Result
                  key={index}
                  result={simulations[0]}
                  index={index}
                  deletePlotWindow={removePlotWindow}
                />
              ))}
          </div>
        ) : (
          <div style={{ alignSelf: 'center' }}>
            <label>No result for this simulation...</label>
          </div>
        )}
      </div>
    </div>
  )
}
