import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppErrors } from '../../../../shared/core';
import { AuthService } from '../../auth.service';
import { UserEmailValueObject } from '../../domain/user-email.value-object';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserPasswordValueObject } from '../../domain/user-password.value-object';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../user.repository';
import { RefreshAccessTokenRequestDto } from './refresh-access-token-request.dto';
import { RefreshAccessTokenErrors } from './refresh-access-token.errors';
import { RefreshAccessTokenUseCase } from './refresh-access-token.usecase';

describe('RefreshAccessTokenUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedUserRepository = mock<UserRepository>();
  const mockedAuthService = mock<AuthService>();

  const usernameFixture = faker.internet.userName();
  const passwordFixture = faker.internet.password(6);
  const emailFixture = faker.internet.email();
  const username = UserNameValueObject.create(usernameFixture).getValue();
  const password = UserPasswordValueObject.create({
    value: passwordFixture,
  }).getValue();
  const email = UserEmailValueObject.create(emailFixture).getValue();

  let useCase: RefreshAccessTokenUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: UserRepository, useValue: mockedUserRepository },
        { provide: AuthService, useValue: mockedAuthService },
        RefreshAccessTokenUseCase,
      ],
    }).compile();

    useCase = await module.resolve<RefreshAccessTokenUseCase>(
      RefreshAccessTokenUseCase,
    );
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedUserRepository);
    mockReset(mockedAuthService);
  });

  it('should fail if username cannot be created', async () => {
    expect.assertions(1);
    const request: RefreshAccessTokenRequestDto = {
      username: '',
    };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user cannot be found', async () => {
    expect.assertions(3);
    const request: RefreshAccessTokenRequestDto = {
      username: usernameFixture,
    };
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: false,
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      RefreshAccessTokenErrors.UserNotFoundError,
    );
    expect(result.value.errorValue().message).toEqual(
      `User with the username '${usernameFixture}' does not exist.`,
    );
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const request: RefreshAccessTokenRequestDto = {
      username: usernameFixture,
    };
    mockedUserRepository.getUserByUsername.mockImplementationOnce(() => {
      throw new Error('BOOM!');
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    expect.assertions(2);
    const userEntity = UserEntity.create({
      username,
      password,
      email,
    }).getValue();
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: true,
      userEntity,
    });
    const accessTokenFixture = faker.random.alphaNumeric(256);
    mockedAuthService.createAccessToken.mockReturnValue(accessTokenFixture);
    const request: RefreshAccessTokenRequestDto = {
      username: usernameFixture,
    };

    const result = await useCase.execute(request);

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toEqual(accessTokenFixture);
  });
});
