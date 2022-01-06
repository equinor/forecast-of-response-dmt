import { TResultReference } from '../Types'

export function sortSimulationsByNewest(
  simulationResults: TResultReference[]
): TResultReference[] {
  //assume that new simulations are appended to the back of the list
  return [].concat(simulationResults).reverse()
}
