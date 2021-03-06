import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';
import { Task } from '../../../domain/task.entity';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { GetAllArchivedTasksErrors } from './get-all-archived-tasks.errors';

type Request = {
  userId: UserId;
};

type Response = Either<
  GetAllArchivedTasksErrors.MemberNotFoundError | AppErrors.UnexpectedError,
  Result<Task[]>
>;

@Injectable()
export class GetAllArchivedTasksUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(GetAllArchivedTasksUsecase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Getting archived tasks...');

    try {
      const { found, member } = await this.memberRepository.getMemberByUserId(
        request.userId.id,
      );
      if (!found) {
        const memberNotFoundError = new GetAllArchivedTasksErrors.MemberNotFoundError(
          request.userId.id.toString(),
        );
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      }

      const tasks = await this.taskRepository.getAllArchivedTasksOfMember(
        member.memberId,
      );
      this.logger.log(`Found ${tasks.length} archived tasks`);
      return right(Result.ok<Task[]>(tasks));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
