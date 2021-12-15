import React, { useContext, useState } from 'react'
import {
  TBlob,
  TCronJob,
  TPhase,
  TSimulationConfig,
  TVariable,
} from '../../Types'
import {
  Accordion,
  Button,
  Chip,
  Divider,
  Input,
  Label,
  Progress,
  Scrim,
  Table,
  TextField,
  Typography,
} from '@equinor/eds-core-react'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'
import JobApi from '../../utils/JobApi'
import { AuthContext, DmssAPI } from '@dmt/common'
import { DEFAULT_DATASOURCE_ID } from '../../const'
import { Blueprints } from '../../Enums'
import { lightGray, primaryGray } from '../Design/Colors'
import { StyledSelect } from '../Input'
import Result from '../Result'
import Icon from '../Design/Icons'
import { JobLog } from '../Jobs'
import { CreateReoccurringJob } from '../ReoccurringJob'
import { createContainerJob } from '../../utils/createContainerJob'

const SimHeaderWrapper = styled.div`
  display: flex;
  background-color: ${primaryGray};
  padding: 15px 30px;
  margin-bottom: 20px;
  justify-content: flex-start;
  align-items: center;
`

const StyledHeaderButton = styled(Button)`
  margin: 0 20px;
`

const SummaryButton = styled.div`
  z-index: 100;
  display: flex;
  padding: 5px;
  height: 40px;
  width: 40px;
  box-shadow: ${(props: any) =>
    props.expanded ? 0 : 'darkgrey -2px 2px 6px 1px'};
  cursor: pointer;
  position: absolute;
  right: ${(props: any) => (props.expanded ? '210px' : 0)};
  align-items: center;
  justify-content: center;
  background-color: ${lightGray};
`

const JobDetailsLink = styled.div`
  color: blue;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 10px;
`

const SummaryWrapper = styled.div`
  z-index: 100;
  position: absolute;
  display: flex;
  width: min-content;
  align-self: flex-end;
  background-color: ${lightGray};
  flex-flow: row-reverse;
`

const SummaryContentWrapper = styled.div`
  z-index: 100;
  display: flex;
  flex-flow: column;
  width: 250px;
  height: 600px;
  box-shadow: darkgrey -2px 2px 6px 1px;
  padding: 40px;
  justify-content: space-around;
`

function NewSimulationConfig(props: {
  defaultVars: TVariable[]
  dottedId: string
  setVisibleCreateSimScrim: (isVisible: boolean) => void
  setCreateSimError: (message: string) => void
  setSimulationConfigs: (simConfig: TSimulationConfig[]) => void
  simulationConfigs: TSimulationConfig[]
  close: Function
}) {
  const {
    defaultVars,
    dottedId,
    setVisibleCreateSimScrim,
    setCreateSimError,
    setSimulationConfigs,
    simulationConfigs,
    close,
  } = props
  const [variables, setVariables] = useState<TVariable[]>(
    defaultVars.map((vari) => ({ ...vari }))
  )
  const [simConfigName, setSimConfigName] = useState<string>('')
  const { token } = useContext(AuthContext)
  const dmssAPI = new DmssAPI(token)

  function createSimulation(variables: TVariable[]) {
    setVisibleCreateSimScrim(false)
    setCreateSimError('')
    const newSimConf: TSimulationConfig = {
      type: Blueprints.SIMULATION_CONFIG,
      name: simConfigName !== '' ? simConfigName : 'New Simulation',
      variables: variables,
      published: false,
      jobs: [],
      results: [],
      cronJob: {},
    }
    // Create the simulation entity
    dmssAPI.generatedDmssApi
      .explorerAdd({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        dottedId: `${dottedId}`,
        body: newSimConf,
      })
      .then(() => setSimulationConfigs([...simulationConfigs, newSimConf]))
      .catch((e: Error) => {
        e.json().then((result: any) => {
          setVisibleCreateSimScrim(true)
          setCreateSimError(result.message)
        })
      })
  }

  function resetValues() {
    setVariables(defaultVars.map((vari) => ({ ...vari })))
    setSimConfigName('')
    setCreateSimError('')
  }

  return (
    <>
      <TextField
        id="simulation-name"
        placeholder="Label your simulation config"
        value={simConfigName}
        style={{ marginBottom: '10px' }}
        onChange={(event): Event => setSimConfigName(event.target.value)}
      />
      <Table>
        <Table.Head sticky>
          <Table.Row>
            <Table.Cell>SIMA Variable</Table.Cell>
            <Table.Cell>Default value</Table.Cell>
            <Table.Cell>New value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {defaultVars.map((defaultVal, index) => (
            <Table.Row key={defaultVal.name}>
              <Table.Cell>{defaultVal.name}</Table.Cell>
              <Table.Cell>{defaultVal.value}</Table.Cell>
              <Table.Cell>
                <Input
                  placeholder={defaultVal.value}
                  type={defaultVal.unit}
                  value={variables[index].value}
                  onChange={(event: Event) => {
                    variables[index].value = event.target.value
                    setVariables([...variables])
                  }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          margin: '10px',
        }}
      >
        <Button color="secondary" onClick={() => close()}>
          Close
        </Button>
        <Button variant="outlined" color="danger" onClick={() => resetValues()}>
          Reset
        </Button>
        <Button onClick={() => createSimulation(variables)}>Create</Button>
      </div>
    </>
  )
}

function SingleSimulationConfig(props: {
  simulationConfig: TSimulationConfig
  dottedId: string
  stask: TBlob
  publishSimulation: Function
  simaTask: string
  simaWorkflow: string
  configBlob: TBlob
}) {
  const {
    simulationConfig,
    dottedId,
    stask,
    publishSimulation,
    simaTask,
    simaWorkflow,
    configBlob,
  } = props
  const [selectedJob, setSelectedJob] = useState<number>(0)
  const [selectedResult, setSelectedResult] = useState<number>(0)
  const [loadingJob, setLoadingJob] = useState<boolean>(false)
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [visibleReoccurringJob, setVisibleReoccurringJob] = useState<boolean>(
    false
  )
  const [cronJob, setCronJob] = useState<any>({ ...simulationConfig?.cronJob })
  const [jobs, setJobs] = useState<any[]>([...simulationConfig.jobs])
  const results = [...simulationConfig.results]

  const [viewJobDetails, setViewJobDetails] = useState<boolean>(false)

  const { token } = useContext(AuthContext)
  const jobAPI = new JobApi(token)
  const dmssAPI = new DmssAPI(token)

  function removeCronJob() {
    const success = () => NotificationManager.success('Removed reoccurring job')
    // Remove the cronJob entity
    dmssAPI.generatedDmssApi
      .explorerRemove({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        dottedId: `${dottedId}.cronJob`,
      })
      .catch((error: Error) => console.error(error))
    // Remove the registered job
    jobAPI
      .removeJob(`${DEFAULT_DATASOURCE_ID}/${dottedId}.cronJob`)
      .then(() => success())
      .catch((error: Error) => {
        if (error.response.status === 404) {
          setCronJob({})
          success()
        } else {
          console.error(error)
          NotificationManager.error(
            error?.response?.data?.message,
            'Failed to register reoccurring job'
          )
        }
      })
  }

  function saveAndStartCronJob(cronValue: TCronJob) {
    setLoadingJob(true)
    removeCronJob()
    const cronJob = createContainerJob(
      `${DEFAULT_DATASOURCE_ID}/${stask._blob_id}`, // STask
      simaTask, //Sima task in STask
      simaWorkflow, // Sima workflow in task
      dottedId, // Reference to Sima job input entity
      `${DEFAULT_DATASOURCE_ID}/${configBlob._blob_id}`, // Id of compute cfg
      true, // Use remote compute service
      `${DEFAULT_DATASOURCE_ID}/${dottedId}.results`, // Reference for results upload destination
      cronValue
    )
    dmssAPI.generatedDmssApi
      .explorerAdd({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        dottedId: `${dottedId}.cronJob`,
        updateUncontained: false,
        body: cronJob,
      })
      .then(() => {
        setCronJob(cronJob)
        jobAPI
          .startJob(`${DEFAULT_DATASOURCE_ID}/${dottedId}.cronJob`)
          .then((result: any) => {
            NotificationManager.success(
              JSON.stringify(result.data),
              'Reoccurring job registered',
              0
            )
          })
          .catch((error: Error) => {
            console.error(error)
            NotificationManager.error(
              error?.response?.data?.message,
              'Failed to register cron job'
            )
          })
          .finally(() => setLoadingJob(false))
      })
      .catch((error: Response) => {
        error.json().then((data: any) => {
          console.error(data)
          NotificationManager.error(
            data?.message,
            'Failed to register cron job',
            0
          )
          setLoadingJob(false)
        })
      })
  }

  function saveAndStartJob() {
    setLoadingJob(true)
    const newJob: any = createContainerJob(
      `${DEFAULT_DATASOURCE_ID}/${stask._blob_id}`, // STask
      simaTask, //Sima task in STask
      simaWorkflow, // Sima workflow in task
      dottedId, // Reference to Sima job input entity
      `${DEFAULT_DATASOURCE_ID}/${configBlob._blob_id}`,
      true, // Use remote compute service
      `${DEFAULT_DATASOURCE_ID}/${dottedId}.results` // Reference for results upload destination
    )
    dmssAPI.generatedDmssApi
      .explorerAdd({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        dottedId: `${dottedId}.jobs`,
        updateUncontained: false,
        body: newJob,
      })
      .then((res: any) => {
        // Add the new job to the state
        setJobs([newJob, ...jobs])
        // Start a job from the created job entity (last one in list)
        jobAPI
          .startJob(`${DEFAULT_DATASOURCE_ID}/${dottedId}.jobs.${jobs.length}`)
          .then((result: any) => {
            NotificationManager.success(
              JSON.stringify(result.data),
              'Simulation job started'
            )
          })
          .catch((error: Error) => {
            console.error(error)
            NotificationManager.error(
              error?.response?.data?.message,
              'Failed to start job'
            )
          })
          .finally(() => setLoadingJob(false))
      })
      .catch((error: Error) => {
        console.error(error)
        NotificationManager.error(
          error?.response?.data?.message,
          'Failed to start job'
        )
        setLoadingJob(false)
      })
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      <SummaryWrapper>
        {showSummary && (
          <SummaryContentWrapper>
            <h3>Summary</h3>
            <h4>Values:</h4>
            {simulationConfig.variables.length &&
              simulationConfig.variables.map((variable: TVariable) => (
                <label key={variable.name}>
                  {variable.name}: {variable.value}
                </label>
              ))}
            <h4>Reoccurring job:</h4>
            <label>
              {simulationConfig?.cronJob
                ? simulationConfig.cronJob.cron
                : 'Not configured'}
            </label>
            <h4>Last published:</h4>
            <label>Not implemented</label>
            <h4>Author:</h4>
            <label>Not implemented</label>
          </SummaryContentWrapper>
        )}
        <SummaryButton
          onClick={() => setShowSummary(!showSummary)}
          expanded={showSummary}
        >
          {showSummary ? (
            <Icon name="last_page" size={24} />
          ) : (
            <Icon name="first_page" size={24} />
          )}
        </SummaryButton>
      </SummaryWrapper>
      <SimHeaderWrapper>
        <StyledHeaderButton onClick={() => saveAndStartJob()}>
          Run simulation
        </StyledHeaderButton>
        <StyledHeaderButton
          onClick={() => setVisibleReoccurringJob(!visibleReoccurringJob)}
        >
          Configure reoccurring job
        </StyledHeaderButton>
        <StyledHeaderButton
          onClick={() =>
            // Get the index of the current simulationConfig from dottedId
            publishSimulation(parseInt(dottedId.split('.').slice(-1)[0]))
          }
        >
          Publish this simulation
        </StyledHeaderButton>
        {visibleReoccurringJob && (
          <Scrim onClose={() => setVisibleReoccurringJob(false)} isDismissable>
            <CreateReoccurringJob
              close={() => setVisibleReoccurringJob(false)}
              removeJob={() => removeCronJob()}
              setCronJob={(cronValue) => {
                saveAndStartCronJob(cronValue)
              }}
              cronJob={cronJob}
            />
          </Scrim>
        )}
      </SimHeaderWrapper>
      {loadingJob && <Progress.Linear />}
      <div
        style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}
      >
        <Label label="Jobs" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'self-end',
            marginBottom: '15px',
          }}
        >
          <StyledSelect
            onChange={(e: Event) => setSelectedJob(parseInt(e.target.value))}
          >
            {jobs.map((job: any, index) => (
              <option key={index} value={index}>
                {job.name}
              </option>
            ))}
          </StyledSelect>
          <JobDetailsLink onClick={() => setViewJobDetails(!viewJobDetails)}>
            {viewJobDetails ? 'Show less' : 'Show more'}
          </JobDetailsLink>
        </div>

        {viewJobDetails && (
          <JobLog
            jobId={`${DEFAULT_DATASOURCE_ID}/${dottedId}.jobs.${selectedJob}`}
          />
        )}
        <Label label="Results" />
        <StyledSelect
          onChange={(e: Event) => setSelectedResult(parseInt(e.target.value))}
        >
          {results.map((resultRef: any, index) => (
            <option key={index} value={index}>
              {resultRef.name}
            </option>
          ))}
        </StyledSelect>
        {results[selectedResult]?._id && (
          <Result result={results[selectedResult]} />
        )}
      </div>
    </div>
  )
}

function SimulationConfigList(props: {
  setSimulationConfigs: (simConfig: TSimulationConfig[]) => void
  simulationConfigs: TSimulationConfig[]
  dottedId: string
  stask: TBlob
  simaTask: string
  simaWorkflow: string
  configBlob: TBlob
}) {
  const {
    setSimulationConfigs,
    simulationConfigs,
    dottedId,
    stask,
    simaTask,
    simaWorkflow,
    configBlob,
  } = props
  const { token } = useContext(AuthContext)
  const dmssAPI = new DmssAPI(token)

  function publishSimulation(simIndex: number): void {
    const updatedSimConfs = simulationConfigs.map(
      (conf: TSimulationConfig, index) => {
        conf.published = index === simIndex
        return conf
      }
    )
    dmssAPI
      .updateDocumentById({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        documentId: dottedId.split('.', 1)[0],
        data: JSON.stringify(updatedSimConfs),
        attribute: dottedId.split('.').slice(1).join('.'),
      })
      .then(() => setSimulationConfigs(updatedSimConfs))
      .catch((error: any) => console.error(error))
  }

  return (
    <div>
      <Accordion>
        {Object.values(simulationConfigs).map(
          (simulationConfig: TSimulationConfig, index: number) => (
            <Accordion.Item key={index} isExpanded={index === 0}>
              <Accordion.Header>
                {simulationConfig.name}
                {Object.keys(simulationConfig?.cronJob || {}).length > 0 && (
                  <Chip variant="active">Schedule set</Chip>
                )}
                {simulationConfig.published && (
                  <Chip variant="active">Published</Chip>
                )}
              </Accordion.Header>
              <Accordion.Panel style={{ padding: '0' }}>
                <SingleSimulationConfig
                  key={simulationConfig.name}
                  simulationConfig={simulationConfig}
                  dottedId={`${dottedId}.${index}`}
                  stask={stask}
                  publishSimulation={publishSimulation}
                  simaTask={simaTask}
                  simaWorkflow={simaWorkflow}
                  configBlob={configBlob}
                />
              </Accordion.Panel>
            </Accordion.Item>
          )
        )}
      </Accordion>
    </div>
  )
}

export default (props: {
  phase: TPhase
  dottedId: string
  stask: TBlob
  configBlob: TBlob
}): JSX.Element => {
  const { phase, dottedId, stask, configBlob } = props
  const [visibleCreateSimScrim, setVisibleCreateSimScrim] = useState(false)
  const [createSimError, setCreateSimError] = useState<string>('')
  const [simulationConfigs, setSimulationConfigs] = useState<
    TSimulationConfig[]
  >(phase.simulationConfigs)

  function CreateSimErrorDialog() {
    return (
      <Typography color="danger" variant="h6">
        {createSimError.includes('DuplicateFileNameException')
          ? 'Could not create the simulation: A simulation with that label already exists.'
          : createSimError}
      </Typography>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexFlow: 'row-reverse' }}>
        <Button onClick={() => setVisibleCreateSimScrim(true)}>
          Create new simulation
        </Button>
      </div>
      {visibleCreateSimScrim && (
        <Scrim onClose={() => setVisibleCreateSimScrim(false)} isDismissable>
          <div style={{ backgroundColor: '#fff', padding: '1rem' }}>
            {createSimError && <CreateSimErrorDialog />}
            <NewSimulationConfig
              defaultVars={phase.defaultVariables}
              dottedId={`${dottedId}.simulationConfigs`}
              setVisibleCreateSimScrim={setVisibleCreateSimScrim}
              setCreateSimError={setCreateSimError}
              setSimulationConfigs={setSimulationConfigs}
              simulationConfigs={simulationConfigs}
              close={() => {
                setCreateSimError('')
                setVisibleCreateSimScrim(false)
              }}
            />
          </div>
        </Scrim>
      )}

      <Divider />
      <SimulationConfigList
        setSimulationConfigs={setSimulationConfigs}
        simulationConfigs={simulationConfigs}
        dottedId={`${dottedId}.simulationConfigs`}
        stask={stask}
        simaTask={phase.workflowTask}
        simaWorkflow={phase.workflow}
        configBlob={configBlob}
      />
    </>
  )
}
