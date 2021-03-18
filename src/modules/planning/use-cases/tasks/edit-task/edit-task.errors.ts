import { Result, UseCaseError } from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';

export namespace EditTaskErrors {
  export class TaskNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Could not find a task by the id {${id}}.`,
      });
    }
  }

  export class MemberNotFoundError extends Result<UseCaseError> {
    constructor(userId: UserId) {
      super(false, {
        message: `Could not find member associated with the user id {${userId}}.`,
      });
    }
  }
}
