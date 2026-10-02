import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { AdminDashboardStats } from '@hikeup/types';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin · Dashboard')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/dashboard')
export class AdminController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  /** KPI cards and chart series for the admin overview */
  @Get()
  stats(): Promise<AdminDashboardStats> {
    return this.dashboard.stats();
  }
}
