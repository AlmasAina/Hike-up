import { IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { Trim } from '../utils/transforms';

/** Keys created by StorageService for public assets always start with "public/". */
export const PUBLIC_KEY_REGEX = /^public\/[a-z0-9-]+\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

/** Reference to an image previously uploaded through POST /admin/uploads/image (or a static asset path). */
export class ImageRefDto {
  @IsString()
  @MaxLength(1024)
  @Matches(/^(https?:\/\/|\/)/, { message: 'url must be absolute or start with /' })
  url: string;

  @IsOptional()
  @Matches(PUBLIC_KEY_REGEX, { message: 'key is not a valid uploaded image key' })
  key?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
