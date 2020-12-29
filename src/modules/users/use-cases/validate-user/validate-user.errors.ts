import { Result, UseCaseError } from '../../../../shared/core';

export namespace ValidateUserErrors {
  export class UserNameDoesntExistError extends Result<UseCaseError> {
    private constructor() {
      super(false, {
        message: 'Username or password incorrect.',
      });
    }

    public static create(): UserNameDoesntExistError {
      return new UserNameDoesntExistError();
    }
  }

  export class PasswordDoesntMatchError extends Result<UseCaseError> {
    private constructor() {
      super(false, {
        message: 'Password doesnt match.',
      });
    }

    public static create(): PasswordDoesntMatchError {
      return new PasswordDoesntMatchError();
    }
  }
}
