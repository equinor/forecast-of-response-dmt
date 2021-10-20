import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Divider, Progress, Tabs } from '@equinor/eds-core-react'
import OperationsTable from '../components/Operations/OperationsTable'
import useSearch from '../hooks/useSearch'
import { DmtSettings, TOperation, TOperationStatus } from '../Types'
import SearchInput from '../components/SearchInput'
import styled from 'styled-components'
import DateRangePicker from '../components/DateRangePicker'
import { NotificationManager } from 'react-notifications'
import Grid from '../components/App/Grid'
import { OperationStatus } from '../Enums'

const GridContainer = styled.div`
  padding-top: 50px;
`

const OperationOverview = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const [allOperations, setAllOperations] = useState<TOperation[]>([])
  const [operationsFromSearch, setOperationsFromSearch] = useState<
    TOperation[]
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<Date[]>()
  const [activeTab, setActiveTab] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const operationStatus: TOperationStatus[] = [
    'All operations',
    OperationStatus.ONGOING,
    OperationStatus.UPCOMING,
    OperationStatus.CONCLUDED,
    'My operations',
  ]
  const [searchResult, isLoadingSearch, hasError] = useSearch(
    'ForecastDS/ForecastOfResponse/Blueprints/Operation'
  )

  const updateTab = (tabIndex: number) => {
    setActiveTab(tabIndex)
    filterOperationsByTab(tabIndex)
  }

  const filterOperationsByTab = (tabIndex: number) => {
    if (operationStatus[tabIndex] === 'All operations') {
      return allOperations
    } else if (operationStatus[tabIndex] === OperationStatus.ONGOING) {
      return allOperations.filter(
        (operation: TOperation) => operation.status === OperationStatus.ONGOING
      )
    } else if (operationStatus[tabIndex] === OperationStatus.UPCOMING) {
      return allOperations.filter(
        (operation: TOperation) => operation.status === OperationStatus.UPCOMING
      )
    } else if (operationStatus[tabIndex] === OperationStatus.CONCLUDED) {
      return allOperations.filter(
        (operation: TOperation) =>
          operation.status === OperationStatus.CONCLUDED
      )
    } else if (operationStatus[tabIndex] === 'My operations') {
      NotificationManager.warning(
        'filtering on my operations is not implemented. Now showing all operations.'
      )
      //todo - implement
      return allOperations
    } else {
      return []
    }
  }

  /**
   * Set all operations when the search has completed
   */
  useEffect(() => {
    if (searchResult) {
      setAllOperations(searchResult)
      setOperationsFromSearch(searchResult)
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
   * Allow filtering of operations by name
   * @param event
   */
  const handleSearch = (event: any) => {
    const nameSearchQuery = event.target.value
    setSearchQuery(nameSearchQuery)
    if (nameSearchQuery) {
      setOperationsFromSearch(
        allOperations.filter((operation: TOperation) =>
          operation.name.toLowerCase().includes(nameSearchQuery)
        )
      )
    } else {
      setOperationsFromSearch(allOperations)
    }
  }

  const getVisibleOperations = () => {
    //intersection of search filter and tab (operation status) filter
    const operationsFilteredByStatus = filterOperationsByTab(activeTab)

    return operationsFromSearch.filter((operation) => {
      return operationsFilteredByStatus.indexOf(operation) !== -1
    })
  }

  return (
    <>
      <Tabs
        activeTab={activeTab}
        onChange={(index: number) => updateTab(index)}
        variant={'minWidth'}
      >
        <Tabs.List>
          {operationStatus.length ? (
            operationStatus.map((state: string) => (
              <Tabs.Tab key={state}>{state}</Tabs.Tab>
            ))
          ) : (
            <div />
          )}
        </Tabs.List>
        <GridContainer>
          <Grid>
            <SearchInput onChange={handleSearch} />
            <DateRangePicker setDateRange={setDateRange} />
            <div style={{ paddingTop: '16px' }}>
              <Link to={`/${settings.name}/operation/new`}>
                <Button>Create new operation</Button>
              </Link>
            </div>
          </Grid>
        </GridContainer>
        <Divider variant="medium" />
        {isLoading && <Progress.Linear />}
        <OperationsTable
          operations={getVisibleOperations()}
          settings={settings}
        />
      </Tabs>
    </>
  )
}

export default OperationOverview
