import { Guard, Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';
import { UserEmailValueObject } from './user-email.value-object';
import { UserIdEntity } from './user-id.entity';
import { UserPropsInterface } from './user-props.interface';
import { UserSnapshot } from './user-snapshot';

export class UserEntity extends Entity<UserPropsInterface> {
  private constructor(props: UserPropsInterface, id: UniqueEntityId) {
    super(props, id);
  }

  get userId(): UserIdEntity {
    return UserIdEntity.create(this._id).getValue();
  }

  get email(): UserEmailValueObject {
    return this.props.email;
  }

  public static create(
    props: UserPropsInterface,
    id?: UniqueEntityId,
  ): Result<UserEntity> {
    const nullGuardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.username, argumentName: 'username' },
      { argument: props.password, argumentName: 'password' },
      { argument: props.email, argumentName: 'email' },
    ]);

    if (!nullGuardResult.succeeded) {
      return Result.fail<UserEntity>(nullGuardResult.message);
    }

    const userEntity = new UserEntity(
      {
        ...props,
        isEmailVerified: props.isEmailVerified ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    return Result.ok(userEntity);
  }

  public createSnapshot(): UserSnapshot {
    return new UserSnapshot(this.props, this.userId);
  }
}
