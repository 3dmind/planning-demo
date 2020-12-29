import * as bcrypt from 'bcrypt';
import { Guard, Result } from '../../../shared/core';
import { ValueObject } from '../../../shared/domain';

interface UserPasswordProps {
  value: string;
  hashed?: boolean;
}

const SALT_ROUNDS = 10;

export class UserPassword extends ValueObject<UserPasswordProps> {
  public static minLength = 6;

  private constructor(props: UserPasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(props: UserPasswordProps): Result<UserPassword> {
    const nullGuardResult = Guard.againstNullOrUndefined(
      props.value,
      'password',
    );
    if (!nullGuardResult.succeeded) {
      return Result.fail<UserPassword>(nullGuardResult.message);
    }

    if (!props.hashed) {
      const minGuardResult = Guard.againstAtLeast(this.minLength, props.value);
      if (!minGuardResult.succeeded) {
        return Result.fail<UserPassword>(minGuardResult.message);
      }
    }

    return Result.ok<UserPassword>(
      new UserPassword({
        value: props.value,
        hashed: !!props.hashed === true,
      }),
    );
  }

  public isAlreadyHashed(): boolean {
    return this.props.hashed;
  }

  public async getHashedValue(): Promise<string> {
    if (this.isAlreadyHashed()) {
      return this.props.value;
    }

    return bcrypt.hash(this.props.value, SALT_ROUNDS);
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, this.props.value);
  }
}
