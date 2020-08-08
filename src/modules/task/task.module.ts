import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaskController } from './task.controller';
import { TaskModel } from './task.model';
import { TaskRepository } from './task.repository';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';

@Module({
  imports: [SequelizeModule.forFeature([TaskModel])],
  controllers: [TaskController],
  providers: [Logger, TaskRepository, NoteTaskUseCase],
})
export class TaskModule {}
