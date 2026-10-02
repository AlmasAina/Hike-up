import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsPhone } from '../../common/utils/validators';

const optionalUrl = (o: object, v: unknown) => v !== undefined && v !== '';

/** Partial update of site settings. Send only the fields that changed; "" clears optional values. */
export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(160) companyName?: string;
  @IsOptional() @IsString() @MaxLength(200) companyLegalName?: string;
  @IsOptional() @IsString() @MaxLength(200) tagline?: string;
  @IsOptional() @IsString() @MaxLength(1024) logoUrl?: string;
  @IsOptional() @IsString() @MaxLength(1024) faviconUrl?: string;

  @ValidateIf(optionalUrl) @IsEmail() @MaxLength(254) email?: string;
  @ValidateIf(optionalUrl) @IsPhone() phone?: string;
  @ValidateIf(optionalUrl) @IsPhone() whatsappNumber?: string;
  @IsOptional() @IsString() @MaxLength(500) whatsappMessage?: string;

  @IsOptional() @IsString() @MaxLength(300) location?: string;
  @IsOptional() @IsString() @MaxLength(160) workingHours?: string;

  @ValidateIf(optionalUrl) @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) facebookUrl?: string;
  @ValidateIf(optionalUrl) @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) instagramUrl?: string;
  @ValidateIf(optionalUrl) @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) linkedinUrl?: string;

  @IsOptional() @IsString() @MaxLength(1000) footerText?: string;
  @IsOptional() @IsString() @MaxLength(200) ctaTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) ctaText?: string;
  @IsOptional() @IsString() @MaxLength(160) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(320) seoDescription?: string;
  @IsOptional() @IsString() @MaxLength(200) googleSiteVerification?: string;

  @ValidateIf(optionalUrl)
  @Matches(/^(G|UA|GT)-[A-Z0-9-]{4,20}$/, { message: 'gaMeasurementId must look like G-XXXXXXX' })
  gaMeasurementId?: string;

  @IsOptional() @IsString() @MaxLength(80) licenceNumber?: string;
  @IsOptional() @IsBoolean() showLicenceNumber?: boolean;
  @ValidateIf(optionalUrl) @IsEmail() notificationEmail?: string;
}
