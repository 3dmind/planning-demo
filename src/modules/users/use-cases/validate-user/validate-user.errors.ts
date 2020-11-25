import { Result, UseCaseErrorAbstract } from '../../../../shared/core';

export namespace ValidateUserErrors {
  export class UserNameDoesntExistError extends Result<UseCaseErrorAbstract> {
    private constructor() {
      super(false, {
        message: 'Username or password incorrect.',
      });
    }

    public static create(): UserNameDoesntExistError {
      return new UserNameDoesntExistError();
    }
  }

  export class PasswordDoesntMatchError extends Result<UseCaseErrorAbstract> {
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
