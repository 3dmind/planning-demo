import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserRepository } from '../../../../users/repositories/user/user.repository';
import { Member } from '../../../domain/member.entity';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { CreateMemberDto } from './create-member.dto';
import { CreateMemberErrors } from './create-member.errors';

type Response = Either<
  | AppErrors.UnexpectedError
  | CreateMemberErrors.UserDoesntExistError
  | CreateMemberErrors.MemberAlreadyExistsError
  | Result<any>,
  Result<void>
>;

@Injectable()
export class CreateMemberUsecase implements UseCase<CreateMemberDto, Response> {
  private readonly logger = new Logger(CreateMemberUsecase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async execute(request: CreateMemberDto): Promise<Response> {
    this.logger.log('Creating member...');
    const userId = new UniqueEntityId(request.userId);

    try {
      const {
        found: userFound,
        user,
      } = await this.userRepository.getUserByUserId(userId);
      if (!userFound) {
        const userDoesntExistError = new CreateMemberErrors.UserDoesntExistError(
          userId.toString(),
        );
        this.logger.debug(userDoesntExistError.errorValue().message);
        return left(userDoesntExistError);
      }

      const {
        found: memberFound,
      } = await this.memberRepository.getMemberByUserId(userId);
      if (memberFound) {
        const memberAlreadyExistsError = new CreateMemberErrors.MemberAlreadyExistsError(
          userId.toString(),
        );
        this.logger.debug(memberAlreadyExistsError.errorValue().message);
        return left(memberAlreadyExistsError);
      }

      const memberResult = Member.create({
        userId: user.userId,
      });
      await this.memberRepository.save(memberResult.getValue());

      this.logger.log('Member successfully created');
      return right(Result.ok());
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
