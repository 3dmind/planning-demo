import { Result, UseCaseErrorAbstract } from '../../../../shared/core';

export namespace ResumeTaskErrors {
  export class TaskNotFoundError extends Result<UseCaseErrorAbstract> {
    constructor(id: string) {
      super(false, {
        message: `Could not find a task by id {${id}}.`,
      } as UseCaseErrorAbstract);
    }

    public static create(id: string): TaskNotFoundError {
      return new TaskNotFoundError(id);
    }
  }
}
