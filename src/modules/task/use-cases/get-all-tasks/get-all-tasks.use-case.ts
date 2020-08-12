import { Injectable, Logger } from '@nestjs/common';
import {
  AppError,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../shared/core';
import { Task } from '../../domain/task';
import { TaskRepository } from '../../task.repository';

type Response = Either<AppError.UnexpectedError, Result<Task[]>>;

@Injectable()
export class GetAllTasksUseCase implements UseCase<void, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('GetAllTasksUseCase');
  }

  async execute(): Promise<Response> {
    try {
      const tasks = await this.taskRepository.getTasks();
      return right(Result.ok<Task[]>(tasks));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppError.UnexpectedError.create(error));
    }
  }
}
