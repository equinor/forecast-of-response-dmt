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
  lat: number
  long: number
  name: string
  _id?: string
  type?: string
}

export type TOperationMeta = { name: string; label: string; dateRange: Date[] }

export type TConfig = {
  name: string
  simaVersion: string
  phases: TPhase[]
  description?: string
  _id?: string
  type?: string
}

export type StringMap = {
  [key: string]: string
}

export type TSimulation = {
  type?: string
  name?: string
  simaJob?: any
  progress?: string
  started?: string
  ended?: string
  result?: any
}

export type TSimulationConfig = {
  name: string
  simulations: TSimulation[]
  variables: string[]
  simaJob: any
  published: boolean
}

export type TPhase = {
  simulationConfigs?: TSimulationConfig[]
  name: string
  start?: Date
  end?: Date
  activeForecast?: TSimulation
  status?: OperationStatus
  defaultVariables?: StringMap
}

export type TBlob = {
  _blob_id: string
  name: string
  type: string
}
export type TStask = {
  workflowTask: string
  blob: TBlob
}

export type TOperation = {
  _id?: string
  type?: string
  name: string
  label: string
  stask: TStask
  description?: string
  creator: string
  start?: Date
  end?: Date
  status?: OperationStatus
  location: TLocation
  phases: TPhase[]
  comments?: TComment
}

export type TOperationStatus =
  | OperationStatus.ONGOING
  | OperationStatus.CONCLUDED
  | OperationStatus.UPCOMING

export type TComment = {
  _id?: string
  author: string
  date: Date
  message: string
  operation: string
}
