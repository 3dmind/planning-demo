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
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AppErrors } from '../../../shared/core';
import { GetUser } from '../../users/decorators/get-user.decorator';
import { UserId } from '../../users/domain/user-id.entity';
import { TaskDto } from '../dtos/task.dto';
import { TaskMapper } from '../mappers/task.mapper';
import { ArchiveTaskErrors } from '../use-cases/tasks/archive-task/archive-task.errors';
import { ArchiveTaskUsecase } from '../use-cases/tasks/archive-task/archive-task.usecase';
import { DiscardTaskErrors } from '../use-cases/tasks/discard-task/discard-task.errors';
import { DiscardTaskUsecase } from '../use-cases/tasks/discard-task/discard-task.usecase';
import { EditTaskDto } from '../use-cases/tasks/edit-task/edit-task.dto';
import { EditTaskErrors } from '../use-cases/tasks/edit-task/edit-task.errors';
import { EditTaskUsecase } from '../use-cases/tasks/edit-task/edit-task.usecase';
import { GetAllActiveTasksUsecase } from '../use-cases/tasks/get-all-active-tasks/get-all-active-tasks.usecase';
import { GetAllArchivedTasksUsecase } from '../use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.usecase';
import { GetAllTasksUsecase } from '../use-cases/tasks/get-all-tasks/get-all-tasks.usecase';
import { NoteTaskDto } from '../use-cases/tasks/note-task/note-task.dto';
import { NoteTaskUsecase } from '../use-cases/tasks/note-task/note-task.usecase';
import { ResumeTaskErrors } from '../use-cases/tasks/resume-task/resume-task.errors';
import { ResumeTaskUsecase } from '../use-cases/tasks/resume-task/resume-task.usecase';
import { TickOffTasksErrors } from '../use-cases/tasks/tick-off-task/tick-off-task.errors';
import { TickOffTaskUsecase } from '../use-cases/tasks/tick-off-task/tick-off-task.usecase';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly getAllTasksUseCase: GetAllTasksUsecase,
    private readonly noteTaskUseCase: NoteTaskUsecase,
    private readonly tickOffTaskUseCase: TickOffTaskUsecase,
    private readonly resumeTaskUseCase: ResumeTaskUsecase,
    private readonly archivedTasksUseCase: ArchiveTaskUsecase,
    private readonly editTaskUseCase: EditTaskUsecase,
    private readonly discardTaskUseCase: DiscardTaskUsecase,
    private readonly getAllActiveTasksUseCase: GetAllActiveTasksUsecase,
    private readonly getAllArchivedTasksUseCase: GetAllArchivedTasksUsecase,
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

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async noteTask(
    @GetUser('userId') userId: UserId,
    @Body() dto: NoteTaskDto,
  ): Promise<TaskDto> {
    const result = await this.noteTaskUseCase.execute({
      dto,
      userId,
    });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === AppErrors.UnexpectedError) {
        throw new InternalServerErrorException(error.errorValue().message);
      } else {
        throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/tickoff')
  @HttpCode(HttpStatus.OK)
  async tickOffTask(
    @GetUser('userId') userId: UserId,
    @Param('id') id: string,
  ): Promise<TaskDto> {
    const result = await this.tickOffTaskUseCase.execute({
      taskId: id,
      userId,
    });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;

      switch (Reflect.getPrototypeOf(error).constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        case TickOffTasksErrors.MemberNotFoundError:
        case TickOffTasksErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
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

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archiveTask(@Param('id') id: string): Promise<TaskDto> {
    const result = await this.archivedTasksUseCase.execute({ taskId: id });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().messge);
        case ArchiveTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        default:
          throw new BadRequestException(error.errorValue());
      }
    }
  }

  @Post(':id/edit')
  @HttpCode(HttpStatus.OK)
  async editTask(
    @Param('id') id: string,
    @Body() dto: EditTaskDto,
  ): Promise<TaskDto> {
    const result = await this.editTaskUseCase.execute({
      taskId: id,
      text: dto.text,
    });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().messge);
        case EditTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Post(':id/discard')
  @HttpCode(HttpStatus.OK)
  async discardTask(@Param('id') id: string): Promise<TaskDto> {
    const result = await this.discardTaskUseCase.execute({ taskId: id });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        case DiscardTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        default:
          throw new BadRequestException(error.errorValue());
      }
    }
  }

  @Get('/active')
  async getActiveTasks(): Promise<TaskDto[]> {
    const result = await this.getAllActiveTasksUseCase.execute();

    if (result.isRight()) {
      const tasks = result.value.getValue();
      return tasks.map((task) => TaskMapper.toDto(task));
    }

    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }
  }

  @Get('/archived')
  async getArchivedTasks(): Promise<TaskDto[]> {
    const result = await this.getAllArchivedTasksUseCase.execute();

    if (result.isRight()) {
      const tasks = result.value.getValue();
      return tasks.map((task) => TaskMapper.toDto(task));
    }

    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }
  }
}
