import React from 'react'
import { DmtUIPlugin } from '@dmt/core-plugins'
import { TOperation } from '../Types'
import { FlexWrapper } from './Wrappers'
import { Button, Card, Label, Table, Typography } from '@equinor/eds-core-react'
import 'react-datepicker/dist/react-datepicker.css'
import { OperationStatus } from '../Enums'
import { StatusDot } from './Other'

export default (props: DmtUIPlugin): JSX.Element => {
  const operation: TOperation = props.document
  const local = 'en-GB'

  return (
    <>
      <Card style={{ border: 'solid 1px' }}>
        <Card.Header>
          <Card.HeaderTitle>
            <Typography variant="h5">{operation.name}</Typography>
            <Typography variant="body_short">
              {operation.location.name}
            </Typography>
          </Card.HeaderTitle>
        </Card.Header>
        <FlexWrapper>
          <Label label="Creator:" />
          {operation.creator}
        </FlexWrapper>
        <FlexWrapper>
          <Label label="Start:" />{' '}
          {new Date(operation.start).toLocaleString(local)}
        </FlexWrapper>
        <FlexWrapper>
          <Label label="End:" /> {new Date(operation.end).toLocaleString(local)}
        </FlexWrapper>
        <FlexWrapper>
          <Label label="Status:" />
          <StatusDot status={operation.status} />
          {operation.status}
        </FlexWrapper>
        <FlexWrapper>
          <Label label="Location:" /> {operation.location.name}
          <Label label={`(UTM: ${operation.location.UTM})`} />
        </FlexWrapper>

        <Card.Actions>
          <Button>Cancel</Button>
          <Button>OK</Button>
        </Card.Actions>
        <Table density="comfortable" style={{ width: '100%' }}>
          <Table.Caption>
            <Typography variant="h3">Simulation runs</Typography>
          </Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.Cell>WeatherData</Table.Cell>
              <Table.Cell>Started</Table.Cell>
              <Table.Cell>Ended</Table.Cell>
              <Table.Cell>Progress</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {operation.simulationRuns.length &&
              operation.simulationRuns.map((simulation, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{simulation.weatherDataId}</Table.Cell>
                  <Table.Cell>
                    {new Date(simulation.started).toLocaleString(local)}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(simulation.ended).toLocaleString(local)}
                  </Table.Cell>
                  <Table.Cell>
                    <FlexWrapper>
                      <StatusDot status={OperationStatus.IN_PROGRESS} />
                      {simulation.progress}
                    </FlexWrapper>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </Card>
    </>
  )
}
