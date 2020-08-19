import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { AppErrors } from '../../shared/core';
import { TaskDto } from './task.dto';
import { TaskMapper } from './task.mapper';
import { GetAllTasksUseCase } from './use-cases/get-all-tasks/get-all-tasks.use-case';
import { NoteTaskDto } from './use-cases/note-task/note-task.dto';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';
import { ResumeTaskErrors } from './use-cases/resume-task/resume-task.errors';
import { ResumeTaskUseCase } from './use-cases/resume-task/resume-task.use-case';
import { TickOffTasksErrors } from './use-cases/tick-off-task/tick-off-task.errors';
import { TickOffTaskUseCase } from './use-cases/tick-off-task/tick-off-task.use-case';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly noteTaskUseCase: NoteTaskUseCase,
    private readonly tickOffTaskUseCase: TickOffTaskUseCase,
    private readonly resumeTaskUseCase: ResumeTaskUseCase,
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

      if (error.constructor === AppErrors.UnexpectedError) {
        throw new InternalServerErrorException(error.errorValue().message);
      } else {
        throw new BadRequestException(error.errorValue());
      }
    }
  }

  @Post(':id/tickoff')
  @HttpCode(HttpStatus.OK)
  async tickOffTask(@Param('id') id: string): Promise<TaskDto> {
    const result = await this.tickOffTaskUseCase.execute({ taskId: id });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        case TickOffTasksErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        default:
          throw new BadRequestException(error.errorValue());
      }
    }
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  async resumeTask(@Param('id') id: string): Promise<TaskDto> {
    const result = await this.resumeTaskUseCase.execute({ taskId: id });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        case ResumeTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        default:
          throw new BadRequestException(error.errorValue());
      }
    }
  }
}
