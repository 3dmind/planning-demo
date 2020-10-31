import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../shared/core';
import { TaskEntity } from '../../domain/task.entity';
import { TaskRepository } from '../../task.repository';

type Response = Either<AppErrors.UnexpectedError, Result<TaskEntity[]>>;

@Injectable()
export class GetAllArchivedTasksUseCase
  implements UseCaseInterface<void, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('GetAllActiveTasksUseCase');
  }

  async execute(): Promise<Response> {
    try {
      const tasks = await this.taskRepository.getArchivedTasks();
      return right(Result.ok<TaskEntity[]>(tasks));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
