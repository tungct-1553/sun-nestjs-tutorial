import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HealthCheckPort } from '@application/ports/inbound/health/health-check.port';
import { HEALTH_CHECK_PORT } from '@application/ports/tokens';
import { HealthResponseDto } from '@presentation/api/dtos/common/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_CHECK_PORT)
    private readonly healthCheckPort: HealthCheckPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthResponseDto })
  check(): HealthResponseDto {
    return this.healthCheckPort.execute();
  }
}
