import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppErrors, Result } from '../../../../shared/core';
import { UserEmailValueObject } from '../../domain/user-email.value-object';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserPasswordValueObject } from '../../domain/user-password.value-object';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../user.repository';
import { CreateUserDto } from './create-user.dto';
import { CreateUserErrors } from './create-user.errors';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedUserRepository = mock<UserRepository>();
  let useCase: CreateUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: UserRepository, useValue: mockedUserRepository },
        CreateUserUseCase,
      ],
    }).compile();

    useCase = await module.resolve<CreateUserUseCase>(CreateUserUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedUserRepository);
  });

  it('should fail if username cannot be created', async () => {
    expect.assertions(2);
    const spy = jest
      .spyOn(UserNameValueObject, 'create')
      .mockReturnValue(Result.fail<UserNameValueObject>('error'));
    const request = {} as CreateUserDto;
    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if user password cannot be created', async () => {
    expect.assertions(2);
    const mockedUserNameValueObject = jest
      .spyOn(UserNameValueObject, 'create')
      .mockReturnValue(Result.ok<UserNameValueObject>());
    const mockedUserPasswordValueObject = jest
      .spyOn(UserPasswordValueObject, 'create')
      .mockReturnValue(Result.fail<UserPasswordValueObject>('error'));

    const request = {} as CreateUserDto;
    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    mockedUserNameValueObject.mockRestore();
    mockedUserPasswordValueObject.mockRestore();
  });

  it('should fail if user email cannot be created', async () => {
    expect.assertions(2);
    const mockedUserNameValueObject = jest
      .spyOn(UserNameValueObject, 'create')
      .mockReturnValue(Result.ok<UserNameValueObject>());
    const mockedUserPasswordValueObject = jest
      .spyOn(UserPasswordValueObject, 'create')
      .mockReturnValue(Result.ok<UserPasswordValueObject>());
    const mockedUserEmailValueObject = jest
      .spyOn(UserEmailValueObject, 'create')
      .mockReturnValue(Result.fail<UserEmailValueObject>('error'));

    const request = {} as CreateUserDto;
    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    mockedUserNameValueObject.mockRestore();
    mockedUserPasswordValueObject.mockRestore();
    mockedUserEmailValueObject.mockRestore();
  });

  it('should fail if user already exists', async () => {
    expect.assertions(3);
    mockedUserRepository.exists.mockResolvedValueOnce(true);
    const email = faker.internet.email().toLowerCase();
    const password = faker.internet.password(6);
    const username = faker.internet.userName();

    const result = await useCase.execute({
      email,
      password,
      username,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      CreateUserErrors.EmailAlreadyExistsError,
    );
    expect(result.value.errorValue().message).toEqual(
      `The email ${email} associated for this account already exists.`,
    );
  });

  it('should fail if username already taken', async () => {
    expect.assertions(3);
    mockedUserRepository.exists.mockResolvedValueOnce(false);
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: true,
    });
    const email = faker.internet.email().toLowerCase();
    const password = faker.internet.password(6);
    const username = faker.internet.userName();

    const result = await useCase.execute({
      email,
      password,
      username,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CreateUserErrors.UsernameTakenError);
    expect(result.value.errorValue().message).toEqual(
      `The username ${username} was already taken.`,
    );
  });

  it('should fail if user cannot be created', async () => {
    expect.assertions(2);
    mockedUserRepository.exists.mockResolvedValueOnce(false);
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: false,
    });
    const spy = jest
      .spyOn(UserEntity, 'create')
      .mockReturnValue(Result.fail<UserEntity>('error'));
    const email = faker.internet.email().toLowerCase();
    const password = faker.internet.password(6);
    const username = faker.internet.userName();

    const result = await useCase.execute({
      username,
      password,
      email,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    mockedUserRepository.exists.mockResolvedValueOnce(false);
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: false,
    });
    mockedUserRepository.save.mockImplementationOnce(() => {
      throw new Error('BOOM!');
    });
    const email = faker.internet.email().toLowerCase();
    const password = faker.internet.password(6);
    const username = faker.internet.userName();

    const result = await useCase.execute({
      email,
      password,
      username,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    expect.assertions(1);
    mockedUserRepository.exists.mockResolvedValueOnce(false);
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: false,
    });
    mockedUserRepository.save.mockResolvedValueOnce();
    const email = faker.internet.email().toLowerCase();
    const password = faker.internet.password(6);
    const username = faker.internet.userName();

    const result = await useCase.execute({
      email,
      password,
      username,
    });

    expect(result.isRight()).toBe(true);
  });
});
