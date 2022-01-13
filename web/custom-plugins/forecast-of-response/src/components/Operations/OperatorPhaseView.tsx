import React, { useEffect, useState } from 'react'
import { TGraph, TPhase, TPlot, TSimulationConfig } from '../../Types'
// import Result from '../Result'
import { sortSimulationsByNewest } from '../../utils/sort'
import { poorMansUUID } from '../../utils/uuid'
import { Blueprints } from '../../Enums'

export default (props: { phase: TPhase }): JSX.Element => {
  const { phase } = props
  const publishedSimulation: TSimulationConfig = phase.simulationConfigs.find(
    (simConf: TSimulationConfig) => simConf?.published === true
  )
  const [resultGraphs, setResultGraphs] = useState<any>({})
  const simulations = sortSimulationsByNewest(publishedSimulation.results)
  const [plotWindows, setPlotWindows] = useState<any>({
    [poorMansUUID()]: { graphs: [] },
  })

  useEffect(() => {
    if (publishedSimulation.plots) {
      // Retrieve the "stored plots"
      let storedPlots: any = {}
      publishedSimulation.plots.map((storedPlot) => {
        storedPlots[poorMansUUID()] = storedPlot
      })
      setPlotWindows(storedPlots)
    }
  }, [])

  const plotWindowHandlers = {
    addPlotWindow: (key: string = poorMansUUID()): void => {
      setPlotWindows({ ...plotWindows, [key]: { graphs: [] } })
    },
    deletePlotWindow: (key: string): void => {
      const plots: any = plotWindows
      delete plots[key]
      setPlotWindows({ ...plots })
    },
    addGraph: (plotKey: string, graph: TGraph): void => {
      const graphs: TGraph[] = plotWindows[plotKey].graphs
      graphs.push(graph)
      setPlotWindows({ ...plotWindows, [plotKey]: { graphs: graphs } })
    },
    getGraphs: (plotKey: string): TGraph[] => {
      return plotWindows[plotKey].graphs
    },
    deleteGraph: (plotKey: string, uuid: string) => {
      let graphs: TGraph[] = plotWindows[plotKey].graphs
      graphs = graphs.filter((graph) => graph.uuid !== uuid)
      setPlotWindows({ ...plotWindows, [plotKey]: { graphs: graphs } })
    },
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
        <label>Viewing most recent result: {simulations[0].name}</label>

        {simulations[0]?._id ? (
          <div>
            {/*{plotWindows &&*/}
            {/*  simulations[0] &&*/}
            {/*  Object.keys(plotWindows).map((plotKey: string, plotKeyIndex) => (*/}
            {/*    <Result*/}
            {/*      key={`plotWindow-${plotKey}`}*/}
            {/*      result={simulations[0]}*/}
            {/*      plotKey={plotKey}*/}
            {/*      plotWindowHandlers={{*/}
            {/*        addPlotWindow: (plotKey?: string | undefined) =>*/}
            {/*          plotWindowHandlers.addPlotWindow(),*/}
            {/*        deletePlotWindow: (plotKey: string) =>*/}
            {/*          plotWindowHandlers.deletePlotWindow(plotKey),*/}
            {/*        addGraph: (graph: TGraph) =>*/}
            {/*          plotWindowHandlers.addGraph(plotKey, graph),*/}
            {/*        getGraphs: () => plotWindowHandlers.getGraphs(plotKey),*/}
            {/*        deleteGraph: (uuid: string) =>*/}
            {/*          plotWindowHandlers.deleteGraph(plotKey, uuid),*/}
            {/*      }}*/}
            {/*      isRootPlot={plotKeyIndex == 0}*/}
            {/*    />*/}
            {/*  ))}*/}
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
