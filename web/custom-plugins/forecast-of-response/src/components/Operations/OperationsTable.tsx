import React from 'react'
import { DynamicTable } from '../DynamicTable'
import { TOperation } from '../../Types'
import { OperationStatus } from '../../Enums'

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
  status?:
    | OperationStatus.UPCOMING
    | OperationStatus.IN_PROGRESS
    | OperationStatus.CONCLUDED
}

export const OperationsTable = (props: {
  operations: Array<TOperation>
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
      <DynamicTable columns={columns} rows={rows} />
    </>
  )
}
