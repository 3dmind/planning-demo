import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';
import { Member } from '../../../domain/member.entity';
import { MemberRepository } from '../../../domain/member.repository';
import { GetMemberByUserIdErrors } from './get-member-by-user-id.errors';

type Request = {
  userId: UserId;
};

type Response = Either<
  GetMemberByUserIdErrors.MemberNotFoundError | AppErrors.UnexpectedError,
  Result<Member>
>;

@Injectable()
export class GetMemberByUserIdUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(GetMemberByUserIdUseCase.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  public async execute(request: Request): Promise<Response> {
    this.logger.log('Finding member by its user-id...');
    const { userId } = request;

    try {
      const { found, member } = await this.memberRepository.getMemberByUserId(
        userId.id,
      );
      if (!found) {
        const memberNotFoundError = new GetMemberByUserIdErrors.MemberNotFoundError(
          userId,
        );
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      } else {
        this.logger.log('Member successfully found.');
        return right(Result.ok(member));
      }
    } catch (error) {
      this.logger.debug(error.message, error.stack);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
