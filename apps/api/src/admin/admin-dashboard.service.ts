import { Injectable } from '@nestjs/common';
import type { AdminDashboardStats } from '@hikeup/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<AdminDashboardStats> {
    const [customers, newRequests, pending, services, packages, projects, unreadContact, unreadRequestMessages, recent] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { roles: { some: { role: { name: 'CUSTOMER' } } } } }),
        this.prisma.quoteRequest.count({ where: { status: 'NEW', deletedAt: null } }),
        this.prisma.quoteRequest.count({ where: { status: { in: ['NEW', 'CONTACTED', 'QUOTED', 'IN_PROGRESS', 'APPROVED'] }, deletedAt: null } }),
        this.prisma.service.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
        this.prisma.package.count({ where: { active: true, deletedAt: null } }),
        this.prisma.project.count({ where: { deletedAt: null } }),
        this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
        this.prisma.requestMessage.count({ where: { fromStaff: false, readAt: null, request: { deletedAt: null } } }),
        this.prisma.quoteRequest.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            id: true,
            reference: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
            service: { select: { id: true, title: true, slug: true } },
          },
        }),
      ]);

    // Aggregations implemented as PostgreSQL functions (see database/migrations).
    const [byMonth, byService, growth] = await Promise.all([
      this.prisma.$queryRaw<{ month: string; count: bigint }[]>`SELECT * FROM quote_requests_by_month(12)`,
      this.prisma.$queryRaw<{ service: string; count: bigint }[]>`SELECT * FROM quote_requests_by_service(8)`,
      this.prisma.$queryRaw<{ month: string; count: bigint }[]>`SELECT * FROM customer_growth_by_month(12)`,
    ]);

    return {
      totals: {
        customers,
        newQuoteRequests: newRequests,
        pendingRequests: pending,
        activeServices: services,
        activePackages: packages,
        projects,
        unreadMessages: unreadContact + unreadRequestMessages,
      },
      requestsByMonth: byMonth.map((r) => ({ month: r.month, count: Number(r.count) })),
      requestsByService: byService.map((r) => ({ service: r.service, count: Number(r.count) })),
      customerGrowth: growth.map((r) => ({ month: r.month, count: Number(r.count) })),
      recentRequests: recent.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    };
  }
}
