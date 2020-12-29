import { Result, UseCaseError } from '../../../../../shared/core';

export namespace ArchiveTaskErrors {
  export class TaskNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Could not find a task by id {${id}}.`,
      } as UseCaseError);
    }

    public static create(id: string): TaskNotFoundError {
      return new TaskNotFoundError(id);
    }
  }
}
