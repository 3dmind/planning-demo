import {
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppErrors, left, Result, right } from '../../../shared/core';
import { UserEntity } from '../domain/user.entity';
import { ValidateUserErrors } from '../use-cases/validate-user/validate-user.errors';
import { ValidateUserUseCase } from '../use-cases/validate-user/validate-user.usecase';
import { UserRepository } from '../user.repository';
import { LocalPassportStrategy } from './local-passport.strategy';

describe('LocalPassportStrategy', () => {
  const mockedLogger = mock<Logger>();
  const mockedUserRepository = mock<UserRepository>();
  const mockedValidateUserUseCase = mock<ValidateUserUseCase>();
  let strategy: LocalPassportStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: UserRepository, useValue: mockedUserRepository },
        { provide: ValidateUserUseCase, useValue: mockedValidateUserUseCase },
        LocalPassportStrategy,
      ],
    }).compile();

    strategy = await module.resolve<LocalPassportStrategy>(
      LocalPassportStrategy,
    );
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedUserRepository);
    mockReset(mockedValidateUserUseCase);
  });

  it("should deny access if username doesn't exist", async () => {
    expect.assertions(2);
    const userNameDoesntExistError = ValidateUserErrors.UserNameDoesntExistError.create();
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
    const passwordDoesntMatchError = ValidateUserErrors.PasswordDoesntMatchError.create();
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
    const unexpectedError = AppErrors.UnexpectedError.create(
      new Error('BOOM!'),
    );
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
    const mockedUser = {} as UserEntity;
    mockedValidateUserUseCase.execute.mockResolvedValueOnce(
      right(Result.ok<UserEntity>(mockedUser)),
    );

    const userEntity = await strategy.validate(username, password);

    expect(userEntity).toBe(mockedUser);
  });
});
