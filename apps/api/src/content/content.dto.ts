import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { PUBLIC_KEY_REGEX } from '../common/dto/image-ref.dto';
import { EmptyToNull, Trim } from '../common/utils/transforms';

export class ContentItemDto {
  @Trim() @IsString() @IsNotEmpty() @MaxLength(200)
  title: string;

  @IsOptional() @Trim() @IsString() @MaxLength(1000)
  description?: string;

  @IsOptional() @Matches(/^[a-z0-9-]{1,64}$/)
  icon?: string;
}

export class UpdateContentSectionDto {
  @IsOptional() @EmptyToNull() @IsString() @MaxLength(200)
  title?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(500)
  subtitle?: string | null;

  /** Rich text HTML — sanitised server side */
  @IsOptional() @EmptyToNull() @IsString() @MaxLength(50_000)
  body?: string | null;

  @IsOptional() @EmptyToNull() @IsString() @MaxLength(1024)
  imageUrl?: string | null;

  @IsOptional() @EmptyToNull() @Matches(PUBLIC_KEY_REGEX)
  imageKey?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(24) @ValidateNested({ each: true }) @Type(() => ContentItemDto)
  items?: ContentItemDto[];
}
