import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../../test/builder/user-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { UserRepository } from '../../../../users/repositories/user.repository';
import { MemberRepository } from '../../../repositories/member.repository';
import { CreateMemberDto } from './create-member.dto';
import { CreateMemberErrors } from './create-member.errors';
import { CreateMemberUsecase } from './create-member.usecase';

describe('CreateMemberUsecase', () => {
  const mockedUserRepository = mock<UserRepository>();
  const mockedMemberRepository = mock<MemberRepository>();
  let useCase: CreateMemberUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useValue: mockedUserRepository,
        },
        {
          provide: MemberRepository,
          useValue: mockedMemberRepository,
        },
        CreateMemberUsecase,
      ],
    }).compile();
    module.useLogger(false);

    useCase = await module.resolve<CreateMemberUsecase>(CreateMemberUsecase);
  });

  afterAll(async () => {
    mockReset(mockedUserRepository);
    mockReset(mockedMemberRepository);
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
    mockedUserRepository.getUserByUserId.mockResolvedValueOnce({
      found: false,
    });

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
    const request: CreateMemberDto = {
      userId: idFixture,
    };
    mockedUserRepository.getUserByUserId.mockResolvedValueOnce({
      found: true,
      user: userFixture,
    });
    mockedMemberRepository.getMemberByUserId.mockResolvedValueOnce({
      found: true,
    });

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
    mockedUserRepository.getUserByUserId.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    expect.assertions(1);
    const userFixture = new UserEntityBuilder().build();
    const request: CreateMemberDto = {
      userId: userFixture.userId.id.toString(),
    };
    mockedUserRepository.getUserByUserId.mockResolvedValueOnce({
      found: true,
      user: userFixture,
    });
    mockedMemberRepository.getMemberByUserId.mockResolvedValueOnce({
      found: false,
    });

    const result = await useCase.execute(request);

    expect(result.isRight()).toBe(true);
  });
});
