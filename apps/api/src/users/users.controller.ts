import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly, Roles } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { imageMulterOptions, type UploadedImageFile } from '../storage/image-validation';
import { CreateAdminUserDto, CustomerQueryDto, UpdateAdminUserDto, UpdateProfileDto, UpdateUserStatusDto } from './dto/users.dto';
import { UsersService } from './users.service';

@ApiTags('Account')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly users: UsersService) {}

  /** Update the signed-in user's name / phone / WhatsApp */
  @Patch('profile')
  updateProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto, @ReqMeta() meta: RequestMeta): Promise<AuthUser> {
    return this.users.updateProfile(user.id, dto, meta);
  }

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', imageMulterOptions(1)))
  updateAvatar(@CurrentUser() user: RequestUser, @UploadedFile() file: UploadedImageFile, @ReqMeta() meta: RequestMeta): Promise<AuthUser> {
    return this.users.updateAvatar(user.id, file, meta);
  }
}

@ApiTags('Admin · Customers')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query() query: CustomerQueryDto) {
    return this.users.listCustomers(query);
  }

  /** Customer details and their requests (passwords are never exposed) */
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.getCustomer(id);
  }

  /** Enable or disable a customer account */
  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<void> {
    return this.users.setCustomerStatus(id, dto.status, user.id, meta);
  }

  /** Email the customer a password reset link */
  @Post(':id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.users.sendCustomerPasswordReset(id, user.id, meta);
  }
}

@ApiTags('Admin · Admin Users')
@ApiBearerAuth()
@ApiCookieAuth()
@Roles('SUPER_ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query() query: CustomerQueryDto) {
    return this.users.listAdmins(query);
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<AuthUser> {
    return this.users.createAdmin(dto, user.id, meta);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AuthUser> {
    return this.users.updateAdmin(id, dto, user.id, meta);
  }
}
