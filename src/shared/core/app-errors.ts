import { Result } from './result';
import { UseCaseError } from './use-case-error';

export namespace AppErrors {
  export class UnexpectedError extends Result<UseCaseError> {
    public constructor(error: Error) {
      super(false, {
        message: `An unexpected error occurred.`,
        error,
      } as UseCaseError);
    }

    public static create(error: Error): UnexpectedError {
      return new UnexpectedError(error);
    }
  }
}
