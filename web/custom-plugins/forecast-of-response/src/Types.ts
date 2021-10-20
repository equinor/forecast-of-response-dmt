import { DmtSettings } from '@dmt/core-plugins'
import { ACLEnum, OperationStatus } from './Enums'

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

export type TConfig = {
  name: string
  simaVersion: string
  _id?: string
  type?: string
}

export type StringMap = {
  [key: string]: string
}

export type TAcl = {
  owner: ACLEnum
  roles: StringMap
  users: StringMap
  others: ACLEnum
}

export type TSimulation = {
  progress?: string
  started?: Date
  ended?: Date
  results?: any[]
}

export type TSimulationConfig = {
  name: string
  simulations: TSimulation[]
  variables: string[]
  simaJob: any
}

export type TPhase = {
  simulationConfigs?: TSimulationConfig[]
  name: string
  start?: Date
  end?: Date
  status?: OperationStatus
  defaultVariables?: StringMap
}

export type TBlob = {
  _id: string
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
  stask: TStask
  description?: string
  creator: string
  start?: Date
  end?: Date
  status?: OperationStatus
  location: TLocation
  phases: TPhase[]
  config?: TConfig
  comments?: TComment
}

export type TOperationStatus =
  | 'All operations'
  | 'My operations'
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
