import { Result, UseCaseError } from '../../../../../shared/core';
import { MemberId } from '../../../domain/member-id.entity';

export namespace AssignTaskErrors {
  export class MemberNotFoundError extends Result<UseCaseError> {
    constructor(memberId: MemberId) {
      super(false, {
        message: `Could not find member by the id {${memberId}}.`,
      });
    }
  }
}
