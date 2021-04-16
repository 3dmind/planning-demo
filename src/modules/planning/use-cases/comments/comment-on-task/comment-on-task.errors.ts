import { Result, UseCaseError } from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';
import { MemberId } from '../../../domain/member-id.entity';
import { TaskId } from '../../../domain/task-id.entity';

export namespace CommentOnTaskErrors {
  export class MemberNotFoundError extends Result<UseCaseError> {
    constructor(userId: UserId) {
      super(false, {
        message: `Could not find member associated with the user id {${userId}}.`,
      });
    }
  }

  export class TaskNotFoundError extends Result<UseCaseError> {
    constructor(taskId: TaskId) {
      super(false, {
        message: `Could not find a task by the id {${taskId}}.`,
      });
    }
  }

  export class MemberIsNeitherTaskOwnerNorAssigneeError extends Result<
    UseCaseError
  > {
    constructor(memberId: MemberId) {
      super(false, {
        message: `Member with id {${memberId}} is neither the task owner nor the assignee.`,
      });
    }
  }
}
