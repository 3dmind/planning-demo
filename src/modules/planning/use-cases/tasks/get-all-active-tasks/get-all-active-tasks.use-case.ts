import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { Member } from '../../../domain/member.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';

type Request = {
  member: Member;
};
type Response = Either<AppErrors.UnexpectedError, Result<Task[]>>;

@Injectable()
export class GetAllActiveTasksUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(GetAllActiveTasksUseCase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Getting active tasks...');

    const { member } = request;

    try {
      const tasks = await this.taskRepository.getAllActiveTasksOfMember(member.memberId);
      this.logger.log(`Found ${tasks.length} active tasks`);
      return right(Result.ok<Task[]>(tasks));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
