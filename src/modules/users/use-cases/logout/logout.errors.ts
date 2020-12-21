import { Result, UseCaseErrorAbstract } from '../../../../shared/core';

export namespace LogoutErrors {
  export class UserNotFoundError extends Result<UseCaseErrorAbstract> {
    private constructor(username: string) {
      super(false, {
        message: `User with the username '${username}' does not exist.`,
      });
    }

    public static create(username: string): UserNotFoundError {
      return new UserNotFoundError(username);
    }
  }
}
