import React, { useState } from 'react'
import { Button, TextField } from '@equinor/eds-core-react'
import styled from 'styled-components'
import Grid from '../App/Grid'
import { Heading } from '../Design/Fonts'
import {
  DmtSettings,
  TLocation,
  TOperation,
  TOperationConfig,
} from '../../Types'
import { OperationStatus } from '../../Enums'
import { SelectOperationLocation } from './SelectLocation'
import { SelectOperationConfig } from './SelectConfig'
import { insertDocument } from '../../hooks/insertDocument'

const Div = styled.div``

const SelectOperationName = (props: { setOperationName: any }): JSX.Element => {
  const { setOperationName } = props
  return (
    <>
      <Heading text="Name your operation" variant="h4" />
      <TextField
        id="operationName"
        placeholder="OperationName"
        label="Name"
        helperText="Provide the name of the operation to create"
        onChange={(event: any) => {
          setOperationName(event.target.value)
        }}
      />
    </>
  )
}

const prepareOperationEntity = (
  operationName: string,
  operationConfig: TOperationConfig,
  location: TLocation,
  setOperation: any
) => {
  setOperation({
    _id: 'testInsert', // TODO: Produce a unique ID
    name: operationName,
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    description: '', // TODO: Add description input?
    creator: 'someUser', // TODO: Get user from current session, or automatically in the backend based on token?
    location: location,
    start: new Date().toISOString(), // TODO: Add start/end date selectors
    end: undefined,
    status: OperationStatus.UPCOMING, // TODO: decide based on start attr? allow user to select?
    config: operationConfig,
  })
}

export const OperationsCreate = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const [operation, setOperation] = useState<TOperation>()
  const [operationName, setOperationName] = useState<string>()
  const [operationConfig, setOperationConfig] = useState<TOperationConfig>()
  const [selectedLocation, setSelectedLocation] = useState<TLocation>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasClickedCreate, setHasClickedCreate] = useState<boolean>(false)
  const [response, isUploading, hasError] = insertDocument(
    operation,
    hasClickedCreate
  )

  // TODO: redirect to operation view upon creation
  // TODO: Create new location if not exists (currently overwrites topmost location)
  // TODO: Create new config if not exists (^)
  // TODO: Upon clicking cancel, ask for confirmation and whether it should be saved as a draft
  // TODO: Add "Save as Draft" button?

  return (
    <>
      <Grid>
        <Div>
          <SelectOperationName setOperationName={setOperationName} />
          <br />
          <SelectOperationConfig
            operationConfig={operationConfig}
            setOperationConfig={setOperationConfig}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </Div>
        <SelectOperationLocation
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
      </Grid>
      <Button
        onClick={() => {
          if (operationConfig && !isLoading) {
            prepareOperationEntity(
              operationName,
              operationConfig,
              selectedLocation,
              setOperation
            )
            setHasClickedCreate(true)
          }
        }}
      >
        Create operation
      </Button>
      <Button color="secondary">Cancel</Button>
    </>
  )
}
