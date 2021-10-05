import { TLocation } from '../Types'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import React from 'react'
import styled from 'styled-components'

export const StyledMapContainer = styled(MapContainer)`
  height: 100%;
  width: 100%;
  border: darkgrey 1px solid;
`

interface ILocationOnMap {
  location: TLocation
  zoom: number
}

export const LocationOnMap = ({
  location,
  zoom,
}: ILocationOnMap): JSX.Element => {
  const marker = [location.lat | 60, location.long | 4]
  return (
    <StyledMapContainer center={marker} zoom={zoom} scrollWheelZoom={true}>
      <TileLayer
        attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={marker}></Marker>
    </StyledMapContainer>
  )
}
