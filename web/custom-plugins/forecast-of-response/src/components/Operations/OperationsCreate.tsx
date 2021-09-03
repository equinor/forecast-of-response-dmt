import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Progress,
  SingleSelect,
  TextField,
} from '@equinor/eds-core-react'
import styled from 'styled-components'
import Grid from '../App/Grid'
import { Heading, Meta } from '../Design/Fonts'
import {
  DmtSettings,
  TLocation,
  TOperation,
  TOperationConfig,
} from '../../Types'
import { OperationStatus } from '../../Enums'
import { useSearch } from '../../hooks/useSearch'

const Div = styled.div``
const Input = styled.input``
const Label = styled.label``

const LocationButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

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

const SelectOperationConfig = (props: {
  operationConfig: TOperationConfig
  setOperationConfig: any
  isLoading: boolean
  setIsLoading: any
}): JSX.Element => {
  const [operationConfigs, setOperationConfigs] = useState<TOperationConfig[]>(
    []
  )
  const [searchResult, isLoadingConfigs, setSearchResult, hasError] = useSearch(
    'ForecastDS/ForecastOfResponse/Blueprints/OperationConfig'
  )
  const [
    operationConfigUploadFileName,
    setOperationConfigUploadFileName,
  ] = useState<string>()
  const { operationConfig, setOperationConfig, isLoading, setIsLoading } = props

  /**
   * Set operation configs when the search has completed
   */
  useEffect(() => {
    setOperationConfigs(searchResult)
  }, [!isLoadingConfigs, searchResult, !hasError])

  return (
    <>
      <Heading text="Pick or upload the operation config" variant="h4" />
      <Grid>
        <SingleSelect
          id="operationConfigSelector"
          label="Select operation config from library"
          items={operationConfigs?.map((opConfig: TOperationConfig) => {
            return opConfig.name
          })}
          handleSelectedItemChange={(event: any) => {
            const matches = operationConfigs?.filter(
              (opConfig: TOperationConfig) =>
                opConfig.name === event.selectedItem
            )
            setOperationConfig(matches[0])
          }}
        />
        <Div>
          <Input
            type="file"
            id="operationConfigUpload"
            style={{ display: 'none' }}
            accept=".json"
            onChange={(event: any) => {
              if (event.target.files.length === 1) {
                const file = event.target.files[0]
                if (file.type === 'application/json') {
                  setOperationConfigUploadFileName(file.name)
                  setIsLoading(true)
                  readFile(file)
                    .then((contents: string) => {
                      const configJson = JSON.parse(contents)
                      setOperationConfig(configJson)
                      setIsLoading(false)
                    })
                    .catch((err: any) => {
                      console.error(err)
                      setIsLoading(false)
                    })
                } else {
                  console.error(
                    'Specified file is not in the required format JSON.'
                  )
                }
              }
            }}
          />
          <Label htmlFor="operationConfigUpload">
            <Button as="span" variant="outlined">
              {(isLoading && <Progress.Dots color="primary" />) ||
                'Upload new config'}
            </Button>
          </Label>
          {operationConfigUploadFileName && (
            <Meta text={`File: ${operationConfigUploadFileName}`} />
          )}
        </Div>
      </Grid>
    </>
  )
}

const OperationLocationMap = (props: {
  selectedLocation: TLocation
}): JSX.Element => {
  const { selectedLocation } = props
  const Map = () => (
    <Card.Media fullWidth>
      <img
        src="https://images.all-free-download.com/images/graphiclarge/europe_map_vectors_design_588720.jpg"
        alt="map"
      />
    </Card.Media>
  )
  return (
    <Div style={{ width: '300px' }}>
      <Card>
        <Card.Header>
          <Card.HeaderTitle>
            <Heading text="Location on map" variant="h5" />
          </Card.HeaderTitle>
        </Card.Header>
        <Map />
      </Card>
    </Div>
  )
}

const SelectOperationLocation = (props: {
  selectedLocation: TLocation
  setSelectedLocation: any
}): JSX.Element => {
  const [locations, setLocations] = useState<TLocation[]>([])
  const [
    searchResult,
    isLoadingLocations,
    setSearchResult,
    hasError,
  ] = useSearch('ForecastDS/ForecastOfResponse/Blueprints/Location')
  const [selectLocationType, setSelectLocationType] = useState<string>('select')
  const { selectedLocation, setSelectedLocation } = props

  /**
   * Set locations when the search has completed
   */
  useEffect(() => {
    setLocations(searchResult)
  }, [!isLoadingLocations, searchResult, !hasError])

  return (
    <>
      <Div id="opLoc">
        <Heading text="Enter location" variant="h4" />
        <Div id="opLoc-type">
          <LocationButtonsGrid>
            <Button
              variant={
                selectLocationType === 'select' ? 'contained' : 'outlined'
              }
              onClick={() => {
                setSelectLocationType('select')
              }}
            >
              Select existing location
            </Button>
            <Button
              variant={selectLocationType === 'add' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectLocationType('add')
              }}
            >
              Enter UTM coordinates
            </Button>
          </LocationButtonsGrid>
        </Div>
        <br />
        {(selectLocationType === 'select' && (
          <Div id="opLoc-selector">
            <SingleSelect
              id="operationLocationSelector"
              label="Select location"
              items={locations?.map((loc: TLocation) => {
                return `${loc.name} - ${loc.UTM}`
              })}
              handleSelectedItemChange={(event: any) => {
                // Parse formatted location string to identify actual loc
                const locationFormatted = event.selectedItem
                const [locationName, locationUTM] = locationFormatted.split(
                  ' - '
                )
                const matches = locations?.filter(
                  (loc: TLocation) =>
                    loc.name === locationName && loc.UTM === locationUTM
                )
                setSelectedLocation(matches[0])
              }}
            />
          </Div>
        )) ||
          (selectLocationType === 'add' && (
            <Div id="opLoc-creator">
              <TextField
                id="operationLocationName"
                placeholder="Location name"
                label="Location name"
                helperText="Provide the name of the location to create"
                onChange={(event: any) => {
                  setSelectedLocation(
                    // @ts-ignore-line
                    Object.assign({}, selectedLocation, {
                      name: event.target.value,
                    })
                  )
                }}
              />
              <br />
              <TextField
                id="operationLocationUTM"
                placeholder="UTM coordinates"
                label="Location coordinates (UTM)"
                helperText="Provide the UTM coordinates of the location to create"
                onChange={(event: any) => {
                  setSelectedLocation(
                    // @ts-ignore-line
                    Object.assign({}, selectedLocation, {
                      UTM: event.target.value,
                    })
                  )
                }}
              />
            </Div>
          ))}
      </Div>
      <OperationLocationMap selectedLocation={selectedLocation} />
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

const readFile = (file: any) => {
  const fileReader = new FileReader()
  // @ts-ignore-line
  return new Promise<any>((resolve, reject) => {
    fileReader.onload = (event) => resolve(event?.target?.result)
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsText(file)
  })
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
