import { DmtSettings } from '@dmt/core-plugins'
import { OperationStatus, PhaseStatus, SimulationStatus } from './Enums'

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

// DMT
export type TOperation = {
  _id?: string
  name: string
  type: string
  description: string
  creator: string
  location: TLocation
  start?: string | number
  end?: string | number
  status: OperationStatus
  config: TOperationConfig
}

// Uncontained in TOperation
export type TLocation = {
  _id?: string
  name: string
  type: string
  UTM?: string
}

// placeholder for Operation configs, which define Stask/docker image etc.
// Uncontained in TOperation
export type TOperationConfig = {
  _id?: string
  name: string
  type: string
  image?: string
  phases?: TOperationPhase[]
}

// Contained in TOperationConfig
export type TOperationPhase = {
  progress: PhaseStatus
  started?: string | number
  ended?: string | number
  defaultVariables?: any[]
  simulationRuns: TSimulationRun[]
}

// Contained in TOperationPhase
export type TSimulationRun = {
  weatherDataId: string
  progress: SimulationStatus
  started?: string | number
  ended?: string | number
  variables?: any[]
}
