import React, { useContext, useState } from 'react'
import { Button, Progress, TextField } from '@equinor/eds-core-react'
import { AuthContext } from '@dmt/common'
import { Blueprints, OperationStatus } from '../Enums'
import { addToPath } from '../utils/insertDocument'
import { DEFAULT_DATASOURCE_ID } from '../const'
import DateRangePicker from '../components/DateRangePicker'
import { Heading } from '../components/Design/Fonts'
import { TConfig, TLocation } from '../Types'
import SelectOperationConfig from '../components/Operations/SelectConfig'
import SelectOperationLocation from '../components/Operations/SelectLocation'
import { LocationOnMap } from '../components/Map'
import SelectSTask from '../components/Operations/SelectSTask'
import styled from 'styled-components'

const CreateOperationWrapper = styled.div`
  min-width: min-content;
  max-width: 900px;
  display: flex;
`

const MapWrapper = styled.div`
  display: flex;
  margin: 0 50px;
  width: 60%;
  max-width: 500px;
  height: 300px;
`

const SelectOperationName = (props: {
  setOperationName: Function
}): JSX.Element => {
  const { setOperationName } = props
  return (
    <>
      <Heading text="Name" variant="h4" />
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
    return addToPath(entity, token)
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
  stask: File,
  dateRange: Date[],
  location: TLocation,
  config: TConfig,
  token: string,
  user: string
): Promise<string> => {
  return addToPath(
    {
      name: operationName,
      type: Blueprints.OPERATION,
      stask: {
        type: Blueprints.STASK,
        name: stask.name,
        blob: {
          name: stask.name,
          type: 'system/SIMOS/Blob',
        },
      },
      creator: user,
      location: location,
      start: dateRange && dateRange[0] ? dateRange[0].toISOString() : undefined,
      end: dateRange && dateRange[1] ? dateRange[1].toISOString() : undefined,
      status: OperationStatus.UPCOMING, // TODO: decide based on start attr? allow user to select?
      config: config,
    },
    token,
    [stask]
  )
}

const onClickCreate = (
  operationMeta: { name: string; dateRange: Date[] },
  operationLocation: TLocation,
  operationConfig: TConfig,
  stask: Blob,
  isNewEntity: { location: boolean; config: boolean },
  setError: Function,
  token: string,
  user: string
) => {
  const getIds = []
  // Prepare the uncontained entities for the Operation
  operationLocation.type = Blueprints.LOCATION
  getIds.push(getEntityId(operationLocation, token, isNewEntity.location))
  if (operationConfig) {
    // Optional
    operationConfig.type = 'ForecastDS/ForecastOfResponse/Blueprints/Config'
    getIds.push(getEntityId(operationConfig, token, isNewEntity.config))
  }

  Promise.all(getIds)
    .then((documentIds: string[]) => {
      if (isNewEntity.location) operationLocation._id = documentIds[0]
      if (isNewEntity.config) operationConfig._id = documentIds[1]
      createOperationEntity(
        operationMeta.name,
        stask,
        operationMeta.dateRange,
        operationLocation,
        operationConfig,
        token,
        user
      )
        .then((documentId) => {
          // todo redirect to operation view
          console.log(`New operation ${documentId}`)
          const newLocation = document.location.pathname.replace(
            'new',
            `${DEFAULT_DATASOURCE_ID}/${documentId}`
          )
          document.location = newLocation
        })
        .catch((err: any) => {
          if (err.json) {
            err
              .json()
              .then((jsonErr: any) => {
                setError(jsonErr.message)
                console.error(jsonErr)
              })
              .catch((nestedErr: any) => {
                console.log(nestedErr)
              })
          } else {
            console.error(err)
            setError('An error occurred')
          }
        })
    })
    .catch((err: any) => {
      console.error(err)
      setError('An error occurred') // TODO: Improve
    })
}

const OperationCreate = (): JSX.Element => {
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
  const [sTask, setSTask] = useState<Blob>()
  const [operationLocation, setOperationLocation] = useState<TLocation>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // TODO: redirect to operation view upon creation
  // TODO: Upon clicking cancel, ask for confirmation and whether it should be saved as a draft
  // TODO: Add "Save as Draft" button?

  return (
    <>
      {isLoading && <Progress.Linear />}
      <CreateOperationWrapper>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SelectOperationName
            setOperationName={(operationName: string) => {
              setOperationMeta({ ...operationMeta, name: operationName })
            }}
          />
          <br />
          <Heading text="Time periode" variant="h4" />
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
          <SelectSTask setSTask={setSTask} isLoading={isLoading} />

          <SelectOperationLocation
            location={operationLocation}
            setLocation={setOperationLocation}
            setIsNewLocation={(isNew: boolean) => {
              setIsNewEntity({ ...isNewEntity, location: isNew })
            }}
          />
        </div>
        <MapWrapper>
          <LocationOnMap location={operationLocation} zoom={5} />
        </MapWrapper>
      </CreateOperationWrapper>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'row',
          marginTop: '30px',
        }}
      >
        <Button
          onClick={() =>
            onClickCreate(
              operationMeta,
              operationLocation,
              operationConfig,
              sTask,
              isNewEntity,
              setError,
              token,
              user
            )
          }
        >
          Create operation
        </Button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  )
}

export default OperationCreate
