import React, { useEffect, useState } from 'react'
import { TLocation } from '../Types'
import { Button, MultiSelect, SingleSelect } from '@equinor/eds-core-react'
import 'react-datepicker/dist/react-datepicker.css'
import { DocumentAPI } from '@dmt/common'
import { NextButton } from './Other'
import { Select } from '@equinor/eds-core-react/dist/types/components/Select/NativeSelect/Select'

const documentAPI = new DocumentAPI()

export default ({ nextStep }: any): JSX.Element => {
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
      <MultiSelect
        items={locations.map((location) => location.name)}
        label="Choose a model for the operation"
      />
      <NextButton onClick={nextStep} />
    </div>
  )
}
