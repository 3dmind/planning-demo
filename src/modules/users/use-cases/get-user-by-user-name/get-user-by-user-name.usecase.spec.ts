import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { AppErrors } from '../../../../shared/core';
import { UserRepository } from '../../repositories/user.repository';
import { GetUserByUserNameDto } from './get-user-by-user-name.dto';
import { GetUserByUserNameError } from './get-user-by-user-name.errors';
import { GetUserByUserNameUsecase } from './get-user-by-user-name.usecase';

describe('GetUserByUserNameUsecase', () => {
  const mockedUserRepository = mock<UserRepository>();
  let useCase: GetUserByUserNameUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: mockedUserRepository },
        GetUserByUserNameUsecase,
      ],
    }).compile();
    module.useLogger(false);

    useCase = await module.resolve<GetUserByUserNameUsecase>(
      GetUserByUserNameUsecase,
    );
  });

  afterAll(() => {
    mockReset(mockedUserRepository);
  });

  it('should fail if username cannot be created', async () => {
    expect.assertions(1);
    const requestFixture: GetUserByUserNameDto = {
      username: null,
    };

    const result = await useCase.execute(requestFixture);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user cannot be found', async () => {
    expect.assertions(3);
    const usernameFixture = faker.internet.userName();
    const requestFixture: GetUserByUserNameDto = {
      username: usernameFixture,
    };
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: false,
    });

    const result = await useCase.execute(requestFixture);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      GetUserByUserNameError.UserNotFoundError,
    );
    expect(result.value.errorValue().message).toEqual(
      `User with the username '${usernameFixture}' does not exist.`,
    );
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const usernameFixture = faker.internet.userName();
    const requestFixture: GetUserByUserNameDto = {
      username: usernameFixture,
    };
    mockedUserRepository.getUserByUsername.mockImplementationOnce(() => {
      throw new Error('BOOM!');
    });

    const result = await useCase.execute(requestFixture);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    expect.assertions(2);
    const usernameFixture = faker.internet.userName();
    const user = new UserEntityBuilder({
      username: usernameFixture,
    }).build();
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: true,
      user,
    });
    const requestFixture: GetUserByUserNameDto = {
      username: usernameFixture,
    };

    const result = await useCase.execute(requestFixture);

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toBe(user);
  });
});
