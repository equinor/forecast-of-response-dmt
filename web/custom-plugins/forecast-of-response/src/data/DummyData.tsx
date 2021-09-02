import { TLocation, TOperation, TOperationConfig } from '../Types'
import { OperationStatus } from '../Enums'

export const operationConfigs: TOperationConfig[] = [
  {
    _id: 'njord-cfg',
    name: 'njord.yml',
    image: 'none',
    phases: [],
  },
  {
    _id: 'gullfaks-cfg',
    name: 'gullfaks.yml',
    image: 'none',
    phases: [],
  },
]

export const operationLocations: TLocation[] = [
  {
    UTM: '10 S 055974, 4282182',
    name: 'Njord',
    _id: 'njord',
  },
  {
    UTM: '10 S 055974, 4282182',
    name: 'Gullfaks',
    _id: 'gullfaks',
  },
]

export const operations: Array<TOperation> = [
  {
    name: 'draft #1',
    start: 1631664000000,
    end: undefined,
    location: operationLocations[0],
    creator: 'moamu',
    status: OperationStatus.DRAFT,
    phases: [],
  },
  {
    name: 'NjordPipeChange2021',
    start: 1631664000000,
    end: undefined,
    location: operationLocations[1],
    creator: 'moamu',
    status: OperationStatus.UPCOMING,
    phases: [],
  },
  {
    name: 'GullfaksMaintenance2022',
    start: 1654041600000,
    end: 1669852800000,
    location: operationLocations[0],
    creator: 'moamu',
    status: OperationStatus.ONGOING,
    phases: [],
  },
  {
    name: 'SnorreAnchorReplace2021',
    start: 1609459200000,
    end: 1625097600000,
    location: operationLocations[0],
    creator: 'moamu',
    status: OperationStatus.ONGOING,
    phases: [],
  },
  {
    name: 'TrollWindFarmInstallation',
    start: 0,
    end: 34214400000,
    location: operationLocations[0],
    creator: 'moamu',
    status: OperationStatus.CONCLUDED,
    phases: [],
  },
]
