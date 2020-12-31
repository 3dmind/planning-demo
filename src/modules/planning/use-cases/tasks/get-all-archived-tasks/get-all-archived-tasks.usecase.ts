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
export class GetAllArchivedTasksUsecase implements UseCase<void, Response> {
  private readonly logger = new Logger(GetAllArchivedTasksUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(): Promise<Response> {
    this.logger.log('Getting archived tasks...');
    try {
      const tasks = await this.taskRepository.getArchivedTasks();
      this.logger.log(`Found ${tasks.length} archived tasks`);
      return right(Result.ok<Task[]>(tasks));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
