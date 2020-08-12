import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { AppError } from '../../shared/core';
import { TaskDto } from './task.dto';
import { TaskMapper } from './task.mapper';
import { GetAllTasksUseCase } from './use-cases/get-all-tasks/get-all-tasks.use-case';
import { NoteTaskDto } from './use-cases/note-task/note-task.dto';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly noteTaskUseCase: NoteTaskUseCase,
  ) {}

  @Get()
  async getTasks(): Promise<TaskDto[]> {
    const result = await this.getAllTasksUseCase.execute();

    if (result.isRight()) {
      const tasks = result.value.getValue();
      return tasks.map((task) => TaskMapper.toDto(task));
    }

    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async noteTask(@Body() noteTaskDto: NoteTaskDto): Promise<TaskDto> {
    const result = await this.noteTaskUseCase.execute(noteTaskDto);

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === AppError.UnexpectedError) {
        throw new InternalServerErrorException(error.errorValue().message);
      } else {
        throw new BadRequestException(error.errorValue());
      }
    }
  }
}
