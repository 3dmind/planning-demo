import { Result, UseCaseError } from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';

export namespace CreateMemberErrors {
  export class MemberAlreadyExistsError extends Result<UseCaseError> {
    constructor(baseUserId: UserId) {
      super(false, {
        message: `A member for user id ${baseUserId} already exists.`,
      });
    }
  }
}
