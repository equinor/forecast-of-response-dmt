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
  max-width: 300px;
`

const SelectLocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
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
      setLocation(searchResult.length && searchResult[0])
    }
  }, [searchResult, locations])

  return (
    <div style={{ maxWidth: '400px', paddingTop: '10px' }}>
      <SingleSelect
        id="operationLocationSelector"
        label="Select location"
        value={
          locations.length &&
          `${locations[0].name} - ${locations[0].lat},${locations[0].long}`
        }
        items={locations?.map(
          (loc: TLocation) => `${loc.name} - ${loc.lat},${loc.long}`
        )}
        handleSelectedItemChange={(event: any) => {
          // Parse formatted location string to identify actual location. Show error in console if selectedItem is invalid
          if (!event.selectedItem) {
            console.error('Error: a location must be selected')
          } else {
            const [locationName] = event.selectedItem.split(' - ')
            setIsNewLocation(false)
            setLocation(
              locations.find((loc: TLocation) => loc.name === locationName)
            )
          }
        }}
      />
    </div>
  )
}

const SelectOperationLocation = (props: {
  location: TLocation | undefined
  setLocation: Function
  setIsNewLocation: Function
  mapClickPos: [number, number] | undefined
}): JSX.Element => {
  const [selectLocationType, setSelectLocationType] = useState<string>('select')
  const { location, setLocation, setIsNewLocation, mapClickPos } = props

  useEffect(() => {
    if (mapClickPos !== undefined) {
      setLocation({
        ...location,
        lat: mapClickPos[0],
        long: mapClickPos[1],
      })
    }
  }, [mapClickPos])
  return (
    <SelectLocationWrapper>
      <Heading text="Location" variant="h4" />
      <LocationButtonsGrid>
        <Button
          variant={selectLocationType === 'select' ? 'contained' : 'outlined'}
          onClick={() => {
            setSelectLocationType('select')
            setIsNewLocation(false)
          }}
        >
          Select existing
        </Button>
        <Button
          variant={selectLocationType === 'add' ? 'contained' : 'outlined'}
          onClick={() => {
            setSelectLocationType('add')
            setIsNewLocation(true)
            setLocation({
              lat: location?.lat || 0,
              long: location?.long || 0,
              name: '',
            })
          }}
        >
          New
        </Button>
      </LocationButtonsGrid>

      {selectLocationType === 'select' ? (
        <SelectLocation
          setLocation={setLocation}
          setIsNewLocation={setIsNewLocation}
        />
      ) : (
        <div style={{ paddingTop: '15px' }}>
          <TextField
            id="operationLocationName"
            placeholder="Location name"
            label="Location name"
            onChange={(event: any) => {
              setLocation({ ...location, name: event.target.value })
            }}
          />
          <TextField
            id="lat-input"
            label="Latitude"
            type="number"
            onChange={(event: any) =>
              setLocation({ ...location, lat: event.target.value })
            }
            value={location?.lat || ''}
          />
          <TextField
            id="long-input"
            label="Longitude"
            type="number"
            onChange={(event: any) => {
              setLocation({
                ...location,
                long: parseFloat(event.target.value),
              })
            }}
            value={location?.long || ''}
          />
          <div style={{ width: '100%  ', marginTop: '10px' }}>
            (You can also click on the map to change location)
          </div>
        </div>
      )}
    </SelectLocationWrapper>
  )
}

export default SelectOperationLocation
