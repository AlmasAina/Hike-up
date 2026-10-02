import { Module } from '@nestjs/common';
import { AccountController, AdminCustomersController, AdminUsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [AccountController, AdminCustomersController, AdminUsersController],
  providers: [UsersService],
})
export class UsersModule {}
