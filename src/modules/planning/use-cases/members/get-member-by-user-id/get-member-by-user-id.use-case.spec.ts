import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';
import { Member } from '../../../domain/member.entity';
import { MemberRepository } from '../../../domain/member.repository';
import { InMemoryMemberRepository } from '../../../repositories/member/implementations/in-memory-member.repository';
import { GetMemberByUserIdErrors } from './get-member-by-user-id.errors';
import { GetMemberByUserIdUseCase } from './get-member-by-user-id.use-case';

describe('GetMemberByUserIdUseCase', () => {
  let memberRepository: MemberRepository;
  let useCase: GetMemberByUserIdUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MemberRepository,
          useClass: InMemoryMemberRepository,
        },
        GetMemberByUserIdUseCase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = module.get<MemberRepository>(MemberRepository);
    useCase = module.get<GetMemberByUserIdUseCase>(GetMemberByUserIdUseCase);
  });

  it('should fail if the member cannot be found', async () => {
    // Given
    const userId = UserId.create().getValue();

    // When
    const result = await useCase.execute({ userId });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(
      GetMemberByUserIdErrors.MemberNotFoundError,
    );
    expect(result.value.errorValue()).toEqual({
      message: `Could not find member associated with the user id {${userId}}.`,
    });
  });

  it('should fail on any other error', async () => {
    // Given
    const userId = UserId.create().getValue();
    const spy = jest
      .spyOn(memberRepository, 'getMemberByUserId')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    // When
    const result = await useCase.execute({ userId });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should find member by its user-id', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      userId: member.userId,
    });
    const foundMember = result.value.getValue() as Member;

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBeTruthy();
    expect(foundMember.equals(member)).toBeTruthy();
  });
});
