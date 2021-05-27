import { Result, UseCaseError } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';

export namespace GetTaskByIdErrors {
  export class TaskNotFoundError extends Result<UseCaseError> {
    constructor(taskId: TaskId) {
      super(false, {
        message: `Could not find a task by the id {${taskId}}.`,
      });
    }
  }
}
