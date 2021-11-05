import React, { useState } from 'react'
import { TPhase, TSimulation, TSimulationConfig } from '../../Types'
import { StyledSelect } from '../Input'
import Result from '../Result'
import { sortSimulationsByNewest } from '../../utils/sort'

export default (props: { phase: TPhase }): JSX.Element => {
  const { phase } = props
  const publishedSimulation = phase.simulationConfigs.find(
    (simConf: TSimulationConfig) => simConf?.published === true
  )
  const [selectedSim, setSelectedSim] = useState<number>(0)
  const simulations = sortSimulationsByNewest(
    publishedSimulation?.simulations || []
  )

  if (!publishedSimulation)
    return <div>No results have been published for this operation phase</div>

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      <div
        style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}
      >
        <label>Select which simulation to view</label>
        <StyledSelect
          onChange={(e: Event) => {
            setSelectedSim(parseInt(e.target.value))
          }}
        >
          {simulations.map((simulation: TSimulation, index) => (
            <option
              key={index}
              value={index}
              onSelect={() => setSelectedSim(index)}
            >
              {new Date(simulation.started).toLocaleString(navigator.language)}
            </option>
          ))}
        </StyledSelect>
        {simulations[selectedSim]?.result._id ? (
          <Result result={simulations[selectedSim]?.result} />
        ) : (
          <div style={{ alignSelf: 'center' }}>
            <label>No result for this simulation...</label>
          </div>
        )}
      </div>
    </div>
  )
}
