import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, SingleSelect, TextField } from '@equinor/eds-core-react'
import { TLocation } from '../../Types'
import useSearch from '../../hooks/useSearch'
import { Heading } from '../Design/Fonts'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const LocationButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

const SelectLocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 30px;
`

const StyledTextField = styled(TextField)`
  margin: 10px 0;
`

const OperationLocationMap = (props: { location: TLocation }): JSX.Element => {
  const { location } = props
  const marker = [location.lat | 60, location.long | 4]
  return (
    <MapContainer center={marker} zoom={5} scrollWheelZoom={true}>
      <TileLayer
        attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={marker}></Marker>
    </MapContainer>
  )
}

const SelectLocation = (props: {
  setLocation: Function
  setIsNewLocation: Function
}): JSX.Element => {
  const { setLocation, setIsNewLocation } = props
  const [locations, setLocations] = useState<TLocation[]>([])
  const [searchResult] = useSearch(
    'ForecastDS/ForecastOfResponse/Blueprints/Location'
  )

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
        <Heading text="Enter location" variant="h4" />
        <div>
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
      <OperationLocationMap location={location} />
    </>
  )
}

export default SelectOperationLocation
