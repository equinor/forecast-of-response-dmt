import {
  TLocation,
  TOperation,
  TOperationConfig,
  TOperationPhase,
  TSimulationRun,
} from '../Types'
import { OperationStatus, PhaseStatus, SimulationStatus } from '../Enums'

export const operationConfigs: TOperationConfig[] = [
  {
    _id: 'njord-cfg',
    name: 'njord.json',
    image: 'none',
    phases: [
      {
        progress: PhaseStatus.ACTIVE,
        started: new Date().toLocaleDateString(),
        ended: '0',
        defaultVariables: [],
        simulationRuns: [
          {
            weatherDataId: '1',
            progress: SimulationStatus.RUNNING,
            started: new Date().toLocaleDateString(),
            ended: undefined,
            variables: [],
          },
        ],
      },
    ],
  },
  {
    _id: 'gullfaks-cfg',
    name: 'gullfaks.json',
    image: 'none',
    phases: [],
  },
]

export const operationLocations: TLocation[] = [
  {
    _id: 'njord',
    name: 'Njord',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Location',
    UTM: '10 S 055974, 4282182',
  },
  {
    _id: 'gullfaks',
    name: 'Gullfaks',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Location',
    UTM: '10 S 055974, 4282182',
  },
]

export const operations: Array<TOperation> = [
  {
    _id: 'draft1',
    name: 'draft #1',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    description: 'some draft',
    creator: 'moamu',
    location: operationLocations[0],
    start: 1631664000000,
    end: undefined,
    status: OperationStatus.DRAFT,
    config: operationConfigs[0],
  },
  {
    _id: 'njordPipe1',
    name: 'NjordPipeChange2021',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    description: 'some draft',
    creator: 'moamu',
    location: operationLocations[1],
    start: 1631664000000,
    end: undefined,
    status: OperationStatus.UPCOMING,
    config: operationConfigs[0],
  },
  {
    _id: 'gullfaksM2',
    name: 'GullfaksMaintenance2022',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    description: 'some draft',
    creator: 'moamu',
    start: 1654041600000,
    end: 1669852800000,
    location: operationLocations[1],
    status: OperationStatus.ONGOING,
    config: operationConfigs[0],
  },
  {
    _id: 'snorreOp',
    name: 'SnorreAnchorReplace2021',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    description: 'some draft',
    creator: 'moamu',
    location: operationLocations[0],
    start: 1609459200000,
    end: 1625097600000,
    status: OperationStatus.ONGOING,
    config: operationConfigs[1],
  },
  {
    _id: 'x',
    name: 'TrollWindFarmInstallation',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    description: 'some draft',
    creator: 'moamu',
    location: operationLocations[0],
    start: 0,
    end: 34214400000,
    status: OperationStatus.CONCLUDED,
    config: operationConfigs[1],
  },
]
