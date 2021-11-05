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
  OPERATION = 'ForecastDS/ForecastOfResponse/Blueprints/Operation',
  Comment = 'ForecastDS/ForecastOfResponse/Blueprints/Comment',
  SIMULATION = 'ForecastDS/ForecastOfResponse/Blueprints/Simulation',
  AZ_CONTAINER_JOB = 'DMT-Internal/DMT/AzureContainerInstanceJob',
  LOCATION = 'ForecastDS/ForecastOfResponse/Blueprints/Location',
  STASK = 'ForecastDS/ForecastOfResponse/Blueprints/STask',
  CONFIG = 'ForecastDS/ForecastOfResponse/Blueprints/Config',
}
