import { Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';

export class MemberId extends Entity<any> {
  constructor(id?: UniqueEntityId) {
    super(null, id);
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  public static create(id?: UniqueEntityId): Result<MemberId> {
    return Result.ok<MemberId>(new MemberId(id));
  }

  public override toString(): string {
    return this._id.toString();
  }
}
