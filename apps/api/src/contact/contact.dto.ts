import { ContactMessageStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { NormalizeEmail, Trim } from '../common/utils/transforms';
import { IsPhone } from '../common/utils/validators';

export class CreateContactMessageDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(160)
  name: string;

  @NormalizeEmail() @IsEmail() @MaxLength(254)
  email: string;

  @Trim() @IsOptional() @IsPhone()
  phone?: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(200)
  subject: string;

  @Trim() @IsString() @MinLength(10) @MaxLength(5000)
  message: string;

  /** Honeypot — must stay empty */
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class ContactQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;
}

export class UpdateContactMessageDto {
  @IsEnum(ContactMessageStatus)
  status: ContactMessageStatus;
}
