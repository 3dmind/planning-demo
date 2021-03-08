import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { UserEntityBuilder } from '../../../../test/builder/user-entity.builder';
import { AppErrors, left, Result } from '../../../shared/core';
import { UserPassword } from '../domain/user-password.valueobject';
import { InMemoryUserRepository } from '../repositories/user/in-memory-user.repository';
import { UserRepository } from '../repositories/user/user.repository';
import { ValidateUserErrors } from '../use-cases/validate-user/validate-user.errors';
import { ValidateUserUsecase } from '../use-cases/validate-user/validate-user.usecase';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let userRepository: UserRepository;
  let validateUserUseCase: ValidateUserUsecase;
  let strategy: LocalStrategy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        ValidateUserUsecase,
        LocalStrategy,
      ],
    }).compile();
    module.useLogger(false);

    userRepository = module.get<UserRepository>(UserRepository);
    validateUserUseCase = module.get<ValidateUserUsecase>(ValidateUserUsecase);
    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should deny access if username does not exist', async () => {
    // Given
    const userNameDoesntExistError = new ValidateUserErrors.UserNameDoesntExistError();
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);

    // When
    const promise = strategy.validate(usernameFixture, passwordFixture);

    // Then
    expect.assertions(2);
    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      userNameDoesntExistError.errorValue().message,
    );
  });

  it('should deny access if password does not match', async () => {
    // Given
    const hashedPassword = await UserPassword.create({
      value: faker.internet.password(UserPassword.minLength),
    })
      .getValue()
      .getHashedValue();
    const user = new UserEntityBuilder({
      passwordIsHashed: true,
      password: hashedPassword,
    }).build();
    const username = user.username.value;
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const passwordDoesntMatchError = new ValidateUserErrors.PasswordDoesntMatchError();
    await userRepository.save(user);

    // When
    const promise = strategy.validate(username, passwordFixture);

    // Then
    expect.assertions(2);
    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      passwordDoesntMatchError.errorValue().message,
    );
  });

  it('should deny access on any unexpected error', async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const unexpectedError = new AppErrors.UnexpectedError(new Error());
    const spy = jest
      .spyOn(userRepository, 'getUserByUsername')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    // When
    const promise = strategy.validate(usernameFixture, passwordFixture);

    // Then
    expect.assertions(2);
    await expect(promise).rejects.toThrow(InternalServerErrorException);
    await expect(promise).rejects.toThrow(unexpectedError.errorValue().message);

    spy.mockRestore();
  });

  it('should deny access on any other error', async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const failure = Result.fail<string>('Lorem ipsum');
    const spy = jest
      .spyOn(validateUserUseCase, 'execute')
      .mockResolvedValueOnce(left(failure));

    // When
    const promise = strategy.validate(usernameFixture, passwordFixture);

    // Then
    expect.assertions(2);
    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toThrow(failure.errorValue());

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const hashedPassword = await UserPassword.create({ value: passwordFixture })
      .getValue()
      .getHashedValue();
    const user = new UserEntityBuilder({
      username: usernameFixture,
      password: hashedPassword,
      passwordIsHashed: true,
    }).build();
    await userRepository.save(user);

    // When
    const result = await strategy.validate(usernameFixture, passwordFixture);

    // Then
    expect.assertions(1);
    expect(result).toBe(user);
  });
});
