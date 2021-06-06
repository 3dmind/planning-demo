import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserId } from '../../../../users/domain/user-id.entity';
import { MemberRepository } from '../../../domain/member.repository';
import { InMemoryMemberRepository } from '../../../repositories/member/implementations/in-memory-member.repository';
import { CreateMemberDto } from './create-member.dto';
import { CreateMemberErrors } from './create-member.errors';
import { CreateMemberUseCase } from './create-member.use-case';

describe('CreateMemberUseCase', () => {
  let memberRepository: MemberRepository;
  let useCase: CreateMemberUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MemberRepository,
          useClass: InMemoryMemberRepository,
        },
        CreateMemberUseCase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = module.get<MemberRepository>(MemberRepository);
    useCase = module.get<CreateMemberUseCase>(CreateMemberUseCase);
  });

  it('should fail if member already exists', async () => {
    // Given
    const userId = UserId.create().getValue();
    const request: CreateMemberDto = {
      userId: userId.toString(),
    };
    const member = new MemberEntityBuilder().withUserId(userId).build();
    await memberRepository.save(member);

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CreateMemberErrors.MemberAlreadyExistsError);
    expect(result.value.errorValue().message).toEqual(`A member for user id ${userId} already exists.`);
  });

  it('should fail on any other error', async () => {
    // Given
    const entityId = new UniqueEntityId();
    const request: CreateMemberDto = {
      userId: entityId.toString(),
    };
    const spy = jest.spyOn(memberRepository, 'getMemberByUserId');
    spy.mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const entityId = new UniqueEntityId();
    const request: CreateMemberDto = {
      userId: entityId.toString(),
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(1);
    expect(result.isRight()).toBe(true);
  });
});
