import { Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';

export class OwnerId extends Entity<null> {
  private constructor(id?: UniqueEntityId) {
    super(null, id);
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  public static create(id?: UniqueEntityId): Result<OwnerId> {
    return Result.ok<OwnerId>(new OwnerId(id));
  }

  public toString(): string {
    return this._id.toString();
  }
}
