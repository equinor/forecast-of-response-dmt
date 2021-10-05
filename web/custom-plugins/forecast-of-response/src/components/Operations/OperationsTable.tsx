import React from 'react'
import DynamicTable from '../DynamicTable'
import { DmtSettings, TOperation } from '../../Types'
import { OperationStatus } from '../../Enums'
import { DEFAULT_DATASOURCE_ID } from '../../const'

const columns: Array<string> = [
  'Operation name',
  'Date from',
  'Date to',
  'Location',
  'Creator',
  'Status',
]

type TOperationRow = {
  _id?: string
  name: string
  start: Date | string
  end: Date | string
  location: string
  creator: string
  status?: OperationStatus
}

const onRowClicked = (event: any) => {
  const documentId = event.target.parentElement.accessKey
  document.location = `${document.location.pathname}/${DEFAULT_DATASOURCE_ID}/${documentId}`
}

const OperationsTable = (props: {
  operations: Array<TOperation>
  settings: DmtSettings
}): JSX.Element => {
  const { operations } = props
  const rows: Array<TOperationRow> = []
  operations?.forEach((operation: TOperation) => {
    let row: TOperationRow = {
      _id: operation._id,
      name: operation.name,
      start: operation.start || '-',
      end: operation.end || '-',
      location: operation.location.name,
      creator: operation.creator,
      status: operation.status,
    }
    rows.push(row)
  })

  return (
    <>
      <DynamicTable columns={columns} rows={rows} onRowClicked={onRowClicked}/>
    </>
  )
}

export default OperationsTable
