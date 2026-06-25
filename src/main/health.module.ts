import { Module } from '@nestjs/common';
import { CheckHealthUseCase } from '@application/use-cases/health/check-health.use-case';
import { HEALTH_CHECK_PORT } from '@application/ports/tokens';
import { HealthController } from '@presentation/controllers/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: HEALTH_CHECK_PORT,
      useClass: CheckHealthUseCase,
    },
  ],
})
export class HealthModule {}
