import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaskModule } from '../modules/task/task.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'planning.db',
      autoLoadModels: true,
      synchronize: true,
    }),
    TaskModule,
  ],
})
export class AppModule {}
