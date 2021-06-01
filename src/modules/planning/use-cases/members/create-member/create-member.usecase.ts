import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserId } from '../../../../users/domain/user-id.entity';
import { Member } from '../../../domain/member.entity';
import { MemberRepository } from '../../../domain/member.repository';
import { CreateMemberDto } from './create-member.dto';
import { CreateMemberErrors } from './create-member.errors';

type Response = Either<
  AppErrors.UnexpectedError | CreateMemberErrors.MemberAlreadyExistsError | Result<any>,
  Result<void>
>;

@Injectable()
export class CreateMemberUsecase implements UseCase<CreateMemberDto, Response> {
  private readonly logger = new Logger(CreateMemberUsecase.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  public async execute(createMemberDto: CreateMemberDto): Promise<Response> {
    this.logger.log('Creating member...');
    const userId = UserId.create(new UniqueEntityId(createMemberDto.userId)).getValue();

    try {
      const { found: memberFound } = await this.memberRepository.getMemberByUserId(userId.id);
      if (memberFound) {
        const memberAlreadyExistsError = new CreateMemberErrors.MemberAlreadyExistsError(userId);
        this.logger.debug(memberAlreadyExistsError.errorValue().message);
        return left(memberAlreadyExistsError);
      }

      const memberResult = Member.create({ userId });
      await this.memberRepository.save(memberResult.getValue());

      this.logger.log('Member successfully created');
      return right(Result.ok());
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
