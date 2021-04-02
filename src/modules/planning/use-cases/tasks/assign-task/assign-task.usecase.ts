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
import { UserId } from '../../../../users/domain/user-id.entity';
import { MemberId } from '../../../domain/member-id.entity';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { AssignTaskErrors } from './assign-task.errors';

type Request = {
  memberId: string;
  taskId: string;
  userId: UserId;
};

type Response = Either<
  | AssignTaskErrors.MemberNotFoundByUserIdError
  | AssignTaskErrors.MemberNotFoundError
  | AssignTaskErrors.TaskNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<Task>
>;

@Injectable()
export class AssignTaskUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(AssignTaskUsecase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Assigning task...');

    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));
    if (taskIdResult.isFailure) {
      this.logger.debug(taskIdResult.errorValue());
      return left(taskIdResult);
    }

    const memberIdResult = MemberId.create(
      new UniqueEntityId(request.memberId),
    );
    if (memberIdResult.isFailure) {
      this.logger.debug(memberIdResult.errorValue());
      return left(memberIdResult);
    }

    try {
      /*
        Find the task owner.
       */
      const {
        found: ownerFound,
        member: owner,
      } = await this.memberRepository.getMemberByUserId(request.userId.id);
      if (!ownerFound) {
        const memberNotFoundByUserIdError = new AssignTaskErrors.MemberNotFoundByUserIdError(
          request.userId.id.toString(),
        );
        this.logger.debug(memberNotFoundByUserIdError.errorValue().message);
        return left(memberNotFoundByUserIdError);
      }

      /*
        Find the member which will become the task assignee.
       */
      const memberId = memberIdResult.getValue();
      const {
        found: memberFound,
        member,
      } = await this.memberRepository.getMemberById(memberId);
      if (!memberFound) {
        const memberNotFoundByUsernameError = new AssignTaskErrors.MemberNotFoundError(
          memberId,
        );
        this.logger.debug(memberNotFoundByUsernameError.errorValue().message);
        return left(memberNotFoundByUsernameError);
      }

      /*
        Find the task which is going to be assigned.
       */
      const taskId = taskIdResult.getValue();
      const { found: taskFound, task } = await this.taskRepository.getTaskById(
        taskId,
      );
      if (!taskFound) {
        const taskNotFoundError = new AssignTaskErrors.TaskNotFoundError(
          taskId.id.toString(),
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      /*
        Assign the task.
       */
      if (task.assigneeId.equals(member.assigneeId)) {
        this.logger.debug('Task already assigned to member.');
        return right(Result.ok(task));
      }

      const result = task.assign(owner.ownerId, member.assigneeId);
      if (result.isFailure) {
        this.logger.debug(result.errorValue());
        return left(result);
      } else {
        await this.taskRepository.save(task);
        this.logger.debug('Task successfully assigned.');
        return right(Result.ok(task));
      }
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
