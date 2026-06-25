import { Inject } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import type { HealthCheckPort } from '@application/ports/inbound/health/health-check.port';
import { HEALTH_CHECK_PORT } from '@application/ports/tokens';

@Command({
  name: 'health',
  description: 'Check application health',
})
export class HealthCommand extends CommandRunner {
  constructor(
    @Inject(HEALTH_CHECK_PORT)
    private readonly healthCheckPort: HealthCheckPort,
  ) {
    super();
  }

  run(): Promise<void> {
    const result = this.healthCheckPort.execute();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return Promise.resolve();
  }
}
