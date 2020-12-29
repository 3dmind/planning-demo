import { Result, UseCaseError } from '../../../../shared/core';

export namespace GetUserByUserNameError {
  export class UserNotFoundError extends Result<UseCaseError> {
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
