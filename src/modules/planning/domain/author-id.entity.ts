import { Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';

export class AuthorId extends Entity<null> {
  private constructor(id?: UniqueEntityId) {
    super(null, id);
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  public static create(id?: UniqueEntityId): Result<AuthorId> {
    return Result.ok<AuthorId>(new AuthorId(id));
  }

  public override toString(): string {
    return this._id.toString();
  }
}
