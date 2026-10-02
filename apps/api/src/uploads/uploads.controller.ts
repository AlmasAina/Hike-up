import { Controller, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { AuditService } from '../audit/audit.service';
import { imageMulterOptions, type UploadedImageFile } from '../storage/image-validation';
import { StorageService } from '../storage/storage.service';

export const UPLOAD_FOLDERS = ['services', 'projects', 'testimonials', 'technicians', 'content', 'brand', 'packages'] as const;

class UploadQueryDto {
  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder: (typeof UPLOAD_FOLDERS)[number] = 'content';
}

@ApiTags('Admin · Uploads')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/uploads')
export class UploadsController {
  constructor(
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Upload a public website image (JPEG/PNG/WEBP, max 5 MB). Returns `{ key, url }` to store on the
   * related record (service, project, testimonial …).
   */
  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', imageMulterOptions(1)))
  async uploadImage(
    @UploadedFile() file: UploadedImageFile,
    @Query() query: UploadQueryDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<{ key: string; url: string; mimeType: string; size: number }> {
    const stored = await this.storage.uploadImage(file, query.folder, 'public');
    await this.audit.log({
      actorId: user.id,
      action: 'upload.created',
      entity: 'uploads',
      entityId: stored.key,
      meta,
      metadata: { folder: query.folder, size: stored.size, mimeType: stored.mimeType },
    });
    return stored;
  }
}
