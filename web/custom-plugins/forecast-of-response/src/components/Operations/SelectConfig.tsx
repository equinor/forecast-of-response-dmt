import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Button, Progress, SingleSelect } from '@equinor/eds-core-react'
import { TOperationConfig } from '../../Types'
import { useSearch } from '../../hooks/useSearch'
import { Heading, Meta } from '../Design/Fonts'
import Grid from '../App/Grid'

const Div = styled.div``
const Input = styled.input``
const Label = styled.label``

const readFile = (file: any) => {
  const fileReader = new FileReader()
  // @ts-ignore-line
  return new Promise<any>((resolve, reject) => {
    fileReader.onload = (event) => resolve(event?.target?.result)
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsText(file)
  })
}

export const SelectOperationConfig = (props: {
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
