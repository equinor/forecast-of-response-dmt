import React, { useContext, useState } from 'react'
import { TPhase, TSimulation, TSimulationConfig, TStask } from '../../Types'
import {
  Accordion,
  Button,
  Chip,
  Divider,
  Input,
  Progress,
  Scrim,
  Table,
  TextField,
} from '@equinor/eds-core-react'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'
import JobApi from '../../utils/JobApi'
import { DmssAPI } from '@dmt/common'
import { AuthContext } from 'react-oauth2-code-pkce'
import { DEFAULT_DATASOURCE_ID } from '../../const'
import { Blueprints } from '../../Enums'
import { lightGray, primaryGray } from '../Design/Colors'
import { StyledSelect } from '../Input'
import Result from '../Result'
import Icon from '../Design/Icons'
import { poorMansUUID } from '../../utils/uuid'
import { JobLog } from '../Jobs'
import { sortSimulationsByNewest } from '../../utils/sort'

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

function NewSimulationConfig(props: { defaultVars: any }) {
  const { defaultVars } = props
  const [variables, setVariables] = useState<any>(defaultVars)
  const [simConfigName, setSimConfigName] = useState<string>('New Simulation')
  return (
    <>
      <TextField
        id="simulation-name"
        placeholder="Label your simulation config"
        style={{ borderRadius: '5px', margin: '10px', width: 'inherit' }}
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
          {Object.entries(defaultVars).map(([key, defaultVal]) => (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell>{defaultVal}</Table.Cell>
              <Table.Cell>
                <Input
                  placeholder={defaultVal}
                  value={variables[key]}
                  onChange={(event: Event) =>
                    setVariables({
                      ...variables,
                      [key]: event.target.value,
                    })
                  }
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
        <Button
          variant="outlined"
          color="danger"
          onClick={() => setVariables(defaultVars)}
        >
          Reset
        </Button>
        {/*TODO: Do something*/}
        <Button disabled>Create (Not implemented)</Button>
      </div>
    </>
  )
}

function SingleSimulationConfig(props: {
  simulationConfig: TSimulationConfig
  dottedId: string
  stask: TStask
  publishSimulation: Function
}) {
  const { simulationConfig, dottedId, stask, publishSimulation } = props
  const [selectedSim, setSelectedSim] = useState<number>(0)
  const [loadingJob, setLoadingJob] = useState<boolean>(false)
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [simulations, setSimulations] = useState<TSimulation[]>(
    sortSimulationsByNewest(simulationConfig.simulations) || []
  )
  const { token } = useContext(AuthContext)
  const jobAPI = new JobApi(token)
  const dmssAPI = new DmssAPI(token)

  function startJob() {
    setLoadingJob(true)
    // window.crypto.randomUUID() is not supported in firefox yet.
    const simName = poorMansUUID()
    // Create the simulation entity
    const newSimulation: TSimulation = {
      type: Blueprints.SIMULATION,
      name: simName,
      simaJob: {
        name: simName,
        type: Blueprints.AZ_CONTAINER_JOB,
        image: 'publicMSA.azurecr.io/dmt-job/srs:latest',
        command: [
          '/code/init.sh',
          `--stask=${DEFAULT_DATASOURCE_ID}/${stask.blob._blob_id}`,
          `--workflow=${stask.workflowTask}`,
          '--input=waveDir=180',
          `--target=${DEFAULT_DATASOURCE_ID}/${dottedId}.simulations.${simulationConfig.simulations.length}.results`,
        ],
      },
      started: new Date().toISOString(),
      progress: '0%',
      ended: '',
      result: {},
    }
    dmssAPI.generatedDmssApi
      .explorerAdd({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        dottedId: `${dottedId}.simulations`,
        updateUncontained: false,
        body: newSimulation,
      })
      .then((res: any) => {
        // Add the simulation to the state
        setSimulations([newSimulation, ...simulations])
        // Start a job from the created simulation
        const newSimUID = JSON.parse(res).uid
        jobAPI
          .startJob(`${DEFAULT_DATASOURCE_ID}/${newSimUID}.simaJob`)
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

  // Since we sort the simulations by date, we need to fetch the real index of the selected sim
  function getStoredIndexOfSelectedSim() {
    const selectedSimStarted = simulations[selectedSim].started
    return simulationConfig.simulations
      .map((sim: TSimulation) => sim.started)
      .indexOf(selectedSimStarted)
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
              simulationConfig.variables.map((variable: any) => (
                <label key={variable}>{variable}</label>
              ))}
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
        <StyledHeaderButton onClick={() => startJob()}>
          Run simulation
        </StyledHeaderButton>
        <StyledHeaderButton disabled>
          Define reoccurring job (Not implemented)
        </StyledHeaderButton>
        {/* The Buttons loses margin prop when they are disabled...*/}
        <div style={{ width: '20px' }}></div>
        <StyledHeaderButton
          onClick={() =>
            // Get the index of the current simulationConfig from dottedId
            publishSimulation(parseInt(dottedId.split('.').slice(-1)[0]))
          }
        >
          Publish this simulation
        </StyledHeaderButton>
      </SimHeaderWrapper>
      {loadingJob && <Progress.Linear />}
      <div
        style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}
      >
        <label>Select which simulation to view</label>
        <StyledSelect
          onChange={(e: Event) => {
            setSelectedSim(parseInt(e.target.value))
          }}
        >
          {simulations.map((simulation: TSimulation, index) => (
            <option
              key={index}
              value={index}
              onSelect={() => setSelectedSim(index)}
            >
              {new Date(simulation.started).toLocaleString(navigator.language)}
            </option>
          ))}
        </StyledSelect>
        {simulations[selectedSim]?.result._id ? (
          <Result result={simulations[selectedSim]?.result} />
        ) : (
          <div>
            <label>No result for this simulation...</label>
            <JobLog
              jobId={`${DEFAULT_DATASOURCE_ID}/${dottedId}.simulations.${getStoredIndexOfSelectedSim()}.simaJob`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SimulationConfigList(props: {
  simulationConfigs: TSimulationConfig[]
  dottedId: string
  stask: TStask
}) {
  const { simulationConfigs, dottedId, stask } = props
  const { token } = useContext(AuthContext)
  const dmssAPI = new DmssAPI(token)
  const [simConfigs, setSimConfigs] = useState<TSimulationConfig[]>(
    simulationConfigs
  )

  function publishSimulation(simIndex: number): void {
    const updatedSimConfs = simConfigs.map((conf: TSimulationConfig, index) => {
      conf.published = index === simIndex
      return conf
    })
    dmssAPI
      .updateDocumentById({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        documentId: dottedId.split('.', 1)[0],
        data: JSON.stringify(updatedSimConfs),
        attribute: dottedId.split('.').slice(1).join('.'),
      })
      .then(() => setSimConfigs(updatedSimConfs))
      .catch((error: any) => console.error(error))
  }

  return (
    <div>
      <Accordion>
        {Object.values(simConfigs).map(
          (simulationConfig: TSimulationConfig, index: number) => (
            <Accordion.Item key={index} isExpanded={index === 0}>
              <Accordion.Header>
                {simulationConfig.name}
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
  stask: TStask
}): JSX.Element => {
  const { phase, dottedId, stask } = props
  const [visibleCreateSimScrim, setVisibleCreateSimScrim] = useState(false)
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
            Create new simulation
            <NewSimulationConfig
              defaultVars={{ WaveHeight: 1.12, WaveDirection: 90 }}
            />
            <Button onClick={() => setVisibleCreateSimScrim(false)}>
              Close
            </Button>
          </div>
        </Scrim>
      )}

      <Divider />
      <SimulationConfigList
        simulationConfigs={phase.simulationConfigs}
        dottedId={`${dottedId}.simulationConfigs`}
        stask={stask}
      />
    </>
  )
}
