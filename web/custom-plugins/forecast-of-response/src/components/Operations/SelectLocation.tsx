import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, SingleSelect, TextField } from '@equinor/eds-core-react'
import { TLocation } from '../../Types'
import useSearch from '../../hooks/useSearch'
import { Heading } from '../Design/Fonts'
import { Blueprints } from '../../Enums'

const LocationButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

const SelectLocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledTextField = styled(TextField)`
  margin: 10px 0;
`

const SelectLocation = (props: {
  setLocation: Function
  setIsNewLocation: Function
}): JSX.Element => {
  const { setLocation, setIsNewLocation } = props
  const [locations, setLocations] = useState<TLocation[]>([])
  const [searchResult] = useSearch(Blueprints.LOCATION)

  /**
   * Set locations when the search has completed
   */
  useEffect(() => {
    if (searchResult) {
      setLocations(searchResult)
    }
  }, [searchResult, locations])

  return (
    <div>
      <SingleSelect
        id="operationLocationSelector"
        label="Select location"
        items={locations?.map(
          (loc: TLocation) => `${loc.name} - ${loc.lat},${loc.long}`
        )}
        handleSelectedItemChange={(event: any) => {
          // Parse formatted location string to identify actual loc
          const [locationName] = event.selectedItem.split(' - ')
          setIsNewLocation(false)
          setLocation(
            locations.find((loc: TLocation) => loc.name === locationName)
          )
        }}
      />
    </div>
  )
}

const CreateLocation = (props: {
  location: TLocation
  setLocation: Function
  setIsNewLocation: Function
}): JSX.Element => {
  const { location, setLocation, setIsNewLocation } = props
  return (
    <>
      <StyledTextField
        id="operationLocationName"
        placeholder="Location name"
        label="Location name"
        onChange={(event: any) => {
          setIsNewLocation(true)
          setLocation({ ...location, name: event.target.value })
        }}
      />
      <StyledTextField
        id="operationLocationUTM"
        placeholder="Latitude (xx.xxx)"
        label="Latitude"
        onChange={(event: any) => {
          setLocation({ ...location, lat: parseFloat(event.target.value) })
        }}
      />
      <StyledTextField
        id="operationLocationUTM"
        placeholder="Longitude (xx.xxx)"
        label="Longitude"
        onChange={(event: any) => {
          setLocation({ ...location, long: parseFloat(event.target.value) })
        }}
      />
    </>
  )
}

const SelectOperationLocation = (props: {
  location: TLocation
  setLocation: Function
  setIsNewLocation: Function
}): JSX.Element => {
  const [selectLocationType, setSelectLocationType] = useState<string>('select')
  const { location, setLocation, setIsNewLocation } = props

  return (
    <>
      <SelectLocationWrapper>
        <Heading text="Location" variant="h4" />
        <div>
          <LocationButtonsGrid>
            <Button
              variant={
                selectLocationType === 'select' ? 'contained' : 'outlined'
              }
              onClick={() => setSelectLocationType('select')}
            >
              Select existing
            </Button>
            <Button
              variant={selectLocationType === 'add' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectLocationType('add')
              }}
            >
              New
            </Button>
          </LocationButtonsGrid>
        </div>
        <br />
        {selectLocationType === 'select' ? (
          <SelectLocation
            setLocation={setLocation}
            setIsNewLocation={setIsNewLocation}
          />
        ) : (
          <CreateLocation
            location={location}
            setLocation={setLocation}
            setIsNewLocation={setIsNewLocation}
          />
        )}
      </SelectLocationWrapper>
    </>
  )
}

export default SelectOperationLocation
