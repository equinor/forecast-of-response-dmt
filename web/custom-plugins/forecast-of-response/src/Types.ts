export type TRoute = {
  path: string
  content: string
}

// TODO: Move to DMT and import from there
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

export type TContent = {
  content: string
  settings: TSettings
}

export type TLayout = {
  content: string
  settings: TSettings
}
