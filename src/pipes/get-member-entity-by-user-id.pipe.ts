import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { Member } from '../modules/planning/domain/member.entity';
import { GetMemberByUserIdErrors } from '../modules/planning/use-cases/members/get-member-by-user-id/get-member-by-user-id.errors';
import { GetMemberByUserIdUseCase } from '../modules/planning/use-cases/members/get-member-by-user-id/get-member-by-user-id.use-case';
import { UserId } from '../modules/users/domain/user-id.entity';
import { AppErrors } from '../shared/core';

@Injectable()
export class GetMemberEntityByUserIdPipe
  implements PipeTransform<UserId, Promise<Member>> {
  constructor(
    private readonly getMemberByUserIdUseCase: GetMemberByUserIdUseCase,
  ) {}

  public async transform(userId: UserId): Promise<Member> {
    const result = await this.getMemberByUserIdUseCase.execute({ userId });

    if (result.isRight()) {
      return result.value.getValue();
    }

    if (result.isLeft()) {
      const error = result.value;
      const errorCtor = Reflect.getPrototypeOf(error).constructor;

      if (errorCtor === GetMemberByUserIdErrors.MemberNotFoundError) {
        throw new NotFoundException(error.errorValue().message);
      }

      if (errorCtor === AppErrors.UnexpectedError) {
        throw new InternalServerErrorException(error.errorValue().message);
      }
    }
  }
}
