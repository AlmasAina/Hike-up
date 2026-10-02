import { PartialType } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { PUBLIC_KEY_REGEX } from '../common/dto/image-ref.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { EmptyToNull, Trim } from '../common/utils/transforms';

export class CreateTestimonialDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(160)
  company?: string | null;

  @IsInt() @Min(1) @Max(5)
  rating: number;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(3000)
  review: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(1024)
  imageUrl?: string | null;

  @IsOptional() @EmptyToNull() @Matches(PUBLIC_KEY_REGEX)
  imageKey?: string | null;

  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;

  /** Keep true for sample/placeholder reviews; set false for genuine customer reviews */
  @IsOptional() @IsBoolean()
  isSample?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

export class TestimonialQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;
}
