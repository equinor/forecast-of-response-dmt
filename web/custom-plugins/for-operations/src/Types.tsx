import { OperationStatus } from './Enums'

export type TLocation = {
  UTM: string
  name: string
  _id: string
}

export type TSimulation = {
  weatherDataId?: string
  progress: string
  started: Date
  ended: Date
}

export type TOperation = {
  _id: string
  name: string
  creator: string
  start: Date
  end: Date
  status: OperationStatus
  location: TLocation
  simulationRuns: TSimulation[]
}
