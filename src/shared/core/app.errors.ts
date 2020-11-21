import { Result } from './result';
import { UseCaseErrorAbstract } from './use-case-error.abstract';

export namespace AppErrors {
  export class UnexpectedError extends Result<UseCaseErrorAbstract> {
    public constructor(error: Error) {
      super(false, {
        message: `An unexpected error occurred.`,
        error,
      } as UseCaseErrorAbstract);
    }

    public static create(error: Error): UnexpectedError {
      return new UnexpectedError(error);
    }
  }
}
