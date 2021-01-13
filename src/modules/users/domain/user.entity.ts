import { Guard, Result } from '../../../shared/core';
import { AggregateRoot, UniqueEntityId } from '../../../shared/domain';
import { UserRegistered } from './events/user-registered.domainevent';
import { AccessToken, RefreshToken } from './jwt';
import { UserEmail } from './user-email.valueobject';
import { UserId } from './user-id.entity';
import { UserName } from './user-name.valueobject';
import { UserPassword } from './user-password.valueobject';
import { UserProps } from './user-props.interface';

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id: UniqueEntityId) {
    super(props, id);
  }

  get userId(): UserId {
    return UserId.create(this._id).getValue();
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get password(): UserPassword {
    return this.props.password;
  }

  get username(): UserName {
    return this.props.username;
  }

  get accessToken(): AccessToken {
    return this.props.accessToken;
  }

  get refreshToken(): RefreshToken {
    return this.props.refreshToken;
  }

  public static create(props: UserProps, id?: UniqueEntityId): Result<User> {
    const nullGuardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.createdAt, argumentName: 'createdAt' },
      { argument: props.email, argumentName: 'email' },
      { argument: props.isEmailVerified, argumentName: 'isEmailVerified' },
      { argument: props.password, argumentName: 'password' },
      { argument: props.username, argumentName: 'username' },
    ]);

    if (!nullGuardResult.succeeded) {
      return Result.fail<User>(nullGuardResult.message);
    }

    const user = new User(props, id);
    return Result.ok(user);
  }

  public static register(props: UserProps): Result<User> {
    const userResult = User.create({
      createdAt: new Date(),
      email: props.email,
      isEmailVerified: false,
      password: props.password,
      username: props.username,
    });

    const user = userResult.getValue();
    user.addDomainEvent(new UserRegistered(user));

    return userResult;
  }

  public setTokens(accessToken: AccessToken, refreshToken: RefreshToken): void {
    this.props.accessToken = accessToken;
    this.props.refreshToken = refreshToken;
  }

  public isLoggedIn(): boolean {
    return !!this.props.accessToken && !!this.props.refreshToken;
  }
}
