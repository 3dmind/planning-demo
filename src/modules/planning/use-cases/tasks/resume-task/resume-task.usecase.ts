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
  private readonly logger = new Logger(ResumeTaskUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: ResumeTaskDto): Promise<Response> {
    this.logger.log('Resuming task...');

    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));
    if (taskIdResult.isFailure) {
      this.logger.debug(taskIdResult.errorValue());
      return left(taskIdResult);
    }

    try {
      const taskId = taskIdResult.getValue();
      const { found, task } = await this.taskRepository.getTaskByTaskId(taskId);
      if (!found) {
        const taskNotFoundError = new ResumeTaskErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      task.resume();
      await this.taskRepository.save(task);
      this.logger.log('Task successfully resumed');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
