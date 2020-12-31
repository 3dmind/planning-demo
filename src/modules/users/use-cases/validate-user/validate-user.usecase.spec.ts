import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { AppErrors } from '../../../../shared/core';
import { UserPassword } from '../../domain/user-password.valueobject';
import { UserRepository } from '../../repositories/user.repository';
import { ValidateUserDto } from './validate-user.dto';
import { ValidateUserErrors } from './validate-user.errors';
import { ValidateUserUsecase } from './validate-user.usecase';

describe('ValidateUserUsecase', () => {
  const mockedUserRepository = mock<UserRepository>();
  let useCase: ValidateUserUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: mockedUserRepository },
        ValidateUserUsecase,
      ],
    }).compile();
    module.useLogger(false);

    useCase = await module.resolve<ValidateUserUsecase>(ValidateUserUsecase);
  });

  afterAll(() => {
    mockReset(mockedUserRepository);
  });

  it('should fail if username cannot be created', async () => {
    expect.assertions(1);
    const usernameFixture = '';
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user password cannot be created', async () => {
    expect.assertions(1);
    const usernameFixture = faker.internet.userName();
    const passwordFixture = '';
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it("should fail if user doesn't exist", async () => {
    expect.assertions(3);
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };
    mockedUserRepository.getUserByUsername.mockResolvedValueOnce({
      found: false,
    });

    const result = await useCase.execute(request);

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
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const hashedPassword = await UserPassword.create({
      value: passwordFixture,
      hashed: false,
    })
      .getValue()
      .getHashedValue();
    const missMatchingPasswordFixture = faker.internet.password(
      UserPassword.minLength,
    );
    const userEntity = new UserEntityBuilder({
      username: usernameFixture,
      password: hashedPassword,
      passwordIsHashed: true,
    }).build();
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: missMatchingPasswordFixture,
    };
    mockedUserRepository.getUserByUsername.mockResolvedValue({
      found: true,
      userEntity,
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      ValidateUserErrors.PasswordDoesntMatchError,
    );
    expect(result.value.errorValue().message).toEqual('Password doesnt match.');
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
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
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const hashedPassword = await UserPassword.create({
      value: passwordFixture,
      hashed: false,
    })
      .getValue()
      .getHashedValue();
    const userEntity = new UserEntityBuilder({
      username: usernameFixture,
      password: hashedPassword,
      passwordIsHashed: true,
    }).build();
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };
    mockedUserRepository.getUserByUsername.mockResolvedValue({
      found: true,
      userEntity,
    });

    const result = await useCase.execute(request);

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toBe(userEntity);
  });
});
