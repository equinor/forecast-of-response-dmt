import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Divider,
  Progress,
  SingleSelect,
} from '@equinor/eds-core-react'
import styled from 'styled-components'
import { OperationsTable } from './OperationsTable'
import { DmtSettings, TOperation } from '../../Types'
import { OperationStatus } from '../../Enums'
import { SearchInput } from '../SearchInput'
import Grid from '../App/Grid'
import { DateRangePicker } from '../DateRangePicker'
import { useSearch } from '../../hooks/useSearch'

const Div = styled.div`
  padding-top: 16px;
`

export const Operations = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  // @ts-ignore-line
  const operationStatuses = Object.values(OperationStatus)
  const [operations, setOperations] = useState<TOperation[]>([])
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
          // @ts-ignore-line
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
        <SingleSelect label="Status" items={operationStatuses} />
        <Div>
          <Link to={`/${settings.name}/operations/new`}>
            <Button>Create new operation</Button>
          </Link>
        </Div>
      </Grid>
      <Divider variant="medium" />
      {isLoading && <Progress.Linear />}
      <OperationsTable operations={operations} />
    </>
  )
}
