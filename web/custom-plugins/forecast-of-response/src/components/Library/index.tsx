import React from 'react'
import WeatherForecast from './Weather'
import Stask from './Stask'
import { DmtSettings } from '../../Types'

const Library = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const libraryContentType = document.location.hash.split('#')[1]
  if (libraryContentType === 'weather') {
    return (
      <>
        <WeatherForecast settings={settings} />
      </>
    )
  } else if (libraryContentType === 'stask') {
    return (
      <>
        <Stask settings={settings} />
      </>
    )
  }
}

export default Library
