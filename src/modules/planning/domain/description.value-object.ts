import { Guard, Result } from '../../../shared/core';
import { ValueObject } from '../../../shared/domain';

interface DescriptionPropsInterface {
  value: string;
}

export class DescriptionValueObject extends ValueObject<
  DescriptionPropsInterface
> {
  public static minLength = 2;
  public static maxLength = 250;

  private constructor(props: DescriptionPropsInterface) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(text: string): Result<DescriptionValueObject> {
    const nullGuardResult = Guard.againstNullOrUndefined(text, 'text');

    if (!nullGuardResult.succeeded) {
      return Result.fail<DescriptionValueObject>(nullGuardResult.message);
    }

    const minGuardResult = Guard.againstAtLeast(this.minLength, text);
    const maxGuardResult = Guard.againstAtMost(this.maxLength, text);

    if (!minGuardResult.succeeded) {
      return Result.fail<DescriptionValueObject>(minGuardResult.message);
    }

    if (!maxGuardResult.succeeded) {
      return Result.fail<DescriptionValueObject>(maxGuardResult.message);
    }

    return Result.ok<DescriptionValueObject>(
      new DescriptionValueObject({ value: text }),
    );
  }
}
