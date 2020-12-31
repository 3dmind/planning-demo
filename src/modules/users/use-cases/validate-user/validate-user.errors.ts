import { Result, UseCaseError } from '../../../../shared/core';

export namespace ValidateUserErrors {
  export class UserNameDoesntExistError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: 'Username or password incorrect.',
      });
    }
  }

  export class PasswordDoesntMatchError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: 'Password doesnt match.',
      });
    }
  }
}
