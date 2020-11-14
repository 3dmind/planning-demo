import { UserEmailValueObject } from './user-email.value-object';
import { UserNameValueObject } from './user-name.value-object';
import { UserPasswordValueObject } from './user-password.value-object';

export interface UserPropsInterface {
  email: UserEmailValueObject;
  isEmailVerified?: boolean;
  password: UserPasswordValueObject;
  username: UserNameValueObject;
  createdAt?: Date;
}
