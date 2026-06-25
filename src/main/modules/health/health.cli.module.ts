import { Module } from '@nestjs/common';
import { HealthCommand } from '@presentation/cli/commands/health.command';
import { HealthCoreModule } from '@main/modules/health/health.core.module';

@Module({
  imports: [HealthCoreModule],
  providers: [HealthCommand],
})
export class HealthCliModule {}
