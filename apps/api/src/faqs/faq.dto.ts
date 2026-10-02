import { PartialType } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { EmptyToNull, Trim } from '../common/utils/transforms';

export class CreateFaqDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(300)
  question: string;

  @Trim() @IsString() @IsNotEmpty() @MaxLength(5000)
  answer: string;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(80)
  category?: string | null;

  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}

export class FaqQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(PublishStatus)
  status?: PublishStatus;

  @IsOptional() @IsString() @MaxLength(80)
  category?: string;
}
