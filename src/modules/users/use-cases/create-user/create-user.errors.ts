import { Result, UseCaseErrorAbstract } from '../../../../shared/core';

export namespace CreateUserErrors {
  export class EmailAlreadyExistsError extends Result<UseCaseErrorAbstract> {
    private constructor(email: string) {
      super(false, {
        message: `The email ${email} associated for this account already exists.`,
      });
    }

    public static create(email: string): EmailAlreadyExistsError {
      return new EmailAlreadyExistsError(email);
    }
  }

  export class UsernameTakenError extends Result<UseCaseErrorAbstract> {
    private constructor(username: string) {
      super(false, {
        message: `The username ${username} was already taken.`,
      });
    }

    public static create(username: string): UsernameTakenError {
      return new UsernameTakenError(username);
    }
  }
}
