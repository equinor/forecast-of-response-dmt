import React, { useEffect, useState } from 'react'
import { Divider, SingleSelect } from '@equinor/eds-core-react'
import { OperationsTable } from './OperationsTable'
import { DmtSettings, TOperation } from '../../Types'
import { OperationStatus } from '../../Enums'
import { SearchInput } from '../SearchInput'
import Grid from '../App/Grid'
import { DateRangePicker } from '../DateRangePicker'

// Dummy data
import { dummyOperations } from '../../data/DummyData'

export const Operations = (props: DmtSettings): JSX.Element => {
  const documentHash = document.location.hash.split('#')[1]
  let scopedOperations = dummyOperations.filter((operation) =>
    documentHash
      ? operation.status.toLowerCase().replace(/ /g, '') === documentHash
      : true
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