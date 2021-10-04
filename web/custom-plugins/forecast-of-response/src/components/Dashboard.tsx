import React from 'react'
import { DmtSettings } from '../Types'
import AccessControlList from "./AccessControl/AccessControlList"

const Dashboard = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  return (
    <>
      <i>My dashboard</i>
      <AccessControlList/>
    </>
  )
}

export default Dashboard
