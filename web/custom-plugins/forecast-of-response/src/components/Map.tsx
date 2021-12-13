import { TLocation } from '../Types'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import Leaflet from 'leaflet'
import React, { useState } from 'react'
import styled from 'styled-components'

export const StyledMapContainer = styled(MapContainer)`
  height: 100%;
  width: 100%;
  border: darkgrey 1px solid;
  z-index: 1;
`

const ClickMarkerColor = '#f68506'

const markerHtmlStyles = `
  background-color: ${ClickMarkerColor};
  width: 22px;
  height: 22px;
  display: block;
  left: -11px;
  top: -5px;
  position: relative;
  border-radius: 10px 10px 0;
  transform: rotate(45deg);
  border: 1px solid black`

const icon = Leaflet.divIcon({
  className: 'mapClickedPin',
  iconAnchor: [0, 24],
  html: `<span style="${markerHtmlStyles}" />`,
})

interface ILocationOnMap {
  location: TLocation
  zoom: number
}

interface IClickableMap {
  location: TLocation | undefined
  zoom: number
  setClickPos: Function
}

function MapEventHandlerComponent({ setClickLocation }: any) {
  const map = useMapEvents({
    click: (location: any) =>
      setClickLocation([location.latlng.lat, location.latlng.lng]),
  })
  return null
}

export const LocationOnMap = ({
  location,
  zoom,
}: ILocationOnMap): JSX.Element => {
  const marker = [location.lat || 60, location.long || 4]
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

export const ClickableMap = ({
  location,
  zoom,
  setClickPos,
}: IClickableMap): JSX.Element => {
  const marker = [location?.lat || 60, location?.long || 4]
  const [clickLocation, setClickLocation] = useState<[number, number]>()

  return (
    <StyledMapContainer center={marker} zoom={zoom} scrollWheelZoom={true}>
      <TileLayer
        attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={marker}></Marker>
      {clickLocation && <Marker position={clickLocation} icon={icon}></Marker>}
      <MapEventHandlerComponent
        setClickLocation={(v: [number, number]) => {
          setClickPos(v)
          setClickLocation(v)
        }}
      />
    </StyledMapContainer>
  )
}
