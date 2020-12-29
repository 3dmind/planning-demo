import { Guard, Result } from '../../../shared/core';
import { ValueObject } from '../../../shared/domain';

interface UserNameProps {
  value: string;
}

export class UserName extends ValueObject<UserNameProps> {
  private constructor(props: UserNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(userName: string): Result<UserName> {
    const nullGuardResult = Guard.againstNullOrUndefined(userName, 'userName');
    if (!nullGuardResult.succeeded) {
      return Result.fail<UserName>(nullGuardResult.message);
    }

    const emptyGuardResult = Guard.againstEmpty(userName);
    if (!emptyGuardResult.succeeded) {
      return Result.fail<UserName>(emptyGuardResult.message);
    }

    return Result.ok<UserName>(new UserName({ value: userName }));
  }
}
