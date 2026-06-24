import { Controller, Get, Inject } from '@nestjs/common';
import type { HealthCheckPort } from '@application/ports/inbound/health/health-check.port';
import { HEALTH_CHECK_PORT } from '@application/ports/tokens';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_CHECK_PORT)
    private readonly healthCheckPort: HealthCheckPort,
  ) {}

  @Get()
  check() {
    return this.healthCheckPort.execute();
  }
}
