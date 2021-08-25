import { DmtSettings } from '@dmt/core-plugins'

export type TRoute = {
  path: string
  content: string
}

export type TApp = {
  applications: any
  settings: DmtSettings
}

export type TContent = {
  content: string
  settings: DmtSettings
}

export type TLayout = {
  content: string
  settings: DmtSettings
}
