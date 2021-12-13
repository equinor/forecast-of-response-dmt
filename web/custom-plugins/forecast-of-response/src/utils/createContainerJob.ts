import { TCronJob, TSimulation } from '../Types'
import { Blueprints } from '../Enums'
import { poorMansUUID } from './uuid'
import {
  AzureContainerInstancesOmniaLogAnalyticsWorkspaceResourceId,
  AzureContainerInstancesOmniaSubnetId,
} from '../const'

export function createContainerJob(
  staskBlobId: string,
  task: string,
  workflow: string,
  remoteRun?: boolean = false,
  computeServiceConfig?: string,
  inputId: string,
  targetId: string,
  cronJob?: TCronJob
): TSimulation {
  const runRemote: string[] = remoteRun
    ? ['--remote-run', `--compute-service-cfg=${computeServiceConfig}`]
    : []
  // window.crypto.randomUUID() is not supported in firefox yet.
  let newSim = {
    name: poorMansUUID(),
    type: Blueprints.AZ_CONTAINER_JOB_CLASSIC,
    image: 'publicMSA.azurecr.io/dmt-job/srs:latest',
    command: [
      '/code/init.sh',
      `--stask=${staskBlobId}`,
      `--task=${task}`,
      `--workflow=${workflow}`,
      `--input=${inputId}`,
      `--target=${targetId}`,
      ...runRemote,
    ],
    subnetId: AzureContainerInstancesOmniaSubnetId,
    logAnalyticsWorkspaceResourceId: AzureContainerInstancesOmniaLogAnalyticsWorkspaceResourceId,
  }

  if (cronJob)
    newSim = {
      ...newSim,
      ...cronJob,
      type: Blueprints.AZ_CRON_CONTAINER_JOB_CLASSIC,
    }

  return newSim
}
