import React, { useEffect, useState } from 'react'
import { Button, Progress, SingleSelect } from '@equinor/eds-core-react'
import { TConfig } from '../../Types'
import useSearch from '../../hooks/useSearch'
import { Heading } from '../Design/Fonts'
import Grid from '../App/Grid'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: min-content;
  max-width: 400px;
`

const LocationButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  max-width: 300px;
`

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
  const [fileName, setFileName] = useState<string>()
  const [uploadNew, setUploadNew] = useState<boolean>(true)
  const { setOperationConfig, setIsNewConfig, isLoading, setIsLoading } = props

  /**
   * Set operation configs when the search has completed
   */
  useEffect(() => {
    if (searchResult) {
      setOperationConfigs(searchResult)
    }
  }, [searchResult])

  return (
    <Wrapper>
      <Heading text="Configuration file" variant="h4" />
      <Grid>
        <LocationButtonsGrid>
          <Button
            variant={!uploadNew ? 'contained' : 'outlined'}
            onClick={() => setUploadNew(false)}
          >
            Select existing
          </Button>
          <Button
            variant={uploadNew ? 'contained' : 'outlined'}
            onClick={() => setUploadNew(true)}
          >
            New
          </Button>
        </LocationButtonsGrid>
        {uploadNew ? (
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
                    setFileName(file.name)
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
                    console.error(
                      'Specified file is not in the required format (JSON).'
                    )
                  }
                }
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <label htmlFor="operationConfigUpload">
                <Button as="span" variant="outlined">
                  {(isLoading && <Progress.Dots color="primary" />) ||
                    'Upload configuration'}
                </Button>
              </label>
              <div
                style={{
                  marginLeft: '5px',
                  alignSelf: 'flex-end',
                }}
              >
                Selected: <i>{fileName || 'None...'}</i>
              </div>
            </div>
          </div>
        ) : (
          <SingleSelect
            id="operationConfigSelector"
            label="Select operation config from library"
            items={operationConfigs?.map((opConfig: TConfig) => opConfig.name)}
            handleSelectedItemChange={(event: any) => {
              setIsNewConfig(false)
              setOperationConfig(
                operationConfigs.find(
                  (config: TConfig) => config.name === event.selectedItem
                )
              )
            }}
          />
        )}
      </Grid>
    </Wrapper>
  )
}

export default SelectOperationConfig
