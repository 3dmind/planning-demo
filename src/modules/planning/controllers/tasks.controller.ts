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
import { GetMemberEntityByUserIdPipe } from '../../../pipes/get-member-entity-by-user-id.pipe';
import { GetTaskEntityByIdPipe } from '../../../pipes/get-task-entity-by-id.pipe';
import { AppErrors } from '../../../shared/core';
import { Member } from '../domain/member.entity';
import { Task } from '../domain/task.entity';
import { TaskDto } from '../dtos/task.dto';
import { TaskMapper } from '../mappers/task.mapper';
import { ArchiveTaskUseCase } from '../use-cases/tasks/archive-task/archive-task.use-case';
import { AssignTaskDto } from '../use-cases/tasks/assign-task/assign-task.dto';
import { AssignTaskErrors } from '../use-cases/tasks/assign-task/assign-task.errors';
import { AssignTaskUseCase } from '../use-cases/tasks/assign-task/assign-task.use-case';
import { DiscardTaskUseCase } from '../use-cases/tasks/discard-task/discard-task.use-case';
import { EditTaskDto } from '../use-cases/tasks/edit-task/edit-task.dto';
import { EditTaskUseCase } from '../use-cases/tasks/edit-task/edit-task.use-case';
import { GetAllActiveTasksUseCase } from '../use-cases/tasks/get-all-active-tasks/get-all-active-tasks.use-case';
import { GetAllArchivedTasksUseCase } from '../use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.use-case';
import { NoteTaskDto } from '../use-cases/tasks/note-task/note-task.dto';
import { NoteTaskUseCase } from '../use-cases/tasks/note-task/note-task.use-case';
import { ResumeTaskUseCase } from '../use-cases/tasks/resume-task/resume-task.use-case';
import { TickOffTaskUseCase } from '../use-cases/tasks/tick-off-task/tick-off-task.use-case';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly archivedTasksUseCase: ArchiveTaskUseCase,
    private readonly assignTaskUsecase: AssignTaskUseCase,
    private readonly discardTaskUseCase: DiscardTaskUseCase,
    private readonly editTaskUseCase: EditTaskUseCase,
    private readonly getAllActiveTasksUseCase: GetAllActiveTasksUseCase,
    private readonly getAllArchivedTasksUseCase: GetAllArchivedTasksUseCase,
    private readonly noteTaskUseCase: NoteTaskUseCase,
    private readonly resumeTaskUseCase: ResumeTaskUseCase,
    private readonly tickOffTaskUseCase: TickOffTaskUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async noteTask(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Body() dto: NoteTaskDto,
  ): Promise<TaskDto> {
    const result = await this.noteTaskUseCase.execute({ dto, member });

    if (result.isRight()) {
      return TaskMapper.toDto(result.value.getValue());
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
  async tickOffTask(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Param('id', GetTaskEntityByIdPipe) task: Task,
  ): Promise<TaskDto> {
    const result = await this.tickOffTaskUseCase.execute({ member, task });

    if (result.isRight()) {
      return TaskMapper.toDto(result.value.getValue());
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

  @Put(':id/resume')
  async resumeTask(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Param('id', GetTaskEntityByIdPipe) task: Task,
  ): Promise<TaskDto> {
    const result = await this.resumeTaskUseCase.execute({ member, task });

    if (result.isRight()) {
      return TaskMapper.toDto(result.value.getValue());
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

  @Put(':id/edit')
  async editTask(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Param('id', GetTaskEntityByIdPipe) task: Task,
    @Body() dto: EditTaskDto,
  ): Promise<TaskDto> {
    const result = await this.editTaskUseCase.execute({ dto, member, task });

    if (result.isRight()) {
      return TaskMapper.toDto(result.value.getValue());
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

  @Put(':id/archive')
  async archiveTask(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Param('id', GetTaskEntityByIdPipe) task: Task,
  ): Promise<TaskDto> {
    const result = await this.archivedTasksUseCase.execute({ member, task });

    if (result.isRight()) {
      return TaskMapper.toDto(result.value.getValue());
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

  @Put(':id/discard')
  async discardTask(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member,
    @Param('id', GetTaskEntityByIdPipe) task: Task,
  ): Promise<TaskDto> {
    const result = await this.discardTaskUseCase.execute({ member, task });

    if (result.isRight()) {
      return TaskMapper.toDto(result.value.getValue());
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

  @Get('/active')
  async getActiveTasks(@UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member): Promise<TaskDto[]> {
    const result = await this.getAllActiveTasksUseCase.execute({ member });

    if (result.isRight()) {
      return result.value.getValue().map((task) => TaskMapper.toDto(task));
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

  @Get('/archived')
  async getArchivedTasks(@UserEntity('userId', GetMemberEntityByUserIdPipe) member: Member): Promise<TaskDto[]> {
    const result = await this.getAllArchivedTasksUseCase.execute({ member });

    if (result.isRight()) {
      return result.value.getValue().map((task) => TaskMapper.toDto(task));
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

  @Put(':id/assign')
  async assign(
    @UserEntity('userId', GetMemberEntityByUserIdPipe) assigner: Member,
    @Param('id', GetTaskEntityByIdPipe) task: Task,
    @Body() dto: AssignTaskDto,
  ): Promise<TaskDto> {
    const result = await this.assignTaskUsecase.execute({
      assigner,
      memberId: dto.memberId,
      task,
    });

    if (result.isRight()) {
      return TaskMapper.toDto(result.value.getValue());
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case AssignTaskErrors.MemberNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }
}
