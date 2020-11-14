import { Module } from '@nestjs/common';
import { TaskModule } from '../modules/task/task.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [TaskModule, UsersModule],
})
export class AppModule {}
