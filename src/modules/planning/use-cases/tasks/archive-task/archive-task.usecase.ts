import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { ArchiveTaskDto } from './archive-task.dto';
import { ArchiveTaskErrors } from './archive-task.errors';

type Response = Either<
  AppErrors.UnexpectedError | ArchiveTaskErrors.TaskNotFoundError | Result<any>,
  Result<Task>
>;

@Injectable()
export class ArchiveTaskUsecase implements UseCase<ArchiveTaskDto, Response> {
  private readonly logger = new Logger(ArchiveTaskUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: ArchiveTaskDto): Promise<Response> {
    this.logger.log('Archiving task...');
    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));

    if (taskIdResult.isFailure) {
      this.logger.debug(taskIdResult.errorValue());
      return left(taskIdResult);
    } else {
      try {
        const taskId = taskIdResult.getValue();
        const { found, task } = await this.taskRepository.getTaskByTaskId(
          taskId,
        );

        if (!found) {
          const taskNotFoundError = new ArchiveTaskErrors.TaskNotFoundError(
            request.taskId,
          );
          this.logger.debug(taskNotFoundError.errorValue().message);
          return left(taskNotFoundError);
        } else {
          task.archive();
          await this.taskRepository.save(task);
          this.logger.log('Task successfully archived');
          return right(Result.ok<Task>(task));
        }
      } catch (error) {
        this.logger.error(error.message, error);
        return left(new AppErrors.UnexpectedError(error));
      }
    }
  }
}
