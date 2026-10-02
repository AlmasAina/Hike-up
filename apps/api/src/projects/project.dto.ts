import { PartialType } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
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
import { ImageRefDto } from '../common/dto/image-ref.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { EmptyToNull, Trim } from '../common/utils/transforms';
import { SLUG_REGEX } from '../common/utils/validators';

export class CreateProjectDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(180)
  title: string;

  @IsOptional() @Trim() @Matches(SLUG_REGEX) @MaxLength(200)
  slug?: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(160)
  location?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(500)
  summary?: string | null;

  /** Rich text HTML — sanitised server side */
  @IsString() @MaxLength(50_000)
  description: string;

  /** Service category */
  @IsOptional() @EmptyToNull() @IsUUID()
  serviceId?: string | null;

  /** Completion date (YYYY-MM-DD) */
  @IsOptional() @EmptyToNull() @IsDateString()
  completedAt?: string | null;

  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  /** Replaces the gallery when provided (first image is the cover) */
  @IsOptional() @IsArray() @ArrayMaxSize(30) @ValidateNested({ each: true }) @Type(() => ImageRefDto)
  images?: ImageRefDto[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;

  /** Filter by service slug (public) */
  @IsOptional() @Matches(SLUG_REGEX)
  service?: string;
}
