import { AccessToken, RefreshToken } from './jwt';
import { UserEmailValueObject } from './user-email.value-object';
import { UserIdEntity } from './user-id.entity';
import { UserNameValueObject } from './user-name.value-object';
import { UserPasswordValueObject } from './user-password.value-object';
import { UserPropsInterface } from './user-props.interface';

export class UserSnapshot {
  readonly accessToken: AccessToken;
  readonly createdAt: Date;
  readonly email: UserEmailValueObject;
  readonly isEmailVerified: boolean;
  readonly password: UserPasswordValueObject;
  readonly refreshToken: RefreshToken;
  readonly userId: UserIdEntity;
  readonly username: UserNameValueObject;

  constructor(props: Readonly<UserPropsInterface>, userId: UserIdEntity) {
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
