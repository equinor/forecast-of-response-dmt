import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { AuthContext } from '@dmt/common'
import JobApi from '../utils/JobApi'
import { SimulationStatus } from '../Enums'
import { Button, Label } from '@equinor/eds-core-react'

const StyledPre = styled.pre`
  display: flex;
  white-space: pre-line;
`

function colorFromStatus(status: string): string {
  switch (status) {
    case SimulationStatus.COMPLETED:
      return 'green'
    case SimulationStatus.FAILED:
      return 'red'
    case SimulationStatus.RUNNING:
      return 'orange'
    default:
      return 'darkgrey'
  }
}

const SimStatusWrapper = styled.div`
  display: flex;
  height: 20px;
  align-content: baseline;
  border-radius: 5px;
  padding: 0 3px 3px 0;
  margin-left: 10px;
  border: ${(props: any) => `${colorFromStatus(props.status)} 2px solid`};
  color: ${(props: any) => colorFromStatus(props.status)};
`

export const JobLog = (props: { jobId: string }) => {
  const { jobId } = props
  const { token } = useContext(AuthContext)
  const jobAPI = new JobApi(token)
  const [loading, setLoading] = useState<boolean>(false)
  const [jobLogs, setJobLogs] = useState<any>()
  const [jobStatus, setJobStatus] = useState<any>()
  const [refreshCount, setRefreshCount] = useState<number>(0)

  useEffect(() => {
    setLoading(true)
    jobAPI
      .statusJob(jobId)
      .then((result: any) => {
        setJobLogs(result.data.log)
        setJobStatus(result.data.status)
      })
      .catch((e: Error) => {
        setJobLogs(e.response.data.message)
        setJobStatus(SimulationStatus.FAILED)
        console.error(e)
      })
      .finally(() => setLoading(false))
  }, [jobId, refreshCount])

  if (loading) return <pre>Loading...</pre>

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Label label="Status:" />
        <SimStatusWrapper status={jobStatus}>{jobStatus}</SimStatusWrapper>
        <Button
          onClick={() => setRefreshCount(refreshCount + 1)}
          style={{ marginLeft: '100px' }}
        >
          Refresh logs
        </Button>
      </div>
      <Label style={{ paddingTop: '10px' }} label="Logs:" />
      <div style={{ paddingBottom: '20px' }}>
        <StyledPre>{jobLogs}</StyledPre>
      </div>
    </div>
  )
}
