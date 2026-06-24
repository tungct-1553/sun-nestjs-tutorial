import {
  HealthCheckPort,
  HealthCheckResult,
} from '@application/ports/inbound/health/health-check.port';

export class CheckHealthUseCase implements HealthCheckPort {
  execute(): HealthCheckResult {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
