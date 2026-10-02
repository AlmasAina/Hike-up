import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Paginated, Testimonial } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { CreateTestimonialDto, TestimonialQueryDto, UpdateTestimonialDto } from './testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@ApiTags('Testimonials')
@Controller('testimonials')
export class PublicTestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Public()
  @Get()
  list(): Promise<Testimonial[]> {
    return this.testimonials.listPublished();
  }
}

@ApiTags('Admin · Testimonials')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/testimonials')
export class AdminTestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get()
  list(@Query() query: TestimonialQueryDto): Promise<Paginated<Testimonial>> {
    return this.testimonials.adminList(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Testimonial> {
    return this.testimonials.adminGet(id);
  }

  @Post()
  create(@Body() dto: CreateTestimonialDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<Testimonial> {
    return this.testimonials.create(dto, user.id, meta);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestimonialDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<Testimonial> {
    return this.testimonials.update(id, dto, user.id, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.testimonials.remove(id, user.id, meta);
  }
}
