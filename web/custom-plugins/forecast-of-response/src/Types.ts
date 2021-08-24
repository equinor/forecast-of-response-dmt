export type TRoute = {
  path: string
  content: string
}

export type TSettings = {
  name: string
  label: string
  tabIndex: number
  hidden: boolean
  visibleDataSources: any
  type: string
  description: string
  packages: any
  models: any
  actions: any
  file_loc: string
  data_source_aliases: any
}

export type TApp = {
  applications: any
  settings: TSettings
}

export type TAppHeader = {
  appName: string
}

export type TAppMenu = {
  appRootPath: string
}

export type TAppContent = {
  content: string
}

export type TMainLayout = {
  content: string
  settings: TSettings
}
