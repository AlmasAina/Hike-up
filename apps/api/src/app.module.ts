import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CsrfOriginMiddleware } from './common/middleware/csrf-origin.middleware';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { AppConfig } from './config/app-config';
import { ConfigModule } from './config/config.module';
import { ContactModule } from './contact/contact.module';
import { ContentModule } from './content/content.module';
import { FaqsModule } from './faqs/faqs.module';
import { HealthModule } from './health/health.module';
import { LegalModule } from './legal/legal.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PackagesModule } from './packages/packages.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { QuoteRequestsModule } from './quote-requests/quote-requests.module';
import { ServicesModule } from './services/services.module';
import { SettingsModule } from './settings/settings.module';
import { StorageModule } from './storage/storage.module';
import { TechniciansModule } from './technicians/technicians.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        throttlers: [{ ttl: config.env.THROTTLE_TTL_SECONDS * 1000, limit: config.env.THROTTLE_LIMIT }],
        skipIf: () => config.isTest,
      }),
    }),
    PrismaModule,
    AuditModule,
    MailModule,
    StorageModule,
    SettingsModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    PackagesModule,
    ProjectsModule,
    TestimonialsModule,
    FaqsModule,
    ContentModule,
    LegalModule,
    QuoteRequestsModule,
    ContactModule,
    TechniciansModule,
    UploadsModule,
    AdminModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Order matters: rate limit → authenticate → authorise
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware, CsrfOriginMiddleware).forRoutes('*path');
  }
}
