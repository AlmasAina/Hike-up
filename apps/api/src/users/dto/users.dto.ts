import { RoleName, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { EmptyToNull, NormalizeEmail, Trim } from '../../common/utils/transforms';
import { IsPhone, PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../common/utils/validators';

const present = (_o: object, v: unknown) => v !== undefined && v !== null && v !== '';

export class UpdateProfileDto {
  @IsOptional() @Trim() @IsString() @IsNotEmpty() @MaxLength(80)
  firstName?: string;

  @IsOptional() @Trim() @IsString() @IsNotEmpty() @MaxLength(80)
  lastName?: string;

  @ValidateIf(present) @EmptyToNull() @IsPhone()
  phone?: string | null;

  @ValidateIf(present) @EmptyToNull() @IsPhone()
  whatsapp?: string | null;
}

export class CustomerQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}

export const BACKOFFICE_ROLE_NAMES = ['SUPER_ADMIN', 'ADMIN', 'STAFF'] as const;

export class CreateAdminUserDto {
  @NormalizeEmail() @IsEmail() @MaxLength(254)
  email: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(80)
  firstName: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(80)
  lastName: string;

  @IsIn(BACKOFFICE_ROLE_NAMES)
  role: RoleName;

  @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}

export class UpdateAdminUserDto {
  @IsOptional() @IsIn(BACKOFFICE_ROLE_NAMES)
  role?: RoleName;

  @IsOptional() @IsEnum(UserStatus)
  status?: UserStatus;
}
