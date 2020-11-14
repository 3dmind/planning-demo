import { isEmail } from 'class-validator';
import { Guard, Result } from '../../../shared/core';
import { ValueObject } from '../../../shared/domain';

interface UserEmailProps {
  value: string;
}

export class UserEmailValueObject extends ValueObject<UserEmailProps> {
  private constructor(props: UserEmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(email: string): Result<UserEmailValueObject> {
    const nullGuardResult = Guard.againstNullOrUndefined(email, 'email');
    if (!nullGuardResult.succeeded) {
      return Result.fail<UserEmailValueObject>(nullGuardResult.message);
    }

    if (!this.isValidEmail(email)) {
      return Result.fail<UserEmailValueObject>('Email address is not valid.');
    }

    return Result.ok<UserEmailValueObject>(
      new UserEmailValueObject({
        value: this.format(email),
      }),
    );
  }

  public static isValidEmail(email: string): boolean {
    return isEmail(email);
  }

  private static format(email: string): string {
    return email.trim().toLowerCase();
  }
}
