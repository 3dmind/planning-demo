import { UserEmailValueObject } from './user-email.value-object';
import { UserIdEntity } from './user-id.entity';
import { UserNameValueObject } from './user-name.value-object';
import { UserPasswordValueObject } from './user-password.value-object';
import { UserPropsInterface } from './user-props.interface';

export class UserSnapshot {
  readonly createdAt: Date;
  readonly email: UserEmailValueObject;
  readonly isEmailVerified: boolean;
  readonly password: UserPasswordValueObject;
  readonly userId: UserIdEntity;
  readonly username: UserNameValueObject;

  constructor(props: Readonly<UserPropsInterface>, userId: UserIdEntity) {
    this.createdAt = props.createdAt;
    this.email = props.email;
    this.isEmailVerified = props.isEmailVerified;
    this.password = props.password;
    this.userId = userId;
    this.username = props.username;

    Object.freeze(this);
  }
}
