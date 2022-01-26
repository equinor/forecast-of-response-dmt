import { TReference } from '../Types'

export function sortSimulationsByNewest(
  simulationResults: TReference[]
): TReference[] {
  //assume that new simulations are appended to the back of the list. Therefore, reversing the list will show newest result first.
  return [].concat(simulationResults).reverse()
}
