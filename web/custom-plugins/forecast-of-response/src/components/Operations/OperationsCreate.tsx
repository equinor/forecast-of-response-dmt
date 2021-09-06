import React, { useState } from 'react'
import { Button, TextField } from '@equinor/eds-core-react'
import styled from 'styled-components'
import Grid from '../App/Grid'
import { Heading } from '../Design/Fonts'
import { DmtSettings, TLocation, TOperationConfig } from '../../Types'
import { OperationStatus } from '../../Enums'
import { SelectOperationLocation } from './SelectLocation'
import { SelectOperationConfig } from './SelectConfig'
import { DateRangePicker } from '../DateRangePicker'
import { insertDocument } from '../../utils/insertDocument'

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

/**
 * Create a new Location or retrieve the Id of an existing one
 * @param locationEntity A Location entity
 * @param isNew true if the Location needs to be created in DMSS
 */
const createOrGetLocationEntity = (
  locationEntity: TLocation,
  isNew: boolean = false
): PromiseLike<string> => {
  if (isNew) {
    return insertDocument(locationEntity)
  } else {
    return new Promise((resolve: any) => {
      resolve(locationEntity._id)
    })
  }
}

/**
 * Create a new OperationConfig or retrieve the Id of an existing one
 * @param configEntity An OperationConfig entity
 * @param isNew true if the OperationConfig needs to be created in DMSS
 */
const createOrGetOperationConfigEntity = (
  configEntity: TOperationConfig,
  isNew: boolean = false
): PromiseLike<string> => {
  if (isNew) {
    return insertDocument(configEntity)
  } else {
    return new Promise((resolve: any) => {
      resolve(configEntity._id)
    })
  }
}

/**
 * Create a new Operation entity
 * @param operationName Name of the operation to create
 * @param dateRange An array of dates as [startDate, endDate]
 * @param operationConfig An OperationConfig entity
 * @param location A Location entity
 */
const createOperationEntity = (
  operationName: string,
  dateRange: Date[],
  operationConfig: TOperationConfig,
  location: TLocation
): PromiseLike<string> => {
  return insertDocument({
    name: operationName,
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    description: '', // TODO: Add description input?
    creator: 'someUser', // TODO: Get user from current session, or automatically in the backend based on token?
    location: location,
    start: dateRange && dateRange[0] ? dateRange[0].toISOString() : undefined,
    end: dateRange && dateRange[1] ? dateRange[1].toISOString() : undefined,
    status: OperationStatus.UPCOMING, // TODO: decide based on start attr? allow user to select?
    config: operationConfig,
  })
}

export const OperationsCreate = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const [error, setError] = useState<string>()
  const [operationMeta, setOperationMeta] = useState<{
    name: string
    dateRange: Date[]
  }>()
  const [operationConfig, setOperationConfig] = useState<TOperationConfig>()
  const [operationLocation, setOperationLocation] = useState<TLocation>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // TODO: redirect to operation view upon creation
  // TODO: Create new location if not exists (currently overwrites topmost location)
  // TODO: Create new config if not exists (^)
  // TODO: Upon clicking cancel, ask for confirmation and whether it should be saved as a draft
  // TODO: Add "Save as Draft" button?

  return (
    <>
      <Grid>
        <Div>
          <SelectOperationName
            setOperationName={(operationName: string) => {
              // @ts-ignore-line
              setOperationMeta(
                Object.assign({}, operationMeta, { name: operationName })
              )
            }}
          />
          <br />
          <Heading text="Select start and end date" variant="h4" />
          <DateRangePicker
            setDateRange={(dateRange: Date[]) => {
              // @ts-ignore-line
              setOperationMeta(
                Object.assign({}, operationMeta, { dateRange: dateRange })
              )
            }}
          />
          <br />
          <SelectOperationConfig
            setOperationConfig={setOperationConfig}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </Div>
        <SelectOperationLocation
          location={operationLocation}
          setLocation={setOperationLocation}
        />
      </Grid>
      <Button
        onClick={() => {
          if (
            operationMeta?.name &&
            operationLocation?.name &&
            operationConfig?.name &&
            !isLoading
          ) {
            // Prepare the uncontained entities for the Operation
            const locationEntity: TLocation = {
              _id: operationLocation._id ? operationLocation._id : undefined,
              name: operationLocation.name,
              type: 'ForecastDS/ForecastOfResponse/Blueprints/Location',
              UTM: operationLocation.UTM,
            }
            const configEntity: TOperationConfig = {
              _id: operationConfig._id ? operationConfig._id : undefined,
              name: operationConfig.name,
              type: 'ForecastDS/ForecastOfResponse/Blueprints/OperationConfig',
            }
            Promise.all([
              createOrGetLocationEntity(
                locationEntity,
                !!operationLocation.isNew
              ),
              createOrGetOperationConfigEntity(
                configEntity,
                !!operationConfig.isNew
              ),
            ])
              .then((documentIds: string[]) => {
                delete locationEntity.UTM
                locationEntity._id = documentIds[0]
                configEntity._id = documentIds[1]
                createOperationEntity(
                  operationMeta.name,
                  operationMeta.dateRange,
                  configEntity,
                  locationEntity
                )
                  .then((documentId) => {
                    console.log(`New operation ${documentId}`)
                  })
                  .catch((err: any) => {
                    console.log(err)
                  })
              })
              .catch((err: any) => {
                console.error(err)
              })
          } else {
            const missing = []
            if (!operationMeta?.name) {
              missing.push('Operation name')
            }
            if (!operationLocation?._id) {
              missing.push('Location')
            }
            if (!operationConfig?._id) {
              missing.push('Configuration')
            }
            setError(
              `Missing required ${
                missing.length > 1 ? 'fields' : 'field'
              } ${missing.join(', ')}`
            )
          }
        }}
      >
        Create operation
      </Button>
      <Button color="secondary">Cancel</Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  )
}
