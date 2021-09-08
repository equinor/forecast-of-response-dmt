import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Button, Card, SingleSelect, TextField } from '@equinor/eds-core-react'
import { TLocation } from '../../Types'
import { useSearch } from '../../hooks/useSearch'
import { Heading } from '../Design/Fonts'

const Div = styled.div``
const LocationButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

const OperationLocationMap = (props: { location: TLocation }): JSX.Element => {
  const { location } = props
  return (
    <Div style={{ width: '300px' }}>
      <Card>
        <Card.Header>
          <Card.HeaderTitle>
            <Heading text="Location on map" variant="h5" />
          </Card.HeaderTitle>
        </Card.Header>
        <Card.Media fullWidth>
          <img
            src="https://images.all-free-download.com/images/graphiclarge/europe_map_vectors_design_588720.jpg"
            alt="map"
          />
        </Card.Media>
      </Card>
    </Div>
  )
}

const SelectLocation = (props: {
  setLocation: Function
  setIsNewLocation: Function
}): JSX.Element => {
  const { setLocation, setIsNewLocation } = props
  const [locations, setLocations] = useState<TLocation[]>([])
  const [
    searchResult,
    isLoadingLocations,
    setSearchResult,
    hasError,
  ] = useSearch('ForecastDS/ForecastOfResponse/Blueprints/Location')

  /**
   * Set locations when the search has completed
   */
  useEffect(() => {
    setLocations(searchResult)
  }, [!isLoadingLocations, searchResult, !hasError])

  return (
    <Div>
      <SingleSelect
        id="operationLocationSelector"
        label="Select location"
        items={locations?.map((loc: TLocation) => `${loc.name} - ${loc.UTM}`)}
        handleSelectedItemChange={(event: any) => {
          // Parse formatted location string to identify actual loc
          const locationFormatted = event.selectedItem
          const [locationName, locationUTM] = locationFormatted.split(' - ')
          setIsNewLocation(false)
          setLocation(
            locations.find(
              (loc: TLocation) =>
                loc.name === locationName && loc.UTM === locationUTM
            )
          )
        }}
      />
    </Div>
  )
}

const CreateLocation = (props: {
  location: TLocation
  setLocation: Function
  setIsNewLocation: Function
}): JSX.Element => {
  const { location, setLocation, setIsNewLocation } = props
  return (
    <Div>
      <TextField
        id="operationLocationName"
        placeholder="Location name"
        label="Location name"
        helperText="Provide the name of the location to create"
        onChange={(event: any) => {
          setIsNewLocation(true)
          setLocation({ ...location, name: event.target.value })
        }}
      />
      <br />
      <TextField
        id="operationLocationUTM"
        placeholder="UTM coordinates"
        label="Location coordinates (UTM)"
        helperText="Provide the UTM coordinates of the location to create"
        onChange={(event: any) => {
          setLocation({ ...location, UTM: event.target.value })
        }}
      />
    </Div>
  )
}

export const SelectOperationLocation = (props: {
  location: TLocation
  setLocation: Function
  setIsNewLocation: Function
}): JSX.Element => {
  const [selectLocationType, setSelectLocationType] = useState<string>('select')
  const { location, setLocation, setIsNewLocation } = props

  return (
    <>
      <Div>
        <Heading text="Enter location" variant="h4" />
        <Div>
          <LocationButtonsGrid>
            <Button
              variant={
                selectLocationType === 'select' ? 'contained' : 'outlined'
              }
              onClick={() => setSelectLocationType('select')}
            >
              Select existing location
            </Button>
            <Button
              variant={selectLocationType === 'add' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectLocationType('add')
              }}
            >
              Enter UTM coordinates
            </Button>
          </LocationButtonsGrid>
        </Div>
        <br />
        {selectLocationType === 'select' ? (
          <SelectLocation
            setLocation={setLocation}
            setIsNewLocation={setIsNewLocation}
          />
        ) : (
          <CreateLocation
            setLocation={setLocation}
            setIsNewLocation={setIsNewLocation}
          />
        )}
      </Div>
      <OperationLocationMap location={location} />
    </>
  )
}
