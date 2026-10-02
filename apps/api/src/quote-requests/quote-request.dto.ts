import { ContactMethod, PropertyType, QuoteStatus, RequestType } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { EmptyToNull, NormalizeEmail, ToBoolean, Trim } from '../common/utils/transforms';
import { IsPhone } from '../common/utils/validators';

/** Submitted as multipart/form-data together with up to 6 `images` files. */
export class CreateQuoteRequestDto {
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

  @Trim() @IsOptional() @IsUUID()
  serviceId?: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(200)
  location: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsEnum(ContactMethod)
  preferredContact: ContactMethod;

  @Trim() @IsString() @MinLength(10, { message: 'please describe the problem in at least 10 characters' }) @MaxLength(5000)
  description: string;

  @Trim() @IsOptional() @IsString() @MaxLength(3000)
  additionalNotes?: string;

  @IsOptional() @IsEnum(RequestType)
  type?: RequestType;

  /** Honeypot field — must stay empty (bots fill it) */
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class CustomerRequestQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(QuoteStatus)
  status?: QuoteStatus;
}

export class AdminRequestQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @IsOptional() @IsUUID()
  serviceId?: string;

  @IsOptional() @IsEnum(RequestType)
  type?: RequestType;

  /** ISO date (inclusive) */
  @IsOptional() @IsDateString()
  from?: string;

  /** ISO date (inclusive) */
  @IsOptional() @IsDateString()
  to?: string;

  /** Only requests assigned to the current staff member */
  @IsOptional() @ToBoolean()
  assignedToMe?: boolean;
}

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteStatus)
  status: QuoteStatus;

  /** Optional note shown to the customer in the request timeline */
  @IsOptional() @EmptyToNull() @IsString() @MaxLength(500)
  note?: string | null;
}

export class CreateNoteDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(5000)
  body: string;
}

export class CreateMessageDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(5000)
  body: string;
}

export class AssignTechnicianDto {
  @IsUUID()
  technicianId: string;
}
