import { tokens } from '@equinor/eds-tokens'

const { colors } = tokens

export const backgroundColorDefault = colors.ui.background__default.rgba
export const backgroundColorLight = colors.ui.background__light.rgba
export const primary = colors.infographic.primary__moss_green_100.rgba
export const primaryGray = '#f7f7f7'
export const lightGray = '#f6f6f6'

const plotColors = [
  '#0e0909',
  '#3754cb',
  '#18a902',
  '#b953ec',
  '#ad6f6f',
  '#04eec3',
  '#86b7ef',
  '#f37216',
  '#E30909FF',
  '#FFCC00',
  '#6D4C41',
  '#00897B',
  '#b69396',
  '#6A1B9A',
  '#757575',
]

export const getPlotColor = (index: number) => {
  if (index < plotColors.length) {
    return plotColors[index]
  } else {
    return plotColors[0]
  }
}
