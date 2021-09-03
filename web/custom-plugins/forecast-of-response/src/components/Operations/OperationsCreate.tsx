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

const createOperationEntity = (operation: TOperation): string => {
  // handle DMSS creation
  console.log(operation)
  return "Great success. Or not. I didn't check."
}

const prepareOperationEntity = (
  operationName: string,
  operationConfig: TOperationConfig,
  location: TLocation
): string => {
  const operation: TOperation = {
    _id: 'testInsert',
    name: operationName,
    type: '/Blueprints/Operation',
    description: '', // TODO: Add description input?
    creator: 'someUser', // TODO: Get user from current session, or automatically in the backend based on token?
    location: location,
    start: new Date().toISOString(),
    end: undefined,
    status: OperationStatus.UPCOMING, // TODO: decide based on start attr? allow user to select?
    config: operationConfig,
  }

  return createOperationEntity(operation)
}

export const OperationsCreate = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const [operationName, setOperationName] = useState<string>()
  const [operationConfig, setOperationConfig] = useState<TOperationConfig>()
  const [selectedLocation, setSelectedLocation] = useState<TLocation>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
              selectedLocation
            )
          }
        }}
      >
        Create operation
      </Button>
      <Button color="secondary">Cancel</Button>
    </>
  )
  // TODO: Upon clicking cancel, ask for confirmation and whether it should be saved as a draft
  // TODO: Add "Save as Draft" button?
}
