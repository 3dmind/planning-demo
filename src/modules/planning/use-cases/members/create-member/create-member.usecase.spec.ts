import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { UserEntityBuilder } from '../../../../../../test/builder/user-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { InMemoryUserRepository } from '../../../../users/repositories/user/in-memory-user.repository';
import { UserRepository } from '../../../../users/repositories/user/user.repository';
import { Member } from '../../../domain/member.entity';
import { InMemoryMemberRepository } from '../../../repositories/member/in-memory-member.repository';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { CreateMemberDto } from './create-member.dto';
import { CreateMemberErrors } from './create-member.errors';
import { CreateMemberUsecase } from './create-member.usecase';

describe('CreateMemberUsecase', () => {
  let userRepository: UserRepository;
  let memberRepository: MemberRepository;
  let useCase: CreateMemberUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        {
          provide: MemberRepository,
          useClass: InMemoryMemberRepository,
        },
        CreateMemberUsecase,
      ],
    }).compile();
    module.useLogger(false);

    userRepository = await module.resolve<UserRepository>(UserRepository);
    memberRepository = await module.resolve<MemberRepository>(MemberRepository);
    useCase = await module.resolve<CreateMemberUsecase>(CreateMemberUsecase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should fail if user does not exist', async () => {
    expect.assertions(3);
    const idFixture = faker.random.uuid();
    const request: CreateMemberDto = {
      userId: idFixture,
    };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      CreateMemberErrors.UserDoesntExistError,
    );
    expect(result.value.errorValue().message).toEqual(
      `A user for user id ${idFixture} doesn't exist.`,
    );
  });

  it('should fail if member already exists', async () => {
    expect.assertions(3);
    const userFixture = new UserEntityBuilder().build();
    const idFixture = userFixture.id.toString();
    const memberFixture = Member.create({
      userId: userFixture.userId,
    }).getValue();
    const request: CreateMemberDto = {
      userId: idFixture,
    };
    await userRepository.save(userFixture);
    await memberRepository.save(memberFixture);

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      CreateMemberErrors.MemberAlreadyExistsError,
    );
    expect(result.value.errorValue().message).toEqual(
      `A member for user id ${idFixture} already exists.`,
    );
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const idFixture = faker.random.uuid();
    const request: CreateMemberDto = {
      userId: idFixture,
    };
    const spy = jest.spyOn(userRepository, 'getUserByUserId');
    spy.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    expect.assertions(1);
    const userFixture = new UserEntityBuilder().build();
    const request: CreateMemberDto = {
      userId: userFixture.userId.id.toString(),
    };
    await userRepository.save(userFixture);

    const result = await useCase.execute(request);

    expect(result.isRight()).toBe(true);
  });
});
