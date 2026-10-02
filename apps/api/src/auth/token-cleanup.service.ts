import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { AppConfig } from '../config/app-config';
import { TokenService } from './token.service';

const SIX_HOURS = 6 * 60 * 60 * 1000;

/** Periodically purges expired tokens via the purge_expired_tokens() procedure. */
@Injectable()
export class TokenCleanupService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(TokenCleanupService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly tokens: TokenService,
    private readonly config: AppConfig,
  ) {}

  onModuleInit(): void {
    if (this.config.isTest) return;
    this.timer = setInterval(() => {
      this.tokens.purgeExpired().catch((e: Error) => this.logger.warn(`Token purge failed: ${e.message}`));
    }, SIX_HOURS);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
