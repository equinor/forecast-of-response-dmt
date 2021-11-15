import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { AuthContext } from 'react-oauth2-code-pkce'
import JobApi from '../utils/JobApi'
import { SimulationStatus } from '../Enums'

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
  height: 25px;
  align-content: baseline;
  border-radius: 5px;
  padding: 0 3px;
  margin-left: 10px;
  border: ${(props: any) => `${colorFromStatus(props.status)} 3px solid`};
  color: ${(props: any) => colorFromStatus(props.status)};
  font-weight: bolder;
`

export const JobLog = (props: { jobId: string }) => {
  const { jobId } = props
  const { token } = useContext(AuthContext)
  const jobAPI = new JobApi(token)
  const [loading, setLoading] = useState<boolean>(false)
  const [jobLogs, setJobLogs] = useState<any>()
  const [jobStatus, setJobStatus] = useState<any>()

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
  }, [jobId])

  if (loading) return <pre>Loading...</pre>

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <label>Status: </label>
        <SimStatusWrapper status={jobStatus}>{jobStatus}</SimStatusWrapper>
      </div>
      <label>Logs:</label>
      <StyledPre>{jobLogs}</StyledPre>
    </div>
  )
}
