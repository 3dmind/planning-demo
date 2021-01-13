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

  beforeEach(async () => {
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

    userRepository = await module.resolve<UserRepository>(UserRepository);
    validateUserUseCase = await module.resolve<ValidateUserUsecase>(
      ValidateUserUsecase,
    );
    strategy = await module.resolve<LocalStrategy>(LocalStrategy);
  });

  it('should deny access if username does not exist', async () => {
    expect.assertions(2);
    const userNameDoesntExistError = new ValidateUserErrors.UserNameDoesntExistError();
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);

    return strategy
      .validate(usernameFixture, passwordFixture)
      .catch((error) => {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(
          userNameDoesntExistError.errorValue().message,
        );
      });
  });

  it('should deny access if password does not match', async () => {
    expect.assertions(2);
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

    return strategy.validate(username, passwordFixture).catch((error) => {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual(
        passwordDoesntMatchError.errorValue().message,
      );
    });
  });

  it('should deny access on any unexpected error', async () => {
    expect.assertions(2);
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const unexpectedError = new AppErrors.UnexpectedError(new Error());
    const spy = jest
      .spyOn(userRepository, 'getUserByUsername')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    return strategy
      .validate(usernameFixture, passwordFixture)
      .catch((error) => {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual(unexpectedError.errorValue().message);
      })
      .finally(() => {
        spy.mockRestore();
      });
  });

  it('should deny access on any other error', async () => {
    expect.assertions(2);
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const failure = Result.fail<string>('Lorem ipsum');
    const spy = jest
      .spyOn(validateUserUseCase, 'execute')
      .mockResolvedValueOnce(left(failure));

    return strategy
      .validate(usernameFixture, passwordFixture)
      .catch((error) => {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(failure.errorValue());
      })
      .finally(() => {
        spy.mockRestore();
      });
  });

  it('should succeed', async () => {
    expect.assertions(1);
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

    const result = await strategy.validate(usernameFixture, passwordFixture);

    expect(result).toBe(user);
  });
});
