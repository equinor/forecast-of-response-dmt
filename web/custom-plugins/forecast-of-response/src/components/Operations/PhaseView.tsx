import React, { useContext, useState } from 'react'
import { TPhase, TSimulation, TSimulationConfig, TStask } from '../../Types'
import {
  Button,
  Divider,
  Input,
  Table,
  TextField,
  Progress,
} from '@equinor/eds-core-react'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'
import JobApi from '../../utils/JobApi'
import { AuthContext, DmssAPI } from '@dmt/common'
import { DEFAULT_DATASOURCE_ID } from '../../const'
import { Blueprints } from '../../Enums'

const Wrapper = styled.div`
  border: darkgrey 1px solid;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  box-shadow: darkgrey 0 2px 8px 2px;
  margin: 20px;
`
const ResultWrapper = styled.div`
  border: darkgrey 1px solid;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
`

const SimulationRow = styled.div`
  font-size: 18px;
  padding: 5px;
  border: darkgrey 1px solid;
  cursor: pointer;
  display: flex;
  flex-direction: row;

  &:hover {
    background-color: lightsteelblue;
  }

  background-color: ${(props) => {
    if (props.selected) return 'lightsteelblue'
    if (props.even) return '#F7F7F7'
    return 'inherit'
  }};
`

function NewSimulationConfig(props: { defaultVars: any }) {
  const { defaultVars } = props
  const [variables, setVariables] = useState<any>(defaultVars)
  const [simConfigName, setSimConfigName] = useState<string>('New Simulation')
  return (
    <>
      <h3>New simulation configuration</h3>
      <Wrapper>
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
          <Button>Create (does nothing)</Button>
        </div>
      </Wrapper>
    </>
  )
}

function Result(props: { result: any }) {
  const { result } = props
  return <pre>{JSON.stringify(result, null, 2)}</pre>
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
      <Wrapper>
        <h3 style={{ margin: '10px' }}>{simulationConfig.name}</h3>
        <div style={{ display: 'flex' }}>
          <Table>
            <Table.Head sticky>
              <Table.Row>
                <Table.Cell>SIMA Variable</Table.Cell>
                <Table.Cell>Value</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {simulationConfig.variables.map(
                (variableString: string, index) => {
                  const [key, value] = variableString.split('=')
                  return (
                    <Table.Row key={index}>
                      <Table.Cell>{key}</Table.Cell>
                      <Table.Cell>{value}</Table.Cell>
                    </Table.Row>
                  )
                }
              )}
            </Table.Body>
          </Table>
          <ResultWrapper>
            {!simulationConfig.simulations.length && (
              <>No simulations has been run</>
            )}
            {simulationConfig.simulations.map(
              (simulation: TSimulation, index: number) => (
                <SimulationRow
                  key={index}
                  even={index % 2 === 0}
                  selected={index === selectedSim}
                  onClick={() => setSelectedSim(index)}
                >
                  <div>
                    {new Date(simulation.started).toLocaleString(
                      navigator.language
                    )}
                  </div>
                  <b style={{ marginLeft: '10px' }}>{simulation.progress}</b>
                </SimulationRow>
              )
            )}
          </ResultWrapper>
          <ResultWrapper>
            <Result result={simulationConfig.simulations[selectedSim]} />
          </ResultWrapper>
        </div>
        <div>
          <Button onClick={() => startJob()}>Run test sim</Button>
          {loadingJob && <Progress.Linear />}
        </div>
      </Wrapper>
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
      {Object.values(simulationConfigs).map(
        (simulationConfig: TSimulationConfig, index: number) => (
          <SingleSimulationConfig
            key={simulationConfig.name}
            simulationConfig={simulationConfig}
            dottedId={`${dottedId}.${index}`}
            stask={stask}
          />
        )
      )}
    </div>
  )
}

export default (props: {
  phase: TPhase
  dottedId: string
  stask: TStask
}): JSX.Element => {
  const { phase, dottedId, stask } = props
  return (
    <>
      <NewSimulationConfig
        defaultVars={{ WaveHeight: 1.12, WaveDirection: 90 }}
      />
      <Divider />
      <SimulationConfigList
        simulationConfigs={phase.simulationConfigs}
        dottedId={`${dottedId}.simulationConfigs`}
        stask={stask}
      />
    </>
  )
}
