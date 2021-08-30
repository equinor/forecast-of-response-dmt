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
  name: string
  start: number | string
  end: number | string
  location: string
  creator: string
  status:
    | OperationStatus.DRAFT
    | OperationStatus.UPCOMING
    | OperationStatus.ONGOING
    | OperationStatus.CONCLUDED
}

/**
 * Takes a parameter date and converts into a string representation
 * @param date Any value representing a date, such as a date string or ms since epoch
 */
const formatDate = (date: string | number | undefined): string => {
  if (date === undefined) {
    return '-'
  }
  try {
    return new Date(date).toDateString()
  } catch {
    return `Unable to parse dateString '${date}'`
  }
}

export const OperationsTable = (props: {
  operations: Array<TOperation>
}): JSX.Element => {
  const { operations } = props
  const rows: Array<TOperationRow> = []
  operations?.forEach((operation: TOperation) => {
    let row: TOperationRow = {
      name: operation.name,
      start: formatDate(operation.start),
      end: formatDate(operation.end),
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
