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
  const Map = () => (
    <Card.Media fullWidth>
      <img
        src="https://images.all-free-download.com/images/graphiclarge/europe_map_vectors_design_588720.jpg"
        alt="map"
      />
    </Card.Media>
  )
  return (
    <Div style={{ width: '300px' }}>
      <Card>
        <Card.Header>
          <Card.HeaderTitle>
            <Heading text="Location on map" variant="h5" />
          </Card.HeaderTitle>
        </Card.Header>
        <Map />
      </Card>
    </Div>
  )
}

export const SelectOperationLocation = (props: {
  location: TLocation
  setLocation: any
  setIsNewLocation: any
}): JSX.Element => {
  const [locations, setLocations] = useState<TLocation[]>([])
  const [
    searchResult,
    isLoadingLocations,
    setSearchResult,
    hasError,
  ] = useSearch('ForecastDS/ForecastOfResponse/Blueprints/Location')
  const [selectLocationType, setSelectLocationType] = useState<string>('select')
  const { location, setLocation, setIsNewLocation } = props

  /**
   * Set locations when the search has completed
   */
  useEffect(() => {
    setLocations(searchResult)
  }, [!isLoadingLocations, searchResult, !hasError])

  return (
    <>
      <Div id="opLoc">
        <Heading text="Enter location" variant="h4" />
        <Div id="opLoc-type">
          <LocationButtonsGrid>
            <Button
              variant={
                selectLocationType === 'select' ? 'contained' : 'outlined'
              }
              onClick={() => {
                setSelectLocationType('select')
              }}
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
        {(selectLocationType === 'select' && (
          <Div id="opLoc-selector">
            <SingleSelect
              id="operationLocationSelector"
              label="Select location"
              items={locations?.map((loc: TLocation) => {
                return `${loc.name} - ${loc.UTM}`
              })}
              handleSelectedItemChange={(event: any) => {
                // Parse formatted location string to identify actual loc
                const locationFormatted = event.selectedItem
                const [locationName, locationUTM] = locationFormatted.split(
                  ' - '
                )
                const matches = locations?.filter(
                  (loc: TLocation) =>
                    loc.name === locationName && loc.UTM === locationUTM
                )
                setLocation(matches[0])
              }}
            />
          </Div>
        )) ||
          (selectLocationType === 'add' && (
            <Div id="opLoc-creator">
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
          ))}
      </Div>
      <OperationLocationMap location={location} />
    </>
  )
}
