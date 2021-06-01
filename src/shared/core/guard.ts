import { GuardArgument } from './guard-argument.interface';
import { GuardResult } from './guard-result.interface';

export class Guard {
  public static combine(guardResults: GuardResult[]): GuardResult {
    for (const result of guardResults) {
      if (result.succeeded === false) {
        return result;
      }
    }

    return { succeeded: true };
  }

  public static greaterThan(minValue: number, actualValue: number): GuardResult {
    return actualValue > minValue
      ? { succeeded: true }
      : {
          succeeded: false,
          message: `Number given {${actualValue}} is not greater than {${minValue}}`,
        };
  }

  public static againstAtLeast(numChars: number, text: string): GuardResult {
    return text.length >= numChars
      ? { succeeded: true }
      : {
          succeeded: false,
          message: `Text is not at least ${numChars} chars.`,
        };
  }

  public static againstAtMost(numChars: number, text: string): GuardResult {
    return text.length <= numChars
      ? { succeeded: true }
      : {
          succeeded: false,
          message: `Text is greater than ${numChars} chars.`,
        };
  }

  public static againstEmpty(text: string): GuardResult {
    return text.trim().length !== 0
      ? { succeeded: true }
      : {
          succeeded: false,
          message: `Text is empty.`,
        };
  }

  public static againstNullOrUndefined(argument: unknown, argumentName: string): GuardResult {
    if (argument === null || argument === undefined) {
      return {
        succeeded: false,
        message: `${argumentName} is null or undefined`,
      };
    } else {
      return { succeeded: true };
    }
  }

  public static againstNullOrUndefinedBulk(args: GuardArgument[]): GuardResult {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (!result.succeeded) {
        return result;
      }
    }

    return { succeeded: true };
  }

  public static isOneOf(value: unknown, validValues: any[], argumentName: string): GuardResult {
    let isValid = false;
    for (const validValue of validValues) {
      if (value === validValue) {
        isValid = true;
      }
    }

    if (isValid) {
      return { succeeded: true };
    } else {
      return {
        succeeded: false,
        message: `${argumentName} isn't oneOf the correct types in ${JSON.stringify(validValues)}. Got "${value}".`,
      };
    }
  }

  public static inRange(num: number, min: number, max: number, argumentName: string): GuardResult {
    const isInRange = num >= min && num <= max;
    if (!isInRange) {
      return {
        succeeded: false,
        message: `${argumentName} is not within range ${min} to ${max}.`,
      };
    } else {
      return { succeeded: true };
    }
  }

  public static allInRange(numbers: number[], min: number, max: number, argumentName: string): GuardResult {
    let failingResult: GuardResult = null;
    for (const num of numbers) {
      const numIsInRangeResult = this.inRange(num, min, max, argumentName);
      if (!numIsInRangeResult.succeeded) {
        failingResult = numIsInRangeResult;
      }
    }

    if (failingResult) {
      return {
        succeeded: false,
        message: `${argumentName} is not within the range.`,
      };
    } else {
      return { succeeded: true };
    }
  }
}
