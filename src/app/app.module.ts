import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from '../modules/task/task.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TaskModule, UsersModule],
})
export class AppModule {}
