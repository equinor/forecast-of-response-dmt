import { DmtSettings } from '@dmt/core-plugins'

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
  startDate: number
  endDate?: number
  location: string
  author: string
  status: string
}
