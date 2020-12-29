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
import { ResumeTaskDto } from './resume-task.dto';
import { ResumeTaskErrors } from './resume-task.errors';

type Response = Either<
  AppErrors.UnexpectedError | ResumeTaskErrors.TaskNotFoundError | Result<any>,
  Result<Task>
>;

@Injectable()
export class ResumeTaskUsecase implements UseCase<ResumeTaskDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('ResumeTaskUsecase');
  }

  async execute(request: ResumeTaskDto): Promise<Response> {
    this.logger.debug(`Executed with request: ${request}`);
    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));

    if (taskIdResult.isFailure) {
      this.logger.error(taskIdResult.errorValue());
      return left(taskIdResult);
    } else {
      try {
        const taskId = taskIdResult.getValue();
        const { found, task } = await this.taskRepository.getTaskByTaskId(
          taskId,
        );
        if (!found) {
          const taskNotFoundError = ResumeTaskErrors.TaskNotFoundError.create(
            request.taskId,
          );
          this.logger.error(taskNotFoundError.errorValue().message);
          return left(taskNotFoundError) as Response;
        } else {
          task.resume();
          await this.taskRepository.save(task);
          return right(Result.ok<Task>(task));
        }
      } catch (error) {
        this.logger.error(error.message, error);
        return left(AppErrors.UnexpectedError.create(error)) as Response;
      }
    }
  }
}
