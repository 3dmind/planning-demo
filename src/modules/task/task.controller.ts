import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { AppError } from '../../shared/core';
import { TaskDto } from './task.dto';
import { TaskMapper } from './task.mapper';
import { NoteTaskDto } from './use-cases/note-task/note-task.dto';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';

@Controller('tasks')
export class TaskController {
  constructor(private readonly noteTaskUseCase: NoteTaskUseCase) {}

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
