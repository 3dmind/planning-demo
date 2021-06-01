import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../../../decorators/user-entity.decorator';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AppErrors } from '../../../shared/core';
import { UserId } from '../../users/domain/user-id.entity';
import { TaskDto } from '../dtos/task.dto';
import { TaskMapper } from '../mappers/task.mapper';
import { ArchiveTaskErrors } from '../use-cases/tasks/archive-task/archive-task.errors';
import { ArchiveTaskUsecase } from '../use-cases/tasks/archive-task/archive-task.usecase';
import { AssignTaskDto } from '../use-cases/tasks/assign-task/assign-task.dto';
import { AssignTaskErrors } from '../use-cases/tasks/assign-task/assign-task.errors';
import { AssignTaskUsecase } from '../use-cases/tasks/assign-task/assign-task.usecase';
import { DiscardTaskErrors } from '../use-cases/tasks/discard-task/discard-task.errors';
import { DiscardTaskUsecase } from '../use-cases/tasks/discard-task/discard-task.usecase';
import { EditTaskDto } from '../use-cases/tasks/edit-task/edit-task.dto';
import { EditTaskErrors } from '../use-cases/tasks/edit-task/edit-task.errors';
import { EditTaskUsecase } from '../use-cases/tasks/edit-task/edit-task.usecase';
import { GetAllActiveTasksErrors } from '../use-cases/tasks/get-all-active-tasks/get-all-active-tasks.errors';
import { GetAllActiveTasksUsecase } from '../use-cases/tasks/get-all-active-tasks/get-all-active-tasks.usecase';
import { GetAllArchivedTasksErrors } from '../use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.errors';
import { GetAllArchivedTasksUsecase } from '../use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.usecase';
import { NoteTaskDto } from '../use-cases/tasks/note-task/note-task.dto';
import { NoteTaskUsecase } from '../use-cases/tasks/note-task/note-task.usecase';
import { ResumeTaskErrors } from '../use-cases/tasks/resume-task/resume-task.errors';
import { ResumeTaskUsecase } from '../use-cases/tasks/resume-task/resume-task.usecase';
import { TickOffTasksErrors } from '../use-cases/tasks/tick-off-task/tick-off-task.errors';
import { TickOffTaskUsecase } from '../use-cases/tasks/tick-off-task/tick-off-task.usecase';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly archivedTasksUseCase: ArchiveTaskUsecase,
    private readonly assignTaskUsecase: AssignTaskUsecase,
    private readonly discardTaskUseCase: DiscardTaskUsecase,
    private readonly editTaskUseCase: EditTaskUsecase,
    private readonly getAllActiveTasksUseCase: GetAllActiveTasksUsecase,
    private readonly getAllArchivedTasksUseCase: GetAllArchivedTasksUsecase,
    private readonly noteTaskUseCase: NoteTaskUsecase,
    private readonly resumeTaskUseCase: ResumeTaskUsecase,
    private readonly tickOffTaskUseCase: TickOffTaskUsecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async noteTask(@UserEntity('userId') userId: UserId, @Body() dto: NoteTaskDto): Promise<TaskDto> {
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

      if (Reflect.getPrototypeOf(error).constructor === AppErrors.UnexpectedError) {
        throw new InternalServerErrorException(error.errorValue().message);
      } else {
        throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Put(':id/tickoff')
  async tickOffTask(@UserEntity('userId') userId: UserId, @Param('id') id: string): Promise<TaskDto> {
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
        case TickOffTasksErrors.MemberNotFoundError:
        case TickOffTasksErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Put(':id/resume')
  async resumeTask(@UserEntity('userId') userId: UserId, @Param('id') id: string): Promise<TaskDto> {
    const result = await this.resumeTaskUseCase.execute({
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
        case ResumeTaskErrors.MemberNotFoundError:
        case ResumeTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Put(':id/edit')
  async editTask(
    @UserEntity('userId') userId: UserId,
    @Param('id') id: string,
    @Body() dto: EditTaskDto,
  ): Promise<TaskDto> {
    const result = await this.editTaskUseCase.execute({
      dto,
      userId,
      taskId: id,
    });

    if (result.isRight()) {
      const task = result.value.getValue();
      return TaskMapper.toDto(task);
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case EditTaskErrors.MemberNotFoundError:
        case EditTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().messge);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Put(':id/archive')
  async archiveTask(@UserEntity('userId') userId: UserId, @Param('id') id: string): Promise<TaskDto> {
    const result = await this.archivedTasksUseCase.execute({
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
        case ArchiveTaskErrors.MemberNotFoundError:
        case ArchiveTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().messge);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Put(':id/discard')
  async discardTask(@UserEntity('userId') userId: UserId, @Param('id') id: string): Promise<TaskDto> {
    const result = await this.discardTaskUseCase.execute({
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
        case DiscardTaskErrors.MemberNotFoundError:
        case DiscardTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Get('/active')
  async getActiveTasks(@UserEntity('userId') userId: UserId): Promise<TaskDto[]> {
    const result = await this.getAllActiveTasksUseCase.execute({ userId });

    if (result.isRight()) {
      const tasks = result.value.getValue();
      return tasks.map((task) => TaskMapper.toDto(task));
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case GetAllActiveTasksErrors.MemberNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Get('/archived')
  async getArchivedTasks(@UserEntity('userId') userId: UserId): Promise<TaskDto[]> {
    const result = await this.getAllArchivedTasksUseCase.execute({ userId });

    if (result.isRight()) {
      const tasks = result.value.getValue();
      return tasks.map((task) => TaskMapper.toDto(task));
    }

    if (result.isLeft()) {
      const error = result.value;

      switch (Reflect.getPrototypeOf(error).constructor) {
        case GetAllArchivedTasksErrors.MemberNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @Put(':id/assign')
  async assign(
    @UserEntity('userId') userId: UserId,
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
  ): Promise<TaskDto> {
    const result = await this.assignTaskUsecase.execute({
      memberId: dto.memberId,
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
        case AssignTaskErrors.MemberNotFoundByUserIdError:
        case AssignTaskErrors.MemberNotFoundError:
        case AssignTaskErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }
}
