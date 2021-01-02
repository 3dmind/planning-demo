import {
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppErrors, left, Result, right } from '../../../shared/core';
import { User } from '../domain/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { ValidateUserErrors } from '../use-cases/validate-user/validate-user.errors';
import { ValidateUserUsecase } from '../use-cases/validate-user/validate-user.usecase';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  const mockedLogger = mock<Logger>();
  const mockedUserRepository = mock<UserRepository>();
  const mockedValidateUserUseCase = mock<ValidateUserUsecase>();
  let strategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: UserRepository, useValue: mockedUserRepository },
        { provide: ValidateUserUsecase, useValue: mockedValidateUserUseCase },
        LocalStrategy,
      ],
    }).compile();

    strategy = await module.resolve<LocalStrategy>(LocalStrategy);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedUserRepository);
    mockReset(mockedValidateUserUseCase);
  });

  it("should deny access if username doesn't exist", async () => {
    expect.assertions(2);
    const userNameDoesntExistError = new ValidateUserErrors.UserNameDoesntExistError();
    mockedValidateUserUseCase.execute.mockResolvedValueOnce(
      left(userNameDoesntExistError),
    );

    return strategy.validate('', '').catch((error) => {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual(
        userNameDoesntExistError.errorValue().message,
      );
    });
  });

  it("should deny access if password doesn't match", async () => {
    expect.assertions(2);
    const passwordDoesntMatchError = new ValidateUserErrors.PasswordDoesntMatchError();
    mockedValidateUserUseCase.execute.mockResolvedValueOnce(
      left(passwordDoesntMatchError),
    );

    return strategy.validate('', '').catch((error) => {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual(
        passwordDoesntMatchError.errorValue().message,
      );
    });
  });

  it('should deny access on any unexpected error', async () => {
    expect.assertions(2);
    const unexpectedError = new AppErrors.UnexpectedError(new Error());
    mockedValidateUserUseCase.execute.mockResolvedValueOnce(
      left(unexpectedError),
    );

    return strategy.validate('', '').catch((error) => {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toEqual(unexpectedError.errorValue().message);
    });
  });

  it('should deny access on any other error', async () => {
    expect.assertions(2);
    const failure = Result.fail<string>('Lorem ipsum');
    mockedValidateUserUseCase.execute.mockResolvedValueOnce(left(failure));

    return strategy.validate('', '').catch((error) => {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual(failure.errorValue());
    });
  });

  it('should', async () => {
    expect.assertions(1);
    const username = faker.internet.userName();
    const password = faker.internet.password(6);
    const mockedUser = {} as User;
    mockedValidateUserUseCase.execute.mockResolvedValueOnce(
      right(Result.ok<User>(mockedUser)),
    );

    const user = await strategy.validate(username, password);

    expect(user).toBe(mockedUser);
  });
});
