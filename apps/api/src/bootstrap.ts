import path from 'node:path';
import { ClassSerializerInterceptor, ConsoleLogger, INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ACCESS_COOKIE } from './common/utils/cookies';
import { AppConfig } from './config/app-config';
import { validateEnv } from './config/env';

export const API_PREFIX = 'api/v1';

/** Applies global middleware/pipes. Shared by main.ts and the e2e test harness. */
export function configureApp(app: NestExpressApplication, config: AppConfig): void {
  const { env } = config;
  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');
  app.setGlobalPrefix(API_PREFIX, { exclude: ['uploads/*path'] });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Swagger UI needs inline styles; scripts stay same-origin.
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      stopAtFirstError: false,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (env.STORAGE_DRIVER === 'local') {
    // Only the public sub-folder is exposed. Private files are streamed by authorised endpoints.
    app.useStaticAssets(path.resolve(env.UPLOAD_DIR, 'public'), {
      prefix: '/uploads/public/',
      index: false,
      dotfiles: 'deny',
      maxAge: '7d',
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    });
  }
  app.enableShutdownHooks();
}

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('HIKE UP General Maintenance API')
      .setDescription(
        'REST API for the HIKE UP website, customer portal and admin dashboard. ' +
          'Browser clients authenticate with HTTP-only cookies; API clients can use the Bearer access token returned by /auth/login. ' +
          'There is no online booking or payment: customers submit quote, service and contact requests only.',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addCookieAuth(ACCESS_COOKIE)
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha', operationsSorter: 'alpha' },
  });
}

export async function createApp(): Promise<NestExpressApplication> {
  const env = validateEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({ json: env.LOG_FORMAT === 'json', prefix: 'HikeUpAPI' }),
    bodyParser: true,
  });
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { limit: '1mb', extended: true });
  const config = app.get(AppConfig);
  configureApp(app, config);
  if (env.SWAGGER_ENABLED) setupSwagger(app);
  return app;
}
