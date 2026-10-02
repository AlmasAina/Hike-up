import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { AdminSettings, PublicSettings } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { imageMulterOptions, type UploadedImageFile } from '../storage/image-validation';
import { StorageService } from '../storage/storage.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

enum BrandAsset {
  logo = 'logo',
  favicon = 'favicon',
}

@ApiTags('Settings')
@Controller()
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly storage: StorageService,
  ) {}

  /** Public company & contact settings used by the website (no secrets). */
  @Public()
  @Get('settings')
  getPublic(): Promise<PublicSettings> {
    return this.settings.getPublic();
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @ManagerOnly()
  @Get('admin/settings')
  getAdmin(): Promise<AdminSettings> {
    return this.settings.getAll();
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @ManagerOnly()
  @Patch('admin/settings')
  update(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AdminSettings> {
    return this.settings.update(dto, user.id, meta);
  }

  /** Upload a new logo or favicon (JPEG/PNG/WEBP). */
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ManagerOnly()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @Post('admin/settings/:asset')
  @UseInterceptors(FileInterceptor('file', imageMulterOptions(1)))
  async uploadBrandAsset(
    @Param('asset', new ParseEnumPipe(BrandAsset)) asset: BrandAsset,
    @UploadedFile() file: UploadedImageFile,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AdminSettings> {
    const stored = await this.storage.uploadImage(file, 'brand');
    const key = asset === BrandAsset.logo ? 'logoUrl' : 'faviconUrl';
    return this.settings.update({ [key]: stored.url }, user.id, meta);
  }
}
