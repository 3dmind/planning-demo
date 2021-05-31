import { Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';

export class TaskId extends Entity<any> {
  private constructor(id?: UniqueEntityId) {
    super(null, id);
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  public static create(id?: UniqueEntityId): Result<TaskId> {
    return Result.ok<TaskId>(new TaskId(id));
  }

  public override toString(): string {
    return this._id.toString();
  }
}
