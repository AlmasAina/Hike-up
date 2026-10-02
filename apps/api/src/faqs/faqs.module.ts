import { Module } from '@nestjs/common';
import { AdminFaqsController, PublicFaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';

@Module({
  controllers: [PublicFaqsController, AdminFaqsController],
  providers: [FaqsService],
})
export class FaqsModule {}
