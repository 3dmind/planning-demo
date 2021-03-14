import { Result, UseCaseError } from '../../../../../shared/core';

export namespace CreateMemberErrors {
  export class MemberAlreadyExistsError extends Result<UseCaseError> {
    constructor(baseUserId: string) {
      super(false, {
        message: `A member for user id ${baseUserId} already exists.`,
      });
    }
  }
}
