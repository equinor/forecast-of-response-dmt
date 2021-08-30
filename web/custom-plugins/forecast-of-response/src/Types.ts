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

// TODO: Retrieve from Blueprint / DMT?
export type TOperation = {
  name: string
  startDate: number | string
  endDate?: number | string
  location: string
  author: string
  status: string
}
