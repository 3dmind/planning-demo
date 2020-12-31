import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';

type Response = Either<AppErrors.UnexpectedError, Result<Task[]>>;

@Injectable()
export class GetAllTasksUsecase implements UseCase<void, Response> {
  private readonly logger = new Logger(GetAllTasksUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(): Promise<Response> {
    this.logger.log('Getting all tasks...');
    try {
      const tasks = await this.taskRepository.getTasks();
      this.logger.log(`Found ${tasks.length} tasks`);
      return right(Result.ok<Task[]>(tasks));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
