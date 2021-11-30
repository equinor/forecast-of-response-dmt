import React, { useContext, useState } from 'react'
import { TOperation } from '../Types'
import { getUsername } from '../../utils/auth'
import {
  Accordion,
  Button,
  Card,
  Label,
  Table,
  Typography,
} from '@equinor/eds-core-react'
import { StatusDot } from '../Other'
import styled from 'styled-components'
import { LocationOnMap } from '../Map'
import { TComment, TPhase } from '../../Types'
import { CommentInput, CommentView } from '../Comments'
import { AccessControlList, AuthContext } from '@dmt/common'
import { DEFAULT_DATASOURCE_ID } from '../../const'
import { hasExpertRole } from '../../utils/auth'
import { WaveForecast } from '../WaveForecast'

const FlexWrapper = styled.div`
  display: flex;
  align-items: center;
`

const LocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
  width: 60%;
  max-width: 500px;
  height: 300px;
`

const CommentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 300px;
  max-height: 1000px;
  overflow: auto;
  border: darkgray 1px solid;
  padding: 5px;
`

export default (props: { operation: TOperation }): JSX.Element => {
  const { operation } = props
  const [viewACL, setViewACL] = useState<boolean>(false)
  const [comments, setComments] = useState<TComment[]>(operation.comments)
  const { tokenData } = useContext(AuthContext)

  const updateComments = (newComment: TComment) => {
    setComments([...comments, newComment])
  }

  return (
    <Card style={{ border: 'solid 1px', maxWidth: '1200px' }}>
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="h5">
            {operation.label || operation.name}
          </Typography>
          <Typography variant="body_short">
            {operation.location.name}
          </Typography>
        </Card.HeaderTitle>
      </Card.Header>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FlexWrapper>
            <Label label="Creator:" />
            {operation.creator}
          </FlexWrapper>
          <FlexWrapper>
            <Label label="Start:" />
            {new Date(operation.start).toLocaleString(navigator.language)}
          </FlexWrapper>
          <FlexWrapper>
            <Label label="End:" />
            {new Date(operation.end).toLocaleString(navigator.language)}
          </FlexWrapper>
          <FlexWrapper>
            <Label label="Status:" />
            {operation.status}
            <StatusDot status={operation.status} />
          </FlexWrapper>
          <FlexWrapper>
            <Label label="STask:" />
            {operation.stask?.blob?.name || 'None'}
          </FlexWrapper>
        </div>
        <LocationWrapper>
          <Label label="Location:" /> {operation.location.name} (
          {operation.location.lat},{operation.location.long})
          <LocationOnMap location={operation.location} zoom={7} />
        </LocationWrapper>
      </div>
      <Card.Actions>
        {hasExpertRole(tokenData) && (
          <Button
            onClick={() => {
              setViewACL(!viewACL)
            }}
          >
            {viewACL ? 'Hide access panel' : 'Open access panel'}
          </Button>
        )}
      </Card.Actions>
      {viewACL && (
        <AccessControlList
          documentId={operation._id}
          dataSourceId={DEFAULT_DATASOURCE_ID}
        />
      )}
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
          {operation.phases.length ? (
            operation.phases.map((phase: TPhase, index: number) => (
              <Table.Row key={index}>
                <Table.Cell>{phase.name}</Table.Cell>
                <Table.Cell>
                  {phase.start
                    ? new Date(phase.start).toLocaleString(navigator.language)
                    : 'No start date'}
                </Table.Cell>
                <Table.Cell>
                  {phase.end
                    ? new Date(phase.end).toLocaleString(navigator.language)
                    : 'No end date'}
                </Table.Cell>
                <Table.Cell>
                  <FlexWrapper>
                    {phase.status}
                    <StatusDot status={phase.status} />
                  </FlexWrapper>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell>None</Table.Cell>
              <Table.Cell>None</Table.Cell>
              <Table.Cell>None</Table.Cell>
              <Table.Cell>
                <FlexWrapper>
                  None
                  <StatusDot status={undefined} />
                </FlexWrapper>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Wave forecast</Accordion.Header>
          <Accordion.Panel>
            <WaveForecast />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <h4>Comments</h4>
      <CommentsWrapper>
        {comments.map((comment: TComment, index: number) => (
          <CommentView
            key={index}
            comment={comment}
            leftAdjusted={comment.author !== getUsername(tokenData)}
          />
        ))}
      </CommentsWrapper>
      <CommentInput
        operationId={operation._id}
        handleNewComment={updateComments}
      />
    </Card>
  )
}
