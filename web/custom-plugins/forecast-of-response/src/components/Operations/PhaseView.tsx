import React, {useContext, useState} from 'react'
import {TPhase, TSimulation, TSimulationConfig, TStask, TVariable} from '../../Types'
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
import {NotificationManager} from 'react-notifications'
import styled from 'styled-components'
import JobApi from '../../utils/JobApi'
import {AuthContext, DmssAPI} from '@dmt/common'
import {DEFAULT_DATASOURCE_ID} from '../../const'
import {Blueprints} from '../../Enums'
import {lightGray, primaryGray} from '../Design/Colors'
import {StyledSelect} from '../Input'
import Result from '../Result'
import Icon from '../Design/Icons'

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

function NewSimulationConfig(props: { defaultVars: TVariable[], dottedId: string, stask: TStask }) {
    const {defaultVars, dottedId, stask} = props
    const [variables, setVariables] = useState<TVariable[]>(defaultVars)
    const [simConfigName, setSimConfigName] = useState<string>('New Simulation')
    const [creatingJob, setCreatingJob] = useState<boolean>(false)
    const {token} = useContext(AuthContext)
    const dmssAPI = new DmssAPI(token)


    function createSimulation(variables: TVariable[]) {
        setCreatingJob(true)
        // Create the simulation entity
        dmssAPI.generatedDmssApi
            .explorerAdd({
                dataSourceId: DEFAULT_DATASOURCE_ID,
                dottedId: `${dottedId}`,
                body: {
                    type: Blueprints.SIMULATION_CONFIG,
                    name: simConfigName,
                    variables: variables
                }
            })
        setCreatingJob(false)
    }


    return (
        <>
            <TextField
                id="simulation-name"
                placeholder="Label your simulation config"
                style={{borderRadius: '5px', margin: '10px', width: 'inherit'}}
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
                                    onChange={(event: Event) =>
                                    {console.log(event)
                                        variables[index].value = event.target.value
                                        setVariables([
                                            ...variables,
                                        ])
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
                <Button
                    variant="outlined"
                    color="danger"
                    onClick={() => setVariables(defaultVars)}
                >
                    Reset
                </Button>
                <Button
                    onClick={() => createSimulation(variables)}
                >
                    Create simulation</Button>
                {creatingJob && <Progress.Linear/>}
            </div>
        </>
    )
}

function SingleSimulationConfig(props: {
    simulationConfig: TSimulationConfig
    dottedId: string
    stask: TStask
}) {
    const {simulationConfig, dottedId, stask} = props
    const [selectedSim, setSelectedSim] = useState<number>(0)
    const [loadingJob, setLoadingJob] = useState<boolean>(false)
    const [showSummary, setShowSummary] = useState<boolean>(false)
    const {token} = useContext(AuthContext)
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
        <div
            style={{display: 'flex', flexDirection: 'column', position: 'relative'}}
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
                        <Icon name="last_page" size={24}/>
                    ) : (
                        <Icon name="first_page" size={24}/>
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
                <div style={{width: '20px'}}></div>
                <StyledHeaderButton disabled>
                    Publish this simulation (Not implemented)
                </StyledHeaderButton>
            </SimHeaderWrapper>
            {loadingJob && <Progress.Linear/>}
            <div
                style={{padding: '16px', display: 'flex', flexDirection: 'column'}}
            >
                <label>Select which simulation to view</label>
                <StyledSelect
                    onChange={(e: Event) => {
                        setSelectedSim(parseInt(e.target.value))
                    }}
                >
                    {simulationConfig.simulations.map(
                        (simulation: TSimulation, index) => (
                            <option
                                key={index}
                                value={index}
                                onSelect={() => setSelectedSim(index)}
                            >
                                {new Date(simulation.started).toLocaleString(
                                    navigator.language
                                )}
                            </option>
                        )
                    )}
                </StyledSelect>
                {simulationConfig.simulations[selectedSim]?.result._id ? (
                    <Result result={simulationConfig.simulations[selectedSim]?.result}/>
                ) : (
                    <div style={{alignSelf: 'center'}}>
                        <label>No result for this simulation...</label>
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
    const {simulationConfigs, dottedId, stask} = props
    return (
        <div>
            <Accordion>
                {Object.values(simulationConfigs).map(
                    (simulationConfig: TSimulationConfig, index: number) => (
                        <Accordion.Item key={index} isExpanded={index === 0}>
                            <Accordion.Header>
                                {simulationConfig.name}
                                {simulationConfig.published && (
                                    <Chip variant="active">Published</Chip>
                                )}
                            </Accordion.Header>
                            <Accordion.Panel style={{padding: '0'}}>
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
    const {phase, dottedId, stask} = props
    const [visibleCreateSimScrim, setVisibleCreateSimScrim] = useState(false)
    return (
        <>
            <div style={{display: 'flex', flexFlow: 'row-reverse'}}>
                <Button onClick={() => setVisibleCreateSimScrim(true)}>
                    Create new simulation
                </Button>
            </div>
            {visibleCreateSimScrim && (
                <Scrim onClose={() => setVisibleCreateSimScrim(false)} isDismissable>
                    <div style={{backgroundColor: '#fff', padding: '1rem'}}>
                        Create new simulation
                        <NewSimulationConfig
                            defaultVars={phase.defaultVariables}
                            dottedId={`${dottedId}.simulationConfigs`}
                            stask={stask}
                        />
                        <Button onClick={() => setVisibleCreateSimScrim(false)}>
                            Close
                        </Button>
                    </div>
                </Scrim>
            )}

            <Divider/>
            <SimulationConfigList
                simulationConfigs={phase.simulationConfigs}
                dottedId={`${dottedId}.simulationConfigs`}
                stask={stask}
            />
        </>
    )
}
