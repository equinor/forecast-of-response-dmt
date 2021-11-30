import { TCronJob, TSimulation } from '../Types'
import { Blueprints } from '../Enums'
import { poorMansUUID } from './uuid'

export function createContainerJob(
  staskBlobId: string,
  workflow: string,
  targetId: string,
  cronJob?: TCronJob
): TSimulation {
  // window.crypto.randomUUID() is not supported in firefox yet.
  let newSim = {
    name: poorMansUUID(),
    type: Blueprints.AZ_CONTAINER_JOB,
    image: 'publicMSA.azurecr.io/dmt-job/srs:latest',
    command: [
      '/code/init.sh',
      `--stask=${staskBlobId}`,
      `--workflow=${workflow}`,
      '--input=ForecastDS/8ec0d646-907c-4eba-9e65-24106236d61c',
      `--target=${targetId}`,
    ],
  }

  // TODO: Get from envvars
  const OMNIA_CLASS_VARS = {
    subnetId: '123',
    logAnalyticsWorkspaceResourceId: '123',
  }

  if (cronJob)
    newSim = {
      ...newSim,
      ...cronJob,
      ...OMNIA_CLASS_VARS,
      type: Blueprints.AZ_CRON_CONTAINER_JOB_CLASSIC,
    }

  return newSim
}
