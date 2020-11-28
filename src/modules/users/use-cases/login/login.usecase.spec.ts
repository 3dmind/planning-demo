import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppErrors } from '../../../../shared/core';
import { UserEmailValueObject } from '../../domain/user-email.value-object';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserPasswordValueObject } from '../../domain/user-password.value-object';
import { UserEntity } from '../../domain/user.entity';
import { LoginResponseDto } from './login-response.dto';
import { LoginUseCase } from './login.usecase';

describe('LoginUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedJwtService = mock<JwtService>();

  const usernameFixture = faker.internet.userName();
  const passwordFixture = faker.internet.password(6);
  const emailFixture = faker.internet.email();
  const username = UserNameValueObject.create(usernameFixture).getValue();
  const password = UserPasswordValueObject.create({
    value: passwordFixture,
  }).getValue();
  const email = UserEmailValueObject.create(emailFixture).getValue();

  let useCase: LoginUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: JwtService, useValue: mockedJwtService },
        LoginUseCase,
      ],
    }).compile();

    useCase = await module.resolve<LoginUseCase>(LoginUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedJwtService);
  });

  it('should fail on any error', async () => {
    expect.assertions(2);
    const validatedUser = UserEntity.create({
      username,
      password,
      email,
    }).getValue();
    mockedJwtService.sign.mockImplementationOnce(() => {
      throw new Error('BOOM!');
    });

    const result = await useCase.execute(validatedUser);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    expect.assertions(2);
    const accessTokenFixture = faker.random.alphaNumeric(256);
    const validatedUser = UserEntity.create({
      username,
      password,
      email,
    }).getValue();
    mockedJwtService.sign.mockReturnValue(accessTokenFixture);

    const result = await useCase.execute(validatedUser);

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toMatchObject<LoginResponseDto>({
      access_token: accessTokenFixture,
    });
  });
});
