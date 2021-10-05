import React, { useState, useEffect } from 'react'
import { Button, Progress, SingleSelect } from '@equinor/eds-core-react'
import { TConfig } from '../../Types'
import useSearch from '../../hooks/useSearch'
import { Heading, Meta } from '../Design/Fonts'
import Grid from '../App/Grid'

/**
 * Read the contents of a file as text
 * @param file The file to read
 */
const readFile = (file: Blob): Promise<string> => {
  const fileReader = new FileReader()
  // @ts-ignore-line
  return new Promise<string>((resolve, reject) => {
    fileReader.onload = (event) => resolve(event?.target?.result)
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsText(file)
  })
}

const SelectOperationConfig = (props: {
  setOperationConfig: Function
  setIsNewConfig: Function
  isLoading: boolean
  setIsLoading: Function
}): JSX.Element => {
  const [operationConfigs, setOperationConfigs] = useState<TConfig[]>([])
  const [searchResult, isLoadingSearch, hasError] = useSearch(
    'ForecastDS/ForecastOfResponse/Blueprints/Config'
  )
  const [
    operationConfigUploadFileName,
    setOperationConfigUploadFileName,
  ] = useState<string>()
  const { setOperationConfig, setIsNewConfig, isLoading, setIsLoading } = props

  /**
   * Set operation configs when the search has completed
   */
  useEffect(() => {
    console.log(searchResult)
    if (searchResult) {
      setOperationConfigs(searchResult)
    }
  }, [searchResult])

  return (
    <>
      <Heading text="Pick or upload the operation config" variant="h4" />
      <Grid>
        <SingleSelect
          id="operationConfigSelector"
          label="Select operation config from library"
          items={operationConfigs?.map(
            (opConfig: TConfig) => opConfig.name
          )}
          handleSelectedItemChange={(event: any) => {
            setIsNewConfig(false)
            setOperationConfig(
              operationConfigs.find(
                (config: TConfig) => config.name === event.selectedItem
              )
            )
          }}
        />
        <div>
          <input
            type="file"
            id="operationConfigUpload"
            style={{ display: 'none' }}
            accept=".json"
            onChange={(event: any) => {
              if (event.target.files.length >= 1) {
                const file = event.target.files[0]
                if (file.type === 'application/json') {
                  setOperationConfigUploadFileName(file.name)
                  setIsLoading(true)
                  readFile(file)
                    .then((contents: string) => {
                      const configJson = JSON.parse(contents)
                      setIsNewConfig(true)
                      setOperationConfig(configJson)
                      setIsLoading(false)
                    })
                    .catch((err: any) => {
                      console.error(err)
                      setIsLoading(false)
                    })
                } else {
                  console.error('Specified file is not in the required format (JSON).')
                }
              }
            }}
          />
          <label htmlFor="operationConfigUpload">
            <Button as="span" variant="outlined">
              {(isLoading && <Progress.Dots color="primary" />) ||
                'Upload new config'}
            </Button>
          </label>
          {operationConfigUploadFileName && (
            <Meta text={`File: ${operationConfigUploadFileName}`} />
          )}
        </div>
      </Grid>
    </>
  )
}

export default SelectOperationConfig
