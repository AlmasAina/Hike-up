import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from '../config/app-config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenCleanupService } from './token-cleanup.service';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        secret: config.env.JWT_SECRET,
        signOptions: { algorithm: 'HS256', issuer: 'hikeup-api', audience: 'hikeup-web' },
        verifyOptions: { algorithms: ['HS256'], issuer: 'hikeup-api', audience: 'hikeup-web' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, TokenCleanupService],
  exports: [AuthService, PasswordService, TokenService],
})
export class AuthModule {}
