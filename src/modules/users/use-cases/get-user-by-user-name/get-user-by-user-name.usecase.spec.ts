import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock } from 'jest-mock-extended';
import { AppErrors } from '../../../../shared/core';
import { UserEmailValueObject } from '../../domain/user-email.value-object';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserPasswordValueObject } from '../../domain/user-password.value-object';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../user.repository';
import { GetUserByUserNameDto } from './get-user-by-user-name.dto';
import { GetUserByUserNameError } from './get-user-by-user-name.errors';
import { GetUserByUserNameUseCase } from './get-user-by-user-name.usecase';

describe('GetUserByUserNameUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedUserRepository = mock<UserRepository>();
  let useCase: GetUserByUserNameUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: UserRepository, useValue: mockedUserRepository },
        GetUserByUserNameUseCase,
      ],
    }).compile();

    useCase = await module.resolve<GetUserByUserNameUseCase>(
      GetUserByUserNameUseCase,
    );
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
    const passwordFixture = faker.internet.password(6);
    const emailFixture = faker.internet.email();
    const username = UserNameValueObject.create(usernameFixture).getValue();
    const password = UserPasswordValueObject.create({
      value: passwordFixture,
    }).getValue();
    const email = UserEmailValueObject.create(emailFixture).getValue();
    const userEntity = UserEntity.create({
      email,
      password,
      username,
    }).getValue();

    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: true,
      userEntity,
    });
    const requestFixture: GetUserByUserNameDto = {
      username: usernameFixture,
    };

    const result = await useCase.execute(requestFixture);

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toBe(userEntity);
  });
});
