export enum OperationStatus {
  UPCOMING = 'Upcoming',
  ONGOING = 'Ongoing',
  CONCLUDED = 'Concluded',
}

export enum SimulationStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  FAILED = 'failed',
  COMPLETED = 'completed',
  UNKNOWN = 'unknown',
}

export enum ACLEnum {
  READ = 'READ',
  WRITE = 'WRITE',
  NONE = 'NONE',
}

export enum Blueprints {
  OPERATION = 'ForecastDS/FoR-BP/Blueprints/Operation',
  Comment = 'ForecastDS/FoR-BP/Blueprints/Comment',
  SIMULATION = 'ForecastDS/FoR-BP/Blueprints/Simulation',
  SIMULATION_CONFIG = 'ForecastDS/FoR-BP/Blueprints/SimulationConfig',
  VARIABLE = 'ForecastDS/FoR-BP/Blueprints/Variable',
  AZ_CONTAINER_JOB = 'DMT-Internal/DMT/AzureContainerInstanceJob',
  AZ_CRON_CONTAINER_JOB_CLASSIC = 'DMT-Internal/DMT/CronAzureContainerInstanceJobClassic',
  LOCATION = 'ForecastDS/FoR-BP/Blueprints/Location',
  STASK = 'ForecastDS/FoR-BP/Blueprints/STask',
  CONFIG = 'ForecastDS/FoR-BP/Blueprints/Config',
}
