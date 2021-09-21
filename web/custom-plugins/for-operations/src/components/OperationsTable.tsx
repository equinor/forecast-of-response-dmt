import React, { useEffect, useState, useContext } from 'react'
import { DmtUIPlugin } from '@dmt/core-plugins'
import { Label, Search, SingleSelect, Table } from '@equinor/eds-core-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { DmssAPI, AuthContext } from '@dmt/common'
import { TOperation } from '../Types'
import { CenterWrapper, FlexWrapper, GroupWrapper } from './Wrappers'
import { OperationStatus } from '../Enums'
import { StatusDot } from './Other'

export default (props: DmtUIPlugin): JSX.Element => {
  const { dataSourceId } = props
  const [startDate, setStartDate] = useState(new Date())
  const [operations, setOperations] = useState<TOperation[]>([])
  const local = 'en-GB'
  const { token } = useContext(AuthContext)
  const dmssAPI = new DmssAPI(token)
  // const local = window.navigator.language

  useEffect(() => {
    dmssAPI
      .search(dataSourceId, {
        type: 'ForecastDS/for/Blueprints/Operation',
      })
      .then((result: any) => setOperations(Object.values(result)))
      .catch((err: any) => {
        console.error(err)
      })
  }, [])

  return (
    <>
      <FlexWrapper>
        <div style={{ width: '450px' }}>
          <Search
            placeholder="Search..."
            onChange={() => {}}
            onFocus={() => {}}
            onBlur={() => {}}
          />
        </div>
        <GroupWrapper>
          <Label label="From:" />
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
          />
        </GroupWrapper>
        <GroupWrapper>
          <Label label="To:" />
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
          />
        </GroupWrapper>
        <SingleSelect
          label="Status"
          initialSelectedItem="In progress"
          items={Object.values(OperationStatus)}
        />
      </FlexWrapper>
      <CenterWrapper>
        <Table density="comfortable">
          <Table.Head>
            <Table.Row>
              <Table.Cell>Operation name</Table.Cell>
              <Table.Cell>Date from</Table.Cell>
              <Table.Cell>Date to</Table.Cell>
              <Table.Cell>Location</Table.Cell>
              <Table.Cell>Creator</Table.Cell>
              <Table.Cell>Status</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {operations &&
              operations.map((operation) => (
                <Table.Row key={operation._id}>
                  <Table.Cell>{operation.name}</Table.Cell>
                  <Table.Cell>
                    {new Date(operation.start).toLocaleString(local)}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(operation.end).toLocaleString(local)}
                  </Table.Cell>
                  <Table.Cell>{operation.location.name}</Table.Cell>
                  <Table.Cell>{operation.creator}</Table.Cell>
                  <Table.Cell>
                    {<StatusDot status={operation.status} />}
                    {operation.status}
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </CenterWrapper>
    </>
  )
}
