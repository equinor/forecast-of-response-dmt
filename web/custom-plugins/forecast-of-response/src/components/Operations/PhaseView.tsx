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
import { AuthContext, DmssAPI } from '@dmt/common'
import { DEFAULT_DATASOURCE_ID } from '../../const'
import { Blueprints } from '../../Enums'
import { primaryGray } from '../Design/Colors'
import { StyledSelect } from '../Input'
import Mock from '../Plots/Mock'

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

const ResultWrapper = styled.div`
  border: darkgrey 1px solid;
  display: flex;
  flex-direction: column;
  margin: 20px 0;
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

function Result(props: { result: any }) {
  const { result } = props
  return (
    <ResultWrapper>
      <Mock />
    </ResultWrapper>
  )
}

function SingleSimulationConfig(props: {
  simulationConfig: TSimulationConfig
  dottedId: string
  stask: TStask
}) {
  const { simulationConfig, dottedId, stask } = props
  const [selectedSim, setSelectedSim] = useState<number>(1)
  const [loadingJob, setLoadingJob] = useState<boolean>(false)
  const { token } = useContext(AuthContext)
  const jobAPI = new JobApi(token)
  const dmssAPI = new DmssAPI(token)

  function startJob() {
    setLoadingJob(true)
    const simName = crypto.randomUUID()
    // Create the simulation entity
    dmssAPI.generatedDmssApi
      // TODO: Remove this when testing ok
      //   .explorerAdd({
      //     dataSourceId: DEFAULT_DATASOURCE_ID,
      //     dottedId: `${dottedId}.simulations`,
      //     body: {
      //       type: 'ForecastDS/ForecastOfResponse/Blueprints/Simulation',
      //       name: simName,
      //       simaJob: {
      //         name: simName,
      //         type: 'DMT-Internal/DMT/AzureContainerInstanceJob',
      //         description: 'Test',
      //         image: 'alpine',
      //         command: ['echo', 'Hello world!'],
      //         environmentVariables: [
      //           'var1=a',
      //           'var2=b',
      //           'var3=_01863nv8||8374(/)&)(#!?=__Ba12|2',
      //         ],
      //       },
      //       started: new Date().toISOString(),
      //       progress: '0%',
      //       ended: '',
      //       results: [],
      //     },
      //   })
      .explorerAdd({
        dataSourceId: DEFAULT_DATASOURCE_ID,
        dottedId: `${dottedId}.simulations`,
        body: {
          type: Blueprints.SIMULATION,
          name: simName,
          simaJob: {
            name: simName,
            type: Blueprints.AZ_CONTAINER_JOB,
            image: 'aPublibRepo/SRSWrapper:v1.2.3',
            command: [
              `--stask=${DEFAULT_DATASOURCE_ID}/${stask.blob._id}`,
              `--workflow=${stask.workflowTask}`,
              '--input=waveDir=180',
              `--target=${DEFAULT_DATASOURCE_ID}/${dottedId}.simulations.${simulationConfig.simulations.length}.results`,
            ],
          },
          started: new Date().toISOString(),
          progress: '0%',
          ended: '',
          results: [],
        },
      })
      .then((res: any) => {
        // Start a job from the created simulation
        const newSimUID = JSON.parse(res).uid
        jobAPI
          .startJob(`${DEFAULT_DATASOURCE_ID}/${newSimUID}.simaJob`)
          .then((result: any) => {
            NotificationManager.success(
              JSON.stringify(result),
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
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <SimHeaderWrapper>
          <StyledHeaderButton onClick={() => startJob()}>
            Run simulation
          </StyledHeaderButton>
          <StyledHeaderButton disabled>
            Define reoccurring job (Not implemented)
          </StyledHeaderButton>
          {/* The Buttons loses margin prop when they are disabled...*/}
          <div style={{ width: '20px' }}></div>
          <StyledHeaderButton disabled>
            Publish this simulation (Not implemented)
          </StyledHeaderButton>
        </SimHeaderWrapper>
        {loadingJob && <Progress.Linear />}
        <label>Select which simulation to view</label>
        <StyledSelect>
          {simulationConfig.simulations.map(
            (simulation: TSimulation, index) => (
              <option
                value={simulation.started}
                onSelect={() => setSelectedSim(index)}
              >
                {new Date(simulation.started).toLocaleString(
                  navigator.language
                )}
              </option>
            )
          )}
        </StyledSelect>
        <Result result={simulationConfig.simulations[selectedSim]} />
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
  return (
    <div>
      <Accordion>
        {Object.values(simulationConfigs).map(
          (simulationConfig: TSimulationConfig, index: number) => (
            <Accordion.Item isExpanded={index === 0}>
              <Accordion.Header>
                {simulationConfig.name}
                {simulationConfig.published && (
                  <Chip variant="active">Published</Chip>
                )}
              </Accordion.Header>
              <Accordion.Panel>
                <SingleSimulationConfig
                  key={simulationConfig.name}
                  simulationConfig={simulationConfig}
                  dottedId={`${dottedId}.${index}`}
                  stask={stask}
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
