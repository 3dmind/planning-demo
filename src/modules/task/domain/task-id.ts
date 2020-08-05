import { Result } from '../../../shared/core';
import { Entity, UniqueEntityID } from '../../../shared/domain';

export class TaskId extends Entity<any> {
  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  public static create(id?: UniqueEntityID): Result<TaskId> {
    return Result.ok<TaskId>(new TaskId(id));
  }
}
