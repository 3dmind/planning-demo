import { Result, UseCaseError } from '../../../../shared/core';

export namespace LogoutErrors {
  export class UserNotFoundError extends Result<UseCaseError> {
    constructor(username: string) {
      super(false, {
        message: `User with the username '${username}' does not exist.`,
      });
    }
  }
}
