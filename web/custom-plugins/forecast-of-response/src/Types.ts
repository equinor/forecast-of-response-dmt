import { DmtSettings } from '@dmt/core-plugins'
import { OperationStatus } from './Enums'

export type DmtSettings = DmtSettings

export type TRoute = {
  path: string
  heading: string
  content: JSX.Element
}

export type TApp = {
  applications: any
  settings: DmtSettings
}

export type TContent = {
  heading: string
  content: JSX.Element
  settings: DmtSettings
}

export type TLayout = {
  heading: string
  content: string
  settings: DmtSettings
}

export type TLocation = {
  UTM: string
  name: string
  _id: string
}

export type TSimulationRun = {
  weatherDataId?: string
  progress: string
  started: Date
  ended: Date
  variables: any[]
}

export type TOperationPhase = {
  weatherDataId?: string
  progress: string
  started: Date
  ended: Date
  defaultVariables?: any[]
  simulationRuns: TSimulationRun[]
}

// TODO: Retrieve from Blueprint / DMT?
export type TOperation = {
  _id?: string
  name: string
  creator: string
  start: number | string
  end?: number | string
  status: OperationStatus
  location: TLocation
  config: TOperationConfig
}

// placeholder for Operation configs, which define Stask/docker image etc.
export type TOperationConfig = {
  _id: string
  name: string
  image: string
  phases: TOperationPhase[]
}
