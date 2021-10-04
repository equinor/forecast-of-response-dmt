import React, { useState, useContext } from 'react'
import { Button, Progress, TextField } from '@equinor/eds-core-react'
import { AuthContext } from '@dmt/common'
import Grid from '../App/Grid'
import { Heading } from '../Design/Fonts'
import { DmtSettings, TLocation, TConfig } from '../../Types'
import { OperationStatus } from '../../Enums'
import { SelectOperationLocation } from './SelectLocation'
import { SelectOperationConfig } from './SelectConfig'
import { DateRangePicker } from '../DateRangePicker'
import { insertDocument } from '../../utils/insertDocument'

const SelectOperationName = (props: {
  setOperationName: Function
}): JSX.Element => {
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
 * Create a new entity and return its Id, or retrieve the Id of an existing one
 * @param entity An entity of type TLocation | TConfig
 * @param isNew true if the Location needs to be created in DMSS
 * @param token The access token
 */
const getEntityId = (
  entity: TLocation | TConfig,
  token: string,
  isNew: boolean = false
): PromiseLike<string> => {
  if (isNew) {
    return insertDocument(entity, token)
  } else {
    return new Promise((resolve: any) => {
      resolve(entity._id)
    })
  }
}

/**
 * Create a new Operation entity
 * @param operationName Name of the operation to create
 * @param dateRange An array of dates as [startDate, endDate]
 * @param location A Location entity
 * @param config An OperationConfig entity
 * @param token The access token
 * @param user The username of the authenticated user
 */
const createOperationEntity = (
  operationName: string,
  dateRange: Date[],
  location: TLocation,
  config: TConfig,
  token: string,
  user: string
): Promise<string> => {
  return insertDocument(
    {
      name: operationName,
      type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
      description: '', // TODO: Add description input?
      creator: user,
      location: location,
      start: dateRange && dateRange[0] ? dateRange[0].toISOString() : undefined,
      end: dateRange && dateRange[1] ? dateRange[1].toISOString() : undefined,
      status: OperationStatus.UPCOMING, // TODO: decide based on start attr? allow user to select?
      config: config,
    },
    token
  )
}

const onClickCreate = (
  operationMeta: { name: string; dateRange: Date[] },
  operationLocation: TLocation,
  operationConfig: TConfig,
  isNewEntity: { location: boolean; config: boolean },
  setError: Function,
  token: string,
  user: string
) => {
  const getIds = []
  // Prepare the uncontained entities for the Operation
  operationLocation.type = 'ForecastDS/ForecastOfResponse/Blueprints/Location'
  getIds.push(getEntityId(operationLocation, token, isNewEntity.location))
  if (operationConfig) {
    // Optional
    operationConfig.type =
      'ForecastDS/ForecastOfResponse/Blueprints/Config'
    getIds.push(getEntityId(operationConfig, token, isNewEntity.config))
  }

  Promise.all(getIds)
    .then((documentIds: string[]) => {
      if (isNewEntity.location) operationLocation._id = documentIds[0]
      if (isNewEntity.config) operationConfig._id = documentIds[1]
      createOperationEntity(
        operationMeta.name,
        operationMeta.dateRange,
        operationLocation,
        operationConfig,
        token,
        user
      )
        .then((documentId) => {
          // todo redirect to operation view
          console.log(`New operation ${documentId}`)
        })
        .catch((err: any) => {
          if (err.json) {
            err.json()
              .then((jsonErr: any) => {
                setError(jsonErr.message)
                console.error(jsonErr)
              })
              .catch((err: any) => {
                console.log(err)
              })
          } else {
            setError('An error occurred')
          }
        })
    })
    .catch((err: any) => {
      console.error(err)
      setError('An error occurred') // TODO: Improve
    })
}

export const OperationCreate = (props: DmtSettings): JSX.Element => {
  const { settings } = props
  const { userData, token } = useContext(AuthContext)
  const user = userData.loggedIn ? userData.name : 'Anonymous'
  const [error, setError] = useState<string>()
  const [operationMeta, setOperationMeta] = useState<{
    name: string
    dateRange: Date[]
  }>()
  const [isNewEntity, setIsNewEntity] = useState<{
    location: boolean
    config: boolean
  }>({ location: false, config: false })
  const [operationConfig, setOperationConfig] = useState<TConfig>()
  const [operationLocation, setOperationLocation] = useState<TLocation>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // TODO: redirect to operation view upon creation
  // TODO: Upon clicking cancel, ask for confirmation and whether it should be saved as a draft
  // TODO: Add "Save as Draft" button?

  return (
    <>
      {isLoading && <Progress.Linear />}
      <Grid>
        <div>
          <SelectOperationName
            setOperationName={(operationName: string) => {
              setOperationMeta({ ...operationMeta, name: operationName })
            }}
          />
          <br />
          <Heading text="Select start and end date" variant="h4" />
          <DateRangePicker
            setDateRange={(dateRange: Date[]) => {
              setOperationMeta({ ...operationMeta, dateRange: dateRange })
            }}
          />
          <br />
          <SelectOperationConfig
            setOperationConfig={setOperationConfig}
            setIsNewConfig={(isNew: boolean) => {
              setIsNewEntity({ ...isNewEntity, config: isNew })
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
        <SelectOperationLocation
          location={operationLocation}
          setLocation={setOperationLocation}
          setIsNewLocation={(isNew: boolean) => {
            setIsNewEntity({ ...isNewEntity, location: isNew })
          }}
        />
      </Grid>
      <Button
        onClick={() =>
          onClickCreate(
            operationMeta,
            operationLocation,
            operationConfig,
            isNewEntity,
            setError,
            token,
            user
          )
        }
      >
        Create operation
      </Button>
      <Button color="secondary">Cancel</Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  )
}
