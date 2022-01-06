import React, { useEffect, useState } from 'react'
import { TPhase, TSimulation, TSimulationConfig } from '../../Types'
import { StyledSelect } from '../Input'
import Result from '../Result'
import { sortSimulationsByNewest } from '../../utils/sort'

export default (props: { phase: TPhase }): JSX.Element => {
  const { phase } = props
  const publishedSimulation: TSimulationConfig = phase.simulationConfigs.find(
    (simConf: TSimulationConfig) => simConf?.published === true
  )
  const [selectedSim, setSelectedSim] = useState<number>(0)
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
        <label>Select which simulation result to view</label>
        <StyledSelect
          onChange={(e: Event) => {
            setSelectedSim(parseInt(e.target.value))
          }}
        >
          {simulations.map((simulation, index) => (
            <option
              key={index}
              value={index}
              onSelect={() => setSelectedSim(index)}
            >
              {simulation['name']}
            </option>
          ))}
        </StyledSelect>
        {simulations[selectedSim]?._id ? (
          <div>
            <Result
              result={simulations[selectedSim]}
              addPlotWindow={addPlotWindow}
            />
            {resultGraphs &&
              Object.keys(resultGraphs).map((index: string) => (
                <Result
                  key={index}
                  result={simulations[selectedSim]}
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
