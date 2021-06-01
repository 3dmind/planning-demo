import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { Member } from '../../../domain/member.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';

type Request = {
  member: Member;
  task: Task;
};

type Response = Either<AppErrors.UnexpectedError | Result<any>, Result<Task>>;

@Injectable()
export class ResumeTaskUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(ResumeTaskUseCase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Resuming task...');

    const { member, task } = request;

    try {
      if (!task.isTickedOff()) {
        this.logger.log('Task already resumed.');
        return right(Result.ok(task));
      }

      const result = task.resume(member.assigneeId);
      if (result.isFailure) {
        return left(result);
      } else {
        await this.taskRepository.save(task);
        this.logger.log('Task successfully resumed.');
        return right(Result.ok(task));
      }
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
