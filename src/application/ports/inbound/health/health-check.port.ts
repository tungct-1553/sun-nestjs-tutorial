export interface HealthCheckResult {
  status: 'ok';
  timestamp: string;
}

export interface HealthCheckPort {
  execute(): HealthCheckResult;
}
