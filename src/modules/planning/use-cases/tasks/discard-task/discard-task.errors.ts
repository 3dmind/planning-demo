import { Result, UseCaseError } from '../../../../../shared/core';

export namespace DiscardTaskErrors {
  export class TaskNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Could not find a task by the id {${id}}.`,
      });
    }
  }
}
