import { Guard, Result } from '../../../../shared/core';
import { ValueObject } from '../../../../shared/domain';

interface CommentTextProps {
  value: string;
}

export class CommentText extends ValueObject<CommentTextProps> {
  private constructor(props: CommentTextProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(text: string): Result<CommentText> {
    const guardResult = Guard.againstNullOrUndefined(text, 'text');
    if (!guardResult.succeeded) {
      return Result.fail(guardResult.message);
    }

    const againstEmpty = Guard.againstEmpty(text);
    if (!againstEmpty.succeeded) {
      return Result.fail(againstEmpty.message);
    }

    return Result.ok(new CommentText({ value: text }));
  }
}
