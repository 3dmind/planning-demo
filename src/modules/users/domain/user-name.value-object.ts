import { Guard, Result } from '../../../shared/core';
import { ValueObject } from '../../../shared/domain';

interface UserNamePropsInterface {
  value: string;
}

export class UserNameValueObject extends ValueObject<UserNamePropsInterface> {
  private constructor(props: UserNamePropsInterface) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(username: string): Result<UserNameValueObject> {
    const nullGuardResult = Guard.againstNullOrUndefined(username, 'username');
    if (!nullGuardResult.succeeded) {
      return Result.fail<UserNameValueObject>(nullGuardResult.message);
    }

    const emptyGuardResult = Guard.againstEmpty(username);
    if (!emptyGuardResult.succeeded) {
      return Result.fail<UserNameValueObject>(emptyGuardResult.message);
    }

    return Result.ok<UserNameValueObject>(
      new UserNameValueObject({ value: username }),
    );
  }
}
