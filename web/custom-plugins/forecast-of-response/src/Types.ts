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
  UTM: string
  name: string
  _id: string
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
  weatherDataId?: string
  progress: string
  started: Date
  ended: Date
}

export type TPhase = {
  simulations: TSimulation[]
  name: string
  start: Date
  end: Date
  status: OperationStatus
}

export type TOperation = {
  _id: string
  name: string
  creator: string
  start: Date
  end: Date
  status: OperationStatus
  location: TLocation
  phases: TPhase[]
}
