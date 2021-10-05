import React, { useContext, useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import styled from "styled-components"
import { CompactCommentView } from "./Comments"
import useSearch from "../hooks/useSearch"
import { Blueprints } from "../Enums"
import { TComment, TOperation } from "../Types"
import { AuthContext, DmssAPI } from '@dmt/common'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const CardWrapper = styled.div`
  border: darkgrey 1px solid;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  box-shadow: darkgrey 0 2px 8px 2px ;
`

const StyledMapContainer = styled(MapContainer)`
  height: 100%;
  width: 100%;
  border-top: darkgrey 1px solid;
`
type CoordinateTuple = [number, number, string]

function calculateUTMCenter(coordinates: CoordinateTuple[]|undefined): [number, number] {
  if(!coordinates) return [57.4, 4.4]  // Default value somewhere in the Northsea
  const xSum = coordinates.reduce((accum, b) => accum + b[0], 0)
  const ySum = coordinates.reduce((accum, b) => accum + b[1], 0)
  return [xSum / coordinates.length, ySum / coordinates.length]
}

const Dashboard = (): JSX.Element => {
  const { token } = useContext(AuthContext)
  const dmssAPI = new DmssAPI(token)
  const [loading, setLoading] = useState<boolean>(true)
  const [coordinates, setCoordinates] = useState<CoordinateTuple[]>()
  const [comments, commentsLoading] = useSearch(Blueprints.Comment)
  const [operations] = useSearch(Blueprints.OPERATION)

  useEffect(()=>{
    setLoading(true)
    if(!operations) return
    Promise.all(operations.map((operation: TOperation): CoordinateTuple =>{
      return dmssAPI
      .getDocumentById({ dataSourceId: "ForecastDS", documentId: operation.location._id})
      .then((document): any => {
        const location = document.document
        return [location.lat, location.long, operation.name]
      })
  })).then((coordinates: CoordinateTuple[])=> {
      setCoordinates(coordinates)
      setLoading(false)
    })
  },[operations])

  if(loading) return <>Loading...</>

  return (
    <div style={{ display: "flex", minHeight: "500px", maxHeight: "900px"}}>
      <CardWrapper style={{ width: "70%" }}>
        <h3 style={{ margin: "5px" }}>Ongoing operations (3)</h3>
        <StyledMapContainer center={calculateUTMCenter(coordinates)} zoom={5} scrollWheelZoom={true}>
          <TileLayer
            attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {coordinates ? coordinates.map((gridTuple: any) => {
            return <Marker key={gridTuple[2]} position={[gridTuple[0], gridTuple[1]]}>
              <Popup>{gridTuple[2]}</Popup>
              <Tooltip>{gridTuple[2]}</Tooltip>
            </Marker>
          }) : null}
        </StyledMapContainer>
      </CardWrapper>
      <CardWrapper style={{ margin: "0 20px", width: "30%", overflow: "auto" }}>
        <h3 style={{ margin: "5px" }}>Comments</h3>
        {commentsLoading ? <>Loading comments...</> :
          <>
            {comments ? comments.map((comment: TComment) => {
              return <CompactCommentView key={comment._id} comment={comment}/>
            }) : <>No comments yet</>}
        </>
        }
      </CardWrapper>
    </div>
  )
}

export default Dashboard
