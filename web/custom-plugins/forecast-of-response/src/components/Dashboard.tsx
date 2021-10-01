import React from 'react'
import { DmtSettings } from '../Types'
import AccessControlList from "./AccessControl/AccessControlList"

export const Dashboard = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  return (
    <>
      <i>My dashboard</i>
      <AccessControlList/>
    </>
  )
}
