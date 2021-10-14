import React, { useState } from 'react'
import { Button, Progress } from '@equinor/eds-core-react'
import { Heading } from '../Design/Fonts'

const SelectSTask = (props: {
  setSTask: Function
  isLoading: boolean
}): JSX.Element => {
  const [staskFileName, setStaskFileName] = useState<string>()
  const { setSTask, isLoading } = props

  return (
    <>
      <Heading text="SIMA STask" variant="h4" />
      <div>
        <input
          type="file"
          id="staskUpload"
          style={{ display: 'none' }}
          accept=".stask"
          onChange={(event: any) => {
            const file: File = event.target.files[0]
            setSTask(file)
            setStaskFileName(file.name)
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <label htmlFor="staskUpload">
            <Button as="span" variant="outlined">
              {(isLoading && <Progress.Dots color="primary" />) ||
                'Upload STask'}
            </Button>
          </label>
          {staskFileName && (
            <div style={{ alignSelf: 'self-end', marginLeft: '20px' }}>
              Uploaded: {staskFileName}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SelectSTask
