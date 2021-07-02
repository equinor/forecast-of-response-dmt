import React, { useEffect, useState } from 'react'
import { TLocation } from '../Types'
import { SingleSelect } from '@equinor/eds-core-react'
import 'react-datepicker/dist/react-datepicker.css'
import { DocumentAPI } from '@dmt/common'
import { NextButton } from './Other'

const documentAPI = new DocumentAPI()

export default ({ nextStep, onChange }: any): JSX.Element => {
  const [locations, setLocations] = useState<TLocation[]>([])
  useEffect(() => {
    documentAPI
      .search('ForecastDS', {
        type: 'ForecastDS/for/Blueprints/Location',
      })
      .then((result: any) => setLocations(Object.values(result)))
      .catch((err: any) => {
        console.error(err)
      })
  }, [])
  return (
    <div style={{ margin: '5rem' }}>
      <SingleSelect
        items={locations.map((location) => location.name)}
        initialSelectedItem={'Select a location...'}
        label="Choose a location for the operation"
        handleSelectedItemChange={(event: any) => {
          onChange(
            locations.find(
              (location: TLocation) => location.name === event.selectedItem
            )
          )
        }}
      />
      <NextButton onClick={nextStep} />
    </div>
  )
}
