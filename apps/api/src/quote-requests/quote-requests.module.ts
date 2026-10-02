import { Module } from '@nestjs/common';
import {
  AdminQuoteRequestsController,
  CustomerQuoteRequestsController,
  FilesController,
  PublicQuoteRequestsController,
} from './quote-requests.controller';
import { QuoteRequestsService } from './quote-requests.service';

@Module({
  controllers: [
    PublicQuoteRequestsController,
    CustomerQuoteRequestsController,
    AdminQuoteRequestsController,
    FilesController,
  ],
  providers: [QuoteRequestsService],
})
export class QuoteRequestsModule {}
