import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthResponse, AuthUser } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import type { RequestUser } from '../common/types/request-user';
import { REFRESH_COOKIE } from '../common/utils/cookies';
import { AppConfig } from '../config/app-config';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import type { IssuedTokens } from './token.service';

const STRICT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AppConfig,
  ) {}

  private respond(res: Response, user: AuthUser, tokens: IssuedTokens): AuthResponse {
    setAuthCookies(res, tokens, this.config);
    return { user, accessToken: tokens.accessToken, expiresIn: tokens.accessExpiresIn };
  }

  private refreshTokenFrom(req: Request, dto?: RefreshDto): string | undefined {
    const cookies = req.cookies as Record<string, string> | undefined;
    return cookies?.[REFRESH_COOKIE] ?? dto?.refreshToken;
  }

  /** Create a customer account. Sets HTTP-only session cookies. */
  @Public()
  @Throttle(STRICT)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { user, tokens } = await this.auth.register(dto, meta);
    return this.respond(res, user, tokens);
  }

  @Public()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { user, tokens } = await this.auth.login(dto, meta);
    return this.respond(res, user, tokens);
  }

  /** Rotate the refresh token and issue a new access token. */
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    try {
      const { user, tokens } = await this.auth.refresh(this.refreshTokenFrom(req, dto), meta);
      return this.respond(res, user, tokens);
    } catch (error) {
      clearAuthCookies(res, this.config);
      throw error;
    }
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @CurrentUser() user: RequestUser | undefined,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.logout(this.refreshTokenFrom(req, dto), user?.id, meta);
    clearAuthCookies(res, this.config);
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Get('me')
  me(@CurrentUser() user: RequestUser): Promise<AuthUser> {
    return this.auth.me(user.id);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Always succeeds to prevent account enumeration' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @ReqMeta() meta: RequestMeta): Promise<{ message: string }> {
    await this.auth.forgotPassword(dto.email, meta);
    return { message: 'If an account exists for this email, a reset link has been sent.' };
  }

  @Public()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @ReqMeta() meta: RequestMeta): Promise<{ message: string }> {
    await this.auth.resetPassword(dto, meta);
    return { message: 'Your password has been updated. You can now sign in.' };
  }

  @Public()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    await this.auth.verifyEmail(dto.token);
    return { message: 'Email verified successfully.' };
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(@CurrentUser() user: RequestUser): Promise<{ message: string }> {
    await this.auth.resendVerification(user.id);
    return { message: 'Verification email sent.' };
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.auth.changePassword(user.id, dto, meta);
    clearAuthCookies(res, this.config);
    return { message: 'Password changed. Please sign in again.' };
  }
}
