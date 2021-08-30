import React, { useEffect, useState } from 'react'
import { Divider, SingleSelect } from '@equinor/eds-core-react'
import { OperationsTable } from './OperationsTable'
import { DmtSettings, TOperation } from '../../Types'
import { OperationStatus } from '../../Enums'
import { SearchInput } from '../SearchInput'
import Grid from '../App/Grid'
import { DateRangePicker } from '../DateRangePicker'
import { useSearch } from '../../hooks/useSearch'

export const Operations = (props: DmtSettings): JSX.Element => {
  const [operations, setOperations] = useState<Array<TOperation>>([])
  const documentHash = document.location.hash.split('#')[1]
  const [searchResult, isLoading, setSearchResult, hasError] = useSearch(
    'ForecastDS/ForecastOfResponse/Blueprints/Operation'
  )
  const scopedOperations = searchResult?.filter((operation: TOperation) =>
    documentHash
      ? operation.status.toLowerCase().replace(/ /g, '') === documentHash
      : true
  )

  /**
   * Set operations when the search has completed
   */
  useEffect(() => {
    setOperations(searchResult)
  }, [!isLoading, searchResult, !hasError])

  /**
   * Set operations when the document hash changes
   */
  useEffect(() => {
    setOperations(
      searchResult?.filter((operation: TOperation) =>
        documentHash
          ? operation.status.toLowerCase().replace(/ /g, '') === documentHash
          : true
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
        scopedOperations.filter((operation: TOperation) =>
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
