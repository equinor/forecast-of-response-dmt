import { TSimulation } from '../Types'

export function sortSimulationsByNewest(
  simulations: TSimulation[]
): TSimulation[] {
  return [...simulations].sort(
    (simA: TSimulation, simB: TSimulation) =>
      new Date(simB.started) - new Date(simA.started)
  )
}
