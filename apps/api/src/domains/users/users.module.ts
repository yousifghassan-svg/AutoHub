import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UserRepository } from './infrastructure/user.repository';

/**
 * Users domain — identity profile storage and initialization.
 * No public CRUD controllers in Sprint 3.
 */
@Module({
  providers: [UserRepository, UsersService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
