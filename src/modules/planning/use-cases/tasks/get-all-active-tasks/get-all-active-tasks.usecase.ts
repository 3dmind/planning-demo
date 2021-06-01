import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';
import { MemberRepository } from '../../../domain/member.repository';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { GetAllActiveTasksErrors } from './get-all-active-tasks.errors';

type Request = {
  userId: UserId;
};
type Response = Either<GetAllActiveTasksErrors.MemberNotFoundError | AppErrors.UnexpectedError, Result<Task[]>>;

@Injectable()
export class GetAllActiveTasksUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(GetAllActiveTasksUsecase.name);

  constructor(private readonly memberRepository: MemberRepository, private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Getting active tasks...');

    try {
      const { found, member } = await this.memberRepository.getMemberByUserId(request.userId.id);
      if (!found) {
        const memberNotFoundError = new GetAllActiveTasksErrors.MemberNotFoundError(request.userId);
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      }

      const tasks = await this.taskRepository.getAllActiveTasksOfMember(member.memberId);
      this.logger.log(`Found ${tasks.length} active tasks`);
      return right(Result.ok<Task[]>(tasks));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
