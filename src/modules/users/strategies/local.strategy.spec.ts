import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { UserEntityBuilder } from '../../../../test/builder/user-entity.builder';
import { AppErrors, left, Result } from '../../../shared/core';
import { UserName } from '../domain/user-name.valueobject';
import { UserPassword } from '../domain/user-password.valueobject';
import { UserRepository } from '../domain/user.repository';
import { InMemoryUserRepository } from '../repositories/user/implementations/in-memory-user.repository';
import { ValidateUserErrors } from '../use-cases/validate-user/validate-user.errors';
import { ValidateUserUseCase } from '../use-cases/validate-user/validate-user.use-case';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let userRepository: UserRepository;
  let validateUserUseCase: ValidateUserUseCase;
  let strategy: LocalStrategy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        ValidateUserUseCase,
        LocalStrategy,
      ],
    }).compile();
    module.useLogger(false);

    userRepository = module.get<UserRepository>(UserRepository);
    validateUserUseCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should deny access if username does not exist', async () => {
    // Given
    const userNameDoesntExistError = new ValidateUserErrors.UserNameDoesntExistError();
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.MIN_LENGTH);

    // When
    const promise = strategy.validate(usernameFixture, passwordFixture);

    // Then
    expect.assertions(2);
    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toThrow(userNameDoesntExistError.errorValue().message);
  });

  it('should deny access if password does not match', async () => {
    // Given
    const passwordDoesntMatchError = new ValidateUserErrors.PasswordDoesntMatchError();
    const notMatchingPasswordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const userNameFixture = faker.internet.userName();
    const userPasswordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const hashedPasswordFixture = await UserPassword.hash(userPasswordFixture);
    const userPassword = UserPassword.create({
      value: hashedPasswordFixture,
      hashed: true,
    }).getValue();
    const userName = UserName.create(userNameFixture).getValue();
    const user = new UserEntityBuilder().withUserName(userName).withPassword(userPassword).build();
    await userRepository.save(user);

    // When
    const promise = strategy.validate(userNameFixture, notMatchingPasswordFixture);

    // Then
    expect.assertions(2);
    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toThrow(passwordDoesntMatchError.errorValue().message);
  });

  it('should deny access on any unexpected error', async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const unexpectedError = new AppErrors.UnexpectedError(new Error());
    const spy = jest.spyOn(userRepository, 'getUserByUsername').mockImplementationOnce(() => {
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
    const passwordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const failure = Result.fail<string>('Lorem ipsum');
    const spy = jest.spyOn(validateUserUseCase, 'execute').mockResolvedValueOnce(left(failure));

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
    const userNameFixture = faker.internet.userName();
    const userName = UserName.create(userNameFixture).getValue();
    const passwordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const hashedPasswordFixture = await UserPassword.hash(passwordFixture);
    const userPassword = UserPassword.create({
      value: hashedPasswordFixture,
      hashed: true,
    }).getValue();
    const user = new UserEntityBuilder().withUserName(userName).withPassword(userPassword).build();
    await userRepository.save(user);

    // When
    const result = await strategy.validate(userNameFixture, passwordFixture);

    // Then
    expect.assertions(1);
    expect(result).toBe(user);
  });
});
