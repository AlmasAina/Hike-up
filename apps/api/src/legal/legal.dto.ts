import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../common/utils/transforms';

export class UpdateLegalPageDto {
  @IsOptional() @Trim() @IsString() @IsNotEmpty() @MaxLength(160)
  title?: string;

  /** Rich text HTML — sanitised server side */
  @IsOptional() @IsString() @MaxLength(200_000)
  content?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;
}
