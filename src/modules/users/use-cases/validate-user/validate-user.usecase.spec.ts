import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppErrors } from '../../../../shared/core';
import { UserEmailValueObject } from '../../domain/user-email.value-object';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserPasswordValueObject } from '../../domain/user-password.value-object';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../repositories/user.repository';
import { ValidateUserErrors } from './validate-user.errors';
import { ValidateUserUsecase } from './validate-user.usecase';

describe('ValidateUserUsecase', () => {
  const mockedLogger = mock<Logger>();
  const mockedUserRepository = mock<UserRepository>();

  const usernameFixture = faker.internet.userName();
  const passwordFixture = faker.internet.password(6);
  const emailFixture = faker.internet.email();
  const username = UserNameValueObject.create(usernameFixture).getValue();
  const password = UserPasswordValueObject.create({
    value: passwordFixture,
  }).getValue();
  const email = UserEmailValueObject.create(emailFixture).getValue();

  let useCase: ValidateUserUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: UserRepository, useValue: mockedUserRepository },
        ValidateUserUsecase,
      ],
    }).compile();

    useCase = await module.resolve<ValidateUserUsecase>(ValidateUserUsecase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedUserRepository);
  });

  it('should fail if username cannot be created', async () => {
    expect.assertions(1);
    const username = '';
    const password = faker.internet.password(6);

    const result = await useCase.execute({
      username,
      password,
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user password cannot be created', async () => {
    expect.assertions(1);
    const username = faker.internet.userName();
    const password = '';

    const result = await useCase.execute({
      username,
      password,
    });

    expect(result.isLeft()).toBe(true);
  });

  it("should fail if user doesn't exist", async () => {
    expect.assertions(3);
    const username = faker.internet.userName();
    const password = faker.internet.password(6);
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: false,
    });

    const result = await useCase.execute({
      username,
      password,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      ValidateUserErrors.UserNameDoesntExistError,
    );
    expect(result.value.errorValue().message).toEqual(
      'Username or password incorrect.',
    );
  });

  it("should fail if password doesn't match", async () => {
    expect.assertions(3);
    const userEntity = UserEntity.create({
      username,
      password,
      email,
    }).getValue();
    const spy = jest
      .spyOn(userEntity.password, 'comparePassword')
      .mockResolvedValue(false);
    mockedUserRepository.getUserByUsername.mockResolvedValue({
      found: true,
      userEntity,
    });

    const result = await useCase.execute({
      username: usernameFixture,
      password: passwordFixture,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      ValidateUserErrors.PasswordDoesntMatchError,
    );
    expect(result.value.errorValue().message).toEqual('Password doesnt match.');

    spy.mockRestore();
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    mockedUserRepository.getUserByUsername.mockImplementationOnce(() => {
      throw new Error('BOOM!');
    });

    const result = await useCase.execute({
      username: usernameFixture,
      password: passwordFixture,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const userEntity = UserEntity.create({
      username,
      password,
      email,
    }).getValue();
    const spy = jest
      .spyOn(userEntity.password, 'comparePassword')
      .mockResolvedValue(true);
    mockedUserRepository.getUserByUsername.mockResolvedValue({
      found: true,
      userEntity,
    });

    const result = await useCase.execute({
      username: usernameFixture,
      password: passwordFixture,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toBe(userEntity);

    spy.mockRestore();
  });
});
