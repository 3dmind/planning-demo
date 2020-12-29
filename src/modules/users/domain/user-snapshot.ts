import { AccessToken, RefreshToken } from './jwt';
import { UserEmail } from './user-email.valueobject';
import { UserId } from './user-id.entity';
import { UserName } from './user-name.valueobject';
import { UserPassword } from './user-password.valueobject';
import { UserProps } from './user-props.interface';

export class UserSnapshot {
  readonly accessToken: AccessToken;
  readonly createdAt: Date;
  readonly email: UserEmail;
  readonly isEmailVerified: boolean;
  readonly password: UserPassword;
  readonly refreshToken: RefreshToken;
  readonly userId: UserId;
  readonly username: UserName;

  constructor(props: Readonly<UserProps>, userId: UserId) {
    this.accessToken = props.accessToken;
    this.createdAt = props.createdAt;
    this.email = props.email;
    this.isEmailVerified = props.isEmailVerified;
    this.password = props.password;
    this.refreshToken = props.refreshToken;
    this.userId = userId;
    this.username = props.username;

    Object.freeze(this);
  }
}
