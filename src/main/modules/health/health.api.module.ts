import { Module } from '@nestjs/common';
import { HealthController } from '@presentation/api/controllers/health.controller';
import { HealthCoreModule } from '@main/modules/health/health.core.module';

@Module({
  imports: [HealthCoreModule],
  controllers: [HealthController],
})
export class HealthApiModule {}
