import { Module } from '@nestjs/common';
import { AdminLegalController, PublicLegalController } from './legal.controller';
import { LegalService } from './legal.service';

@Module({
  controllers: [PublicLegalController, AdminLegalController],
  providers: [LegalService],
})
export class LegalModule {}
