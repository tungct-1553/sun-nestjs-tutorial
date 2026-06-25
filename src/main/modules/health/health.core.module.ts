import { Module } from '@nestjs/common';
import { CheckHealthUseCase } from '@application/use-cases/health/check-health.use-case';
import { HEALTH_CHECK_PORT } from '@application/ports/tokens';

@Module({
  providers: [
    {
      provide: HEALTH_CHECK_PORT,
      useClass: CheckHealthUseCase,
    },
  ],
  exports: [HEALTH_CHECK_PORT],
})
export class HealthCoreModule {}
