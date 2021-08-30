import { TLocation, TOperation } from '../Types'
import { OperationStatus } from '../Enums'

export const dummyLocations: Record<string, TLocation> = {
  gullfaks: {
    _id: 'gullfaks',
    name: 'Gullfaks',
    UTM: '10 S 055974, 4282182',
  },
  troll: {
    _id: 'troll',
    name: 'Troll',
    UTM: '10 S 055974, 4282182',
  },
  njord: {
    _id: 'njord',
    name: 'njord',
    UTM: '10 S 055974, 4282182',
  },
}

export const dummyOperations: Array<TOperation> = [
  {
    name: 'draft #1',
    start: 1631664000000,
    end: undefined,
    location: dummyLocations.gullfaks,
    creator: 'moamu',
    status: OperationStatus.DRAFT,
    phases: [],
  },
  {
    name: 'NjordPipeChange2021',
    start: 1631664000000,
    end: undefined,
    location: dummyLocations.njord,
    creator: 'moamu',
    status: OperationStatus.UPCOMING,
    phases: [],
  },
  {
    name: 'GullfaksMaintenance2022',
    start: 1654041600000,
    end: 1669852800000,
    location: dummyLocations.gullfaks,
    creator: 'moamu',
    status: OperationStatus.IN_PROGRESS,
    phases: [],
  },
  {
    name: 'SnorreAnchorReplace2021',
    start: 1609459200000,
    end: 1625097600000,
    location: dummyLocations.gullfaks,
    creator: 'moamu',
    status: OperationStatus.IN_PROGRESS,
    phases: [],
  },
  {
    name: 'TrollWindFarmInstallation',
    start: 0,
    end: 34214400000,
    location: dummyLocations.troll,
    creator: 'moamu',
    status: OperationStatus.CONCLUDED,
    phases: [],
  },
]
