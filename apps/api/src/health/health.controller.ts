import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Liveness + database readiness check used by Docker / ECS / ALB health checks */
  @Public()
  @Get()
  async check(): Promise<{ status: 'ok'; database: 'up'; uptime: number; timestamp: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
    return { status: 'ok', database: 'up', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() };
  }
}
