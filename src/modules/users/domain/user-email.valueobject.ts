import { isEmail } from 'class-validator';
import { Guard, Result } from '../../../shared/core';
import { ValueObject } from '../../../shared/domain';

interface UserEmailProps {
  value: string;
}

export class UserEmail extends ValueObject<UserEmailProps> {
  private constructor(props: UserEmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(email: string): Result<UserEmail> {
    const nullGuardResult = Guard.againstNullOrUndefined(email, 'email');
    if (!nullGuardResult.succeeded) {
      return Result.fail<UserEmail>(nullGuardResult.message);
    }

    if (!this.isValidEmail(email)) {
      return Result.fail<UserEmail>('Email address is not valid.');
    }

    return Result.ok<UserEmail>(
      new UserEmail({
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
