import React, { useEffect, useState } from 'react'
import { Divider, SingleSelect } from '@equinor/eds-core-react'
import { OperationsTable } from './OperationsTable'
import { DmtSettings, TOperation } from '../../Types'
import { OperationStatus } from '../../Enums'
import { SearchInput } from '../SearchInput'
import Grid from '../App/Grid'
import { DateRangePicker } from '../DateRangePicker'

// Dummy data
import { dummyOperations } from '../../DummyData'
const columns: Array<string> = [
  'Operation name',
  'Date from',
  'Date to',
  'Location',
  'Author',
  'Status',
]
const statuses: Array<string> = ['In progress', 'Completed', 'Draft']

const convertTStoDate = (timestamp: any): string => {
  if (timestamp == undefined) {
    return '-'
  }
  try {
    return new Date(timestamp).toDateString()
  } catch {
    return `Un-parseable timestamp ${timestamp}`
  }
}

export const Operations = (props: DmtSettings): JSX.Element => {
  const documentHash = document.location.hash.split('#')[1]
  let scopedOperations = dummyOperations.filter((operation) =>
    documentHash ? operation.status.toLowerCase() === documentHash : true
  )
  const [operations, setOperations] = useState<TOperation>(scopedOperations)

  /**
   * Set operations when the document hash changes
   */
  useEffect(() => {
    setOperations(
      scopedOperations.filter((operation) =>
        documentHash ? operation.status.toLowerCase() === documentHash : true
      )
    )
  }, [documentHash])

  /**
   * Allow filtering of operations by name
   * @param event
   */
  const handleSearch = (event: any) => {
    const query = event.target.value
    if (query) {
      setOperations(
        scopedOperations.filter((operation) =>
          operation.name.toLowerCase().includes(event.target.value)
        )
      )
    } else {
      setOperations(scopedOperations)
    }
  }

  operations.forEach((operation: TOperation) => {
    operation.startDate = convertTStoDate(operation.startDate)
    operation.endDate = convertTStoDate(operation.endDate)
  })

  return (
    <>
      <Grid>
        <SearchInput onChange={handleSearch} />
        <DateRangePicker />
        <SingleSelect label="Status" items={Object.values(OperationStatus)} />
      </Grid>
      <Divider variant="medium" />
      <OperationsTable operations={operations} />
    </>
  )
}
