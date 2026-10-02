import { PartialType } from '@nestjs/swagger';
import { PublishStatus, ServiceFeatureType } from '@prisma/client';
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
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ImageRefDto, PUBLIC_KEY_REGEX } from '../../common/dto/image-ref.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { EmptyToNull, Trim } from '../../common/utils/transforms';
import { SLUG_REGEX } from '../../common/utils/validators';

export class ServiceFeatureDto {
  @IsEnum(ServiceFeatureType)
  type: ServiceFeatureType;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(200)
  title: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(1000)
  description?: string | null;
}

export class ServiceFaqDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(300)
  question: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(4000)
  answer: string;
}

export class CreateServiceDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(160)
  title: string;

  /** Generated from the title when omitted */
  @IsOptional() @Trim() @Matches(SLUG_REGEX, { message: 'slug may only contain lowercase letters, numbers and dashes' }) @MaxLength(180)
  slug?: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(500)
  shortDescription: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(2000)
  introduction?: string | null;

  /** Rich text HTML — sanitised server side */
  @IsString() @MaxLength(50_000)
  description: string;

  /** Lucide icon name, e.g. "zap" */
  @IsOptional() @Trim() @Matches(/^[a-z0-9-]{1,64}$/)
  icon?: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(1024)
  imageUrl?: string | null;

  @IsOptional() @EmptyToNull() @Matches(PUBLIC_KEY_REGEX)
  imageKey?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(1024)
  ogImageUrl?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(160)
  seoTitle?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(320)
  seoDescription?: string | null;

  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;

  @IsOptional() @IsBoolean()
  featured?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  /** Replaces all benefits / coverage items / process steps when provided */
  @IsOptional() @IsArray() @ArrayMaxSize(60) @ValidateNested({ each: true }) @Type(() => ServiceFeatureDto)
  features?: ServiceFeatureDto[];

  /** Replaces all service FAQs when provided */
  @IsOptional() @IsArray() @ArrayMaxSize(30) @ValidateNested({ each: true }) @Type(() => ServiceFaqDto)
  faqs?: ServiceFaqDto[];

  /** Replaces the gallery when provided */
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => ImageRefDto)
  images?: ImageRefDto[];
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class ServiceQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;
}
