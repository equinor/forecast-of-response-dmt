import { TLocation, TOperation, TConfig, TPhase, TSimulation } from '../Types'
import { OperationStatus } from '../Enums'

export const operationConfigs: TConfig[] = [
  {
    _id: 'njord-cfg',
    name: 'njord.json',
    simaVersion: '1.0.0',
  },
  {
    _id: 'gullfaks-cfg',
    name: 'gullfaks.json',
    simaVersion: '2.3.1-rc',
  },
]

export const operationLocations: TLocation[] = [
  {
    _id: 'njord',
    name: 'Njord',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Location',
    lat: 50.3,
    long: 5.3,
  },
  {
    _id: 'gullfaks',
    name: 'Gullfaks',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Location',
    lat: 50.3,
    long: 5.3,
  },
]

export const operations: Array<TOperation> = [
  {
    _id: 'draft1',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    name: 'draft #1',
    description: 'some draft',
    creator: 'moamu',
    start: new Date(),
    end: undefined,
    status: OperationStatus.ONGOING,
    location: operationLocations[0],
    phases: [
      {
        simulations: [
          {
            weatherDataId: '1',
            progress: 'Running',
            started: new Date(),
            ended: undefined,
            variables: {},
          },
        ],
        name: 'Phase 1',
        start: new Date(),
        end: undefined,
        status: OperationStatus.ONGOING,
        defaultVariables: {
          someValue: '0.001',
          anotherVal: 'fifteen',
        },
      },
    ],
    config: operationConfigs[1],
  },
  {
    _id: 'njordPipe1',
    type: 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
    name: 'NjordPipeChange2021',
    description: 'some draft',
    creator: 'moamu',
    start: new Date(),
    status: OperationStatus.UPCOMING,
    location: operationLocations[1],
    phases: [
      {
        simulations: [],
        name: 'Anchor lowering',
        status: OperationStatus.UPCOMING,
      },
    ],
    config: operationConfigs[0],
  },
]
