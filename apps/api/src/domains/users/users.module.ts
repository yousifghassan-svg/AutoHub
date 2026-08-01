import { Module } from '@nestjs/common';
import { R2Module } from '../../infrastructure/storage/r2.module';
import { UsersService } from './application/users.service';
import { UserRepository } from './infrastructure/user.repository';

/**
 * Users domain — identity profile storage and initialization.
 */
@Module({
  imports: [R2Module],
  providers: [UserRepository, UsersService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
