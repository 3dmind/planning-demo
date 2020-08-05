import { Guard, Result } from '../../../shared/core';
import { ValueObject } from '../../../shared/domain';

interface DescriptionProps {
  value: string;
}

export class Description extends ValueObject<DescriptionProps> {
  public static minLength = 2;
  public static maxLength = 250;

  private constructor(props: DescriptionProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(text: string): Result<Description> {
    const nullGuardResult = Guard.againstNullOrUndefined(text, 'Description');

    if (!nullGuardResult.succeeded) {
      return Result.fail<Description>(nullGuardResult.message);
    }

    const minGuardResult = Guard.againstAtLeast(this.minLength, text);
    const maxGuardResult = Guard.againstAtMost(this.maxLength, text);

    if (!minGuardResult.succeeded) {
      return Result.fail<Description>(minGuardResult.message);
    }

    if (!maxGuardResult.succeeded) {
      return Result.fail<Description>(maxGuardResult.message);
    }

    return Result.ok<Description>(new Description({ value: text }));
  }
}
