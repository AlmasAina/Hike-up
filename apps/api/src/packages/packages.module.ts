import { Module } from '@nestjs/common';
import { AdminPackagesController, PublicPackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  controllers: [PublicPackagesController, AdminPackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
