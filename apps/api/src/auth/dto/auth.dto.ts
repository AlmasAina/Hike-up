import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { NormalizeEmail, Trim } from '../../common/utils/transforms';
import { IsPhone, PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../common/utils/validators';

export class RegisterDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(80)
  firstName: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(80)
  lastName: string;

  @NormalizeEmail() @IsEmail() @MaxLength(254)
  email: string;

  @Trim() @IsPhone()
  phone: string;

  @Trim() @IsOptional() @IsPhone()
  whatsapp?: string;

  @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}

export class LoginDto {
  @NormalizeEmail() @IsEmail() @MaxLength(254)
  email: string;

  @IsString() @MinLength(1) @MaxLength(128)
  password: string;
}

export class RefreshDto {
  /** Only needed by non-browser clients; browsers send the HTTP-only cookie automatically. */
  @IsOptional() @IsString() @MaxLength(200)
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @NormalizeEmail() @IsEmail() @MaxLength(254)
  email: string;
}

export class ResetPasswordDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  token: string;

  @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}

export class VerifyEmailDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  token: string;
}

export class ChangePasswordDto {
  @IsString() @MinLength(1) @MaxLength(128)
  currentPassword: string;

  @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword: string;
}
