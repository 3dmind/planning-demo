import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { MemberId } from '../../../domain/member-id.entity';
import { Member } from '../../../domain/member.entity';
import { MemberRepository } from '../../../domain/member.repository';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { AssignTaskErrors } from './assign-task.errors';

type Request = {
  assigner: Member;
  memberId: string;
  task: Task;
};

type Response = Either<AssignTaskErrors.MemberNotFoundError | AppErrors.UnexpectedError | Result<any>, Result<Task>>;

@Injectable()
export class AssignTaskUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(AssignTaskUseCase.name);

  constructor(private readonly memberRepository: MemberRepository, private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Assigning task...');

    const { assigner, task } = request;

    const memberIdResult = MemberId.create(new UniqueEntityId(request.memberId));
    if (memberIdResult.isFailure) {
      this.logger.debug(memberIdResult.errorValue());
      return left(memberIdResult);
    }

    try {
      /*
        Find the member which will become the task assignee.
       */
      const memberId = memberIdResult.getValue();
      const { found: memberFound, member } = await this.memberRepository.getMemberById(memberId);
      if (!memberFound) {
        const memberNotFoundByUsernameError = new AssignTaskErrors.MemberNotFoundError(memberId);
        this.logger.debug(memberNotFoundByUsernameError.errorValue().message);
        return left(memberNotFoundByUsernameError);
      }

      /*
        Assign the task.
       */
      if (task.assigneeId.equals(member.assigneeId)) {
        this.logger.debug('Task already assigned to member.');
        return right(Result.ok(task));
      }

      const result = task.assign(assigner.ownerId, member.assigneeId);
      if (result.isFailure) {
        this.logger.debug(result.errorValue());
        return left(result);
      } else {
        await this.taskRepository.save(task);
        this.logger.log('Task successfully assigned.');
        return right(Result.ok(task));
      }
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
