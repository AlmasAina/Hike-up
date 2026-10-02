import { PartialType } from '@nestjs/swagger';
import { TechnicianStatus } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PUBLIC_KEY_REGEX } from '../common/dto/image-ref.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { EmptyToNull, Trim } from '../common/utils/transforms';
import { IsPhone, PASSWORD_MESSAGE, PASSWORD_REGEX } from '../common/utils/validators';

const present = (_o: object, v: unknown) => v !== undefined && v !== null && v !== '';

export class CreateTechnicianDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(160)
  name: string;

  @ValidateIf(present) @EmptyToNull() @IsEmail() @MaxLength(254)
  email?: string | null;

  @ValidateIf(present) @EmptyToNull() @IsPhone()
  phone?: string | null;

  @ValidateIf(present) @EmptyToNull() @IsPhone()
  whatsapp?: string | null;

  /** Job title, e.g. "AC Technician" */
  @IsOptional() @EmptyToNull() @IsString() @MaxLength(80)
  role?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(60, { each: true })
  skills?: string[];

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(1024)
  imageUrl?: string | null;

  @IsOptional() @EmptyToNull() @Matches(PUBLIC_KEY_REGEX)
  imageKey?: string | null;

  @IsOptional() @IsEnum(TechnicianStatus)
  status?: TechnicianStatus;
}

export class UpdateTechnicianDto extends PartialType(CreateTechnicianDto) {}

/** Creates (or resets the password of) the technician's restricted STAFF login. */
export class TechnicianLoginDto {
  @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}

export class TechnicianQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(TechnicianStatus)
  status?: TechnicianStatus;
}
