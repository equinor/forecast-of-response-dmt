import React from 'react'
import { DmtSettings } from '../../Types'

export const Operations = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const operationsListType = document.location.hash.split('#')[1]
  const operationsListTypes = ['drafts', 'ongoing', 'completed']
  const operations = {
    drafts: ['draft #1', 'njord'],
    ongoing: ['troll', 'current op'],
    completed: ['old op', 'aged cheese'],
  }
  return (
    <>
      <ul>
        {operations[operationsListType].map((operationName: string) => {
          return <li>{operationName}</li>
        })}
      </ul>
    </>
  )
}
