import { PartialType } from '@nestjs/swagger';
import { FeatureAvailability } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EmptyToNull, Trim } from '../../common/utils/transforms';
import { HEX_COLOR_REGEX, SLUG_REGEX } from '../../common/utils/validators';

export class PackageFeatureDto {
  /** Link to a comparison table row. Omit for card-only bullet points. */
  @IsOptional() @IsUUID()
  comparisonRowId?: string | null;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(200)
  label: string;

  @IsEnum(FeatureAvailability)
  availability: FeatureAvailability;

  /** Custom text, e.g. "Yes – up to 20% of contract value" (required when availability = CUSTOM) */
  @IsOptional() @EmptyToNull() @IsString() @MaxLength(200)
  value?: string | null;

  @IsOptional() @IsBoolean()
  showOnCard?: boolean;
}

export class CreatePackageDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(80)
  name: string;

  @IsOptional() @Trim() @Matches(SLUG_REGEX) @MaxLength(100)
  slug?: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(2000)
  description?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(60)
  badge?: string | null;

  @IsOptional() @Matches(HEX_COLOR_REGEX, { message: 'color must be a hex colour such as #F5A800' })
  color?: string;

  /** e.g. "Annual contract" or "Monthly" */
  @IsOptional() @EmptyToNull() @IsString() @MaxLength(60)
  billingLabel?: string | null;

  /** Optional display price, e.g. "From AED …" — leave empty to show "Request a quote" */
  @IsOptional() @EmptyToNull() @IsString() @MaxLength(80)
  priceLabel?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(255)
  pricingNote?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(120)
  includedHours?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(160)
  sparePartsCoverage?: string | null;

  @IsOptional() @IsBoolean()
  freeLabour?: boolean;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(120)
  preventiveVisits?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(120)
  maintenanceVisits?: string | null;

  @IsOptional() @IsBoolean()
  featured?: boolean;

  @IsOptional() @IsBoolean()
  active?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  /** Replaces all features when provided */
  @IsOptional() @IsArray() @ArrayMaxSize(80) @ValidateNested({ each: true }) @Type(() => PackageFeatureDto)
  features?: PackageFeatureDto[];
}

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}

export class ComparisonRowDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(160)
  label: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(500)
  description?: string | null;

  @IsOptional() @EmptyToNull() @Matches(/^[a-z0-9-]{1,64}$/)
  icon?: string | null;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}

export class UpdateComparisonRowDto extends PartialType(ComparisonRowDto) {}
