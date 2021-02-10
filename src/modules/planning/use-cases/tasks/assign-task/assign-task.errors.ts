import { Result, UseCaseError } from '../../../../../shared/core';
import { MemberId } from '../../../domain/member-id.entity';

export namespace AssignTaskErrors {
  export class TaskNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Could not find a task by the id {${id}}.`,
      });
    }
  }

  export class MemberNotFoundByUserIdError extends Result<UseCaseError> {
    constructor(userId: string) {
      super(false, {
        message: `Could not find member associated with the user id {${userId}}.`,
      });
    }
  }

  export class MemberNotFoundError extends Result<UseCaseError> {
    constructor(memberId: MemberId) {
      super(false, {
        message: `Could not find member by the id {${memberId}}.`,
      });
    }
  }
}
