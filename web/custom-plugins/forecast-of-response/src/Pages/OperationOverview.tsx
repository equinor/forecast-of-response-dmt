import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Divider,
  Progress,
  SingleSelect,
} from '@equinor/eds-core-react'
import OperationsTable from '../components/Operations/OperationsTable'
import useSearch from '../hooks/useSearch'
import { DmtSettings, TOperation } from '../Types'
import SearchInput from '../components/SearchInput'
import DateRangePicker from '../components/DateRangePicker'
import Grid from '../components/App/Grid'
import { OperationStatus } from '../Enums'

const OperationOverview = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const [operations, setOperations] = useState<TOperation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<Date[]>()
  const documentHash = document.location.hash.split('#')[1]
  const [searchResult, isLoadingSearch, hasError] = useSearch(
    'ForecastDS/ForecastOfResponse/Blueprints/Operation'
  )
  const scopedOperations = searchResult?.filter((operation: TOperation) =>
    documentHash
      ? operation.status &&
        operation.status.toLowerCase().replace(/ /g, '') === documentHash
      : true
  )

  /**
   * Set operations when the search has completed
   */
  useEffect(() => {
    if (searchResult) {
      setOperations(searchResult)
      setIsLoading(false)
    }
  }, [searchResult])

  useEffect(() => {
    if (isLoadingSearch) {
      setIsLoading(isLoadingSearch)
    }
  }, [isLoadingSearch])

  useEffect(() => {
    if (hasError) {
      setIsLoading(false)
    }
  }, [hasError])

  /**
   * Set operations when the document hash changes
   */
  useEffect(() => {
    setOperations(
      searchResult?.filter((operation: TOperation) =>
        documentHash
          ? operation.status &&
            operation.status.toLowerCase().replace(/ /g, '') === documentHash
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
        <DateRangePicker setDateRange={setDateRange} />
        <SingleSelect label="Status" items={Object.values(OperationStatus)} />
        <div style={{ paddingTop: '16px' }}>
          <Link to={`/${settings.name}/operation/new`}>
            <Button>Create new operation</Button>
          </Link>
        </div>
      </Grid>
      <Divider variant="medium" />
      {isLoading && <Progress.Linear />}
      <OperationsTable operations={operations} settings={settings} />
    </>
  )
}

export default OperationOverview
