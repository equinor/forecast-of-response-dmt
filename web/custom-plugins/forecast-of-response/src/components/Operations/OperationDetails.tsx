import React from 'react'
import { useParams } from 'react-router-dom'
import { DmtUIPlugin } from '@dmt/core-plugins'
import { useDocument } from '@dmt/common'
import { TOperation } from '../Types'
import { Button, Card, Label, Table, Typography } from '@equinor/eds-core-react'
import { StatusDot } from "../Other"
import { OperationStatus } from "../../Enums"
import styled from "styled-components"

export const FlexWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: right;
`

export default (props: DmtUIPlugin): JSX.Element => {
  const { data_source, entity_id } = useParams()
  const [document, isLoading, updateDocument, error] = useDocument(data_source, entity_id)
  const local = 'en-GB'

  if(isLoading) return <>Loading...</>

  if(error) return <>Something went wrong. Sorry...</>

  const operation: TOperation = document

  if(!operation) return <>The document is empty...</>

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
            <Typography variant="h3">Phases in operation</Typography>
          </Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Phase</Table.Cell>
              <Table.Cell>Started</Table.Cell>
              <Table.Cell>Ended</Table.Cell>
              <Table.Cell>Progress</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {operation.phases.length &&
              operation.phases.map((phase, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{phase.name}</Table.Cell>
                  <Table.Cell>
                    {new Date(phase.start).toLocaleString(local)}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(phase.end).toLocaleString(local)}
                  </Table.Cell>
                  <Table.Cell>
                    <FlexWrapper>
                      <StatusDot status={OperationStatus.IN_PROGRESS} />
                      {phase.status}
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
