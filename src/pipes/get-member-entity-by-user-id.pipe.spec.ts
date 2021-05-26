import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../test/builder/member-entity.builder';
import { MemberRepository } from '../modules/planning/domain/member.repository';
import { InMemoryMemberRepository } from '../modules/planning/repositories/member/implementations/in-memory-member.repository';
import { GetMemberByUserIdUseCase } from '../modules/planning/use-cases/members/get-member-by-user-id/get-member-by-user-id.use-case';
import { UserId } from '../modules/users/domain/user-id.entity';
import { GetMemberEntityByUserIdPipe } from './get-member-entity-by-user-id.pipe';

describe('GetMemberEntityByUserIdPipe', () => {
  let memberRepository: MemberRepository;
  let pipe: GetMemberEntityByUserIdPipe;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MemberRepository,
          useClass: InMemoryMemberRepository,
        },
        GetMemberByUserIdUseCase,
        GetMemberEntityByUserIdPipe,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = module.get<MemberRepository>(MemberRepository);
    pipe = module.get<GetMemberEntityByUserIdPipe>(GetMemberEntityByUserIdPipe);
  });

  it('should throw NotFoundException if the member cannot be found', async () => {
    // Given
    const userId = UserId.create().getValue();

    // When
    const promise = pipe.transform(userId);

    // Then
    expect.assertions(1);
    await expect(promise).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException on any other error', async () => {
    // Given
    const userId = UserId.create().getValue();
    const spy = jest
      .spyOn(memberRepository, 'getMemberByUserId')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    // When
    const promise = pipe.transform(userId);

    // Then
    expect.assertions(1);
    await expect(promise).rejects.toThrow(InternalServerErrorException);

    spy.mockRestore();
  });

  it('should get member by its user-id', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    // When
    const result = await pipe.transform(member.userId);

    // Then
    expect.assertions(1);
    expect(result.equals(member)).toBeTruthy();
  });
});
