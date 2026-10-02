import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  MAX_QUOTE_IMAGES,
  type AdminQuoteRequest,
  type CustomerDashboardStats,
  type CustomerQuoteRequest,
  type Paginated,
  type RequestMessage,
} from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { BackOffice, ManagerOnly, Roles } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { imageMulterOptions, type UploadedImageFile } from '../storage/image-validation';
import { StorageService } from '../storage/storage.service';
import {
  AdminRequestQueryDto,
  AssignTechnicianDto,
  CreateMessageDto,
  CreateNoteDto,
  CreateQuoteRequestDto,
  CustomerRequestQueryDto,
  UpdateQuoteStatusDto,
} from './quote-request.dto';
import { QuoteRequestsService } from './quote-requests.service';

const multipartSchema = {
  schema: {
    type: 'object',
    properties: {
      images: { type: 'array', items: { type: 'string', format: 'binary' } },
    },
  },
};

@ApiTags('Quote Requests')
@Controller('quote-requests')
export class PublicQuoteRequestsController {
  constructor(private readonly requests: QuoteRequestsService) {}

  /**
   * Submit a quote / service request (multipart/form-data). Optional `images` (max 6, JPEG/PNG/WEBP,
   * 5 MB each). Signed-in customers get the request linked to their account automatically.
   * This does NOT create a booking — the team contacts the customer.
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: CreateQuoteRequestDto })
  @UseInterceptors(FilesInterceptor('images', MAX_QUOTE_IMAGES, imageMulterOptions(MAX_QUOTE_IMAGES)))
  create(
    @Body() dto: CreateQuoteRequestDto,
    @UploadedFiles() files: UploadedImageFile[] | undefined,
    @CurrentUser() user: RequestUser | undefined,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.requests.create(dto, files ?? [], user, meta);
  }
}

@ApiTags('Customer')
@ApiBearerAuth()
@ApiCookieAuth()
@Roles('CUSTOMER')
@Controller('customer')
export class CustomerQuoteRequestsController {
  constructor(private readonly requests: QuoteRequestsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: RequestUser): Promise<CustomerDashboardStats> {
    return this.requests.customerDashboard(user.id);
  }

  @Get('quote-requests')
  list(@CurrentUser() user: RequestUser, @Query() query: CustomerRequestQueryDto): Promise<Paginated<CustomerQuoteRequest>> {
    return this.requests.customerList(user.id, query);
  }

  @Get('quote-requests/:id')
  get(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string): Promise<CustomerQuoteRequest> {
    return this.requests.customerGet(user.id, id);
  }

  /** Upload additional photos to an existing request */
  @Post('quote-requests/:id/images')
  @ApiConsumes('multipart/form-data')
  @ApiBody(multipartSchema)
  @UseInterceptors(FilesInterceptor('images', MAX_QUOTE_IMAGES, imageMulterOptions(MAX_QUOTE_IMAGES)))
  addImages(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: UploadedImageFile[] | undefined,
    @ReqMeta() meta: RequestMeta,
  ): Promise<CustomerQuoteRequest> {
    return this.requests.customerAddImages(user, id, files ?? [], meta);
  }

  /** Conversation threads (one per request) */
  @Get('messages')
  threads(@CurrentUser() user: RequestUser) {
    return this.requests.customerThreads(user.id);
  }

  @Get('quote-requests/:id/messages')
  messages(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string): Promise<RequestMessage[]> {
    return this.requests.customerMessages(user.id, id);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('quote-requests/:id/messages')
  sendMessage(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
    @ReqMeta() meta: RequestMeta,
  ): Promise<RequestMessage> {
    return this.requests.customerSendMessage(user, id, dto.body, meta);
  }
}

@ApiTags('Admin · Quote Requests')
@ApiBearerAuth()
@ApiCookieAuth()
@BackOffice()
@Controller('admin/quote-requests')
export class AdminQuoteRequestsController {
  constructor(private readonly requests: QuoteRequestsService) {}

  /** STAFF users only see requests assigned to them. */
  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: AdminRequestQueryDto) {
    return this.requests.adminList(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string): Promise<AdminQuoteRequest> {
    return this.requests.adminGet(user, id);
  }

  /** Change status: NEW → CONTACTED → IN_PROGRESS → QUOTED → APPROVED / REJECTED → COMPLETED */
  @Patch(':id')
  updateStatus(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuoteStatusDto,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AdminQuoteRequest> {
    return this.requests.updateStatus(user, id, dto, meta);
  }

  /** Internal note (never visible to the customer) */
  @Post(':id/notes')
  addNote(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateNoteDto,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AdminQuoteRequest> {
    return this.requests.addNote(user, id, dto.body, meta);
  }

  /** Reply to the customer (visible in their dashboard + emailed) */
  @Post(':id/messages')
  reply(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AdminQuoteRequest> {
    return this.requests.staffSendMessage(user, id, dto.body, meta);
  }

  @ManagerOnly()
  @Post(':id/assignments')
  assign(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTechnicianDto,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AdminQuoteRequest> {
    return this.requests.assign(user, id, dto.technicianId, meta);
  }

  @ManagerOnly()
  @Delete(':id/assignments/:technicianId')
  unassign(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('technicianId', ParseUUIDPipe) technicianId: string,
    @ReqMeta() meta: RequestMeta,
  ): Promise<AdminQuoteRequest> {
    return this.requests.unassign(user, id, technicianId, meta);
  }

  @ManagerOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.requests.remove(user, id, meta);
  }
}

@ApiTags('Files')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('files')
export class FilesController {
  constructor(
    private readonly requests: QuoteRequestsService,
    private readonly storage: StorageService,
  ) {}

  /** Private request photo — owner customer, admins and assigned staff only. */
  @Get('quote-images/:id')
  async quoteImage(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { key, mimeType } = await this.requests.authoriseImage(user, id);
    const signed = await this.storage.getPrivateUrl(key, 300);
    res.setHeader('Cache-Control', 'private, max-age=300');
    if (signed) return res.redirect(302, signed);
    const buffer = await this.storage.read(key);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    res.send(buffer);
  }
}
