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
export class DiscardTaskUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(DiscardTaskUseCase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Discarding task...');

    const { member, task } = request;

    try {
      if (task.isDiscarded()) {
        this.logger.debug('Task already discarded.');
        return right(Result.ok(task));
      }

      const result = task.discard(member.ownerId);
      if (result.isFailure) {
        return left(result);
      } else {
        await this.taskRepository.save(task);
        this.logger.log('Task successfully discarded.');
        return right(Result.ok<Task>(task));
      }
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
