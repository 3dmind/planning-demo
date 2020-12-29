import { Guard, Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';
import { AccessToken, RefreshToken } from './jwt';
import { UserEmail } from './user-email.valueobject';
import { UserId } from './user-id.entity';
import { UserPassword } from './user-password.valueobject';
import { UserProps } from './user-props.interface';
import { UserSnapshot } from './user-snapshot';

export class UserEntity extends Entity<UserProps> {
  private constructor(props: UserProps, id: UniqueEntityId) {
    super(props, id);
  }

  get userId(): UserId {
    return UserId.create(this._id).getValue();
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get password(): UserPassword {
    return this.props.password;
  }

  public static create(
    props: UserProps,
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

  public setTokens(accessToken: AccessToken, refreshToken: RefreshToken): void {
    this.props.accessToken = accessToken;
    this.props.refreshToken = refreshToken;
  }

  public isLoggedIn(): boolean {
    return !!this.props.accessToken && !!this.props.refreshToken;
  }
}
