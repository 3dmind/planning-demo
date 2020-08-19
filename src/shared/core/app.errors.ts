import { Result } from './result';
import { UseCaseErrorAbstract } from './use-case-error.abstract';

export namespace AppErrors {
  export class UnexpectedError extends Result<UseCaseErrorAbstract> {
    public constructor(err: any) {
      super(false, {
        message: `An unexpected error occurred.`,
        error: err,
      } as UseCaseErrorAbstract);
    }

    public static create(err: any): UnexpectedError {
      return new UnexpectedError(err);
    }
  }
}
