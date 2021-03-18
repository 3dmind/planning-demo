import { Result, UseCaseError } from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';

export namespace GetAllActiveTasksErrors {
  export class MemberNotFoundError extends Result<UseCaseError> {
    constructor(userId: UserId) {
      super(false, {
        message: `Could not find member associated with the user id {${userId}}.`,
      });
    }
  }
}
