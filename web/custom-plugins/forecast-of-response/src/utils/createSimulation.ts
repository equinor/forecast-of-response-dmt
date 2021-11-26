import { TCronJob, TSimulation } from '../Types'
import { Blueprints } from '../Enums'
import { poorMansUUID } from './uuid'

export function createSimulation(
  staskBlobId: string,
  workflow: string,
  targetId: string,
  cronJob?: TCronJob
): TSimulation {
  // window.crypto.randomUUID() is not supported in firefox yet.
  const simName = poorMansUUID()
  let newSim: TSimulation = {
    type: Blueprints.SIMULATION,
    name: simName,
    simaJob: {
      name: simName,
      type: Blueprints.AZ_CONTAINER_JOB,
      image: 'publicMSA.azurecr.io/dmt-job/srs:latest',
      command: [
        '/code/init.sh',
        `--stask=${staskBlobId}`,
        `--workflow=${workflow}`,
        '--input=ForecastDS/8ec0d646-907c-4eba-9e65-24106236d61c',
        `--target=${targetId}`,
      ],
    },
    started: new Date().toISOString(),
    progress: '0%',
    ended: '',
    result: {},
  }

  if (cronJob) {
    newSim.simaJob = {
      ...newSim.simaJob,
      ...cronJob,
      type: Blueprints.AZ_CRON_CONTAINER_JOB_CLASSIC,
    }
  }

  return newSim
}
