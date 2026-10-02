import path from 'node:path';
import { Logger } from '@nestjs/common';
import { config as loadEnv } from 'dotenv';

// Local development: read apps/api/.env first, then the monorepo root .env. Real environment
// variables (Docker, ECS task definitions, Secrets Manager) always take precedence.
loadEnv({ path: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../../.env')], quiet: true });

async function bootstrap(): Promise<void> {
  const { createApp } = await import('./bootstrap');
  const app = await createApp();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`API listening on http://localhost:${port}/api/v1`);
  if ((process.env.SWAGGER_ENABLED ?? 'true') !== 'false') logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
