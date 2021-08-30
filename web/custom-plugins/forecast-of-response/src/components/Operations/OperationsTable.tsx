import React from 'react'
import { DynamicTable } from '../DynamicTable'
import { TOperation } from '../../Types'
import { OperationStatus } from '../../Enums'

const columns: Array<string> = [
  'Operation name',
  'Date from',
  'Date to',
  'Location',
  'Author',
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
  operations.forEach((operation: TOperation) => {
    operation.start = formatDate(operation.start)
    operation.end = formatDate(operation.end)
    // TODO: Handle in a better way
    // For some reason this loops twice, which causes it to map
    // operation.location from a TLocation to the string name,
    // then repeated but on the new string value
    operation.location =
      typeof operation.location === 'string'
        ? operation.location
        : operation.location.name
  })

  return (
    <>
      <DynamicTable columns={columns} rows={operations} />
    </>
  )
}
