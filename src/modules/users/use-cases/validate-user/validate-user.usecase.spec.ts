import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { AppErrors } from '../../../../shared/core';
import { UserName } from '../../domain/user-name.valueobject';
import { UserPassword } from '../../domain/user-password.valueobject';
import { UserRepository } from '../../domain/user.repository';
import { InMemoryUserRepository } from '../../repositories/user/implementations/in-memory-user.repository';
import { ValidateUserDto } from './validate-user.dto';
import { ValidateUserErrors } from './validate-user.errors';
import { ValidateUserUsecase } from './validate-user.usecase';

describe('ValidateUserUsecase', () => {
  let userRepository: UserRepository;
  let useCase: ValidateUserUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        ValidateUserUsecase,
      ],
    }).compile();
    module.useLogger(false);

    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<ValidateUserUsecase>(ValidateUserUsecase);
  });

  it('should fail if username cannot be created', async () => {
    // Given
    const usernameFixture = '';
    const passwordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user password cannot be created', async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = '';
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it("should fail if user doesn't exist", async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      ValidateUserErrors.UserNameDoesntExistError,
    );
    expect(result.value.errorValue().message).toEqual(
      'Username or password incorrect.',
    );
  });

  it("should fail if password doesn't match", async () => {
    // Given
    const plainTextPassword = faker.internet.password(UserPassword.MIN_LENGTH);
    const hashedPassword = await UserPassword.hash(plainTextPassword);
    const userPassword = UserPassword.create({
      value: hashedPassword,
      hashed: true,
    }).getValue();
    const userNameFixture = faker.internet.userName();
    const userName = UserName.create(userNameFixture).getValue();
    const user = new UserEntityBuilder()
      .withUserName(userName)
      .withPassword(userPassword)
      .build();
    const missMatchingPasswordFixture = faker.internet.password(
      UserPassword.MIN_LENGTH,
    );
    const request: ValidateUserDto = {
      username: userNameFixture,
      password: missMatchingPasswordFixture,
    };
    await userRepository.save(user);

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      ValidateUserErrors.PasswordDoesntMatchError,
    );
    expect(result.value.errorValue().message).toEqual('Password doesnt match.');
  });

  it('should fail on any other error', async () => {
    // Given
    const spy = jest
      .spyOn(userRepository, 'getUserByUsername')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.MIN_LENGTH);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const userNameFixture = faker.internet.userName();
    const userName = UserName.create(userNameFixture).getValue();
    const plainTextPassword = faker.internet.password(UserPassword.MIN_LENGTH);
    const hashedPassword = await UserPassword.hash(plainTextPassword);
    const userPassword = UserPassword.create({
      value: hashedPassword,
      hashed: true,
    }).getValue();
    const user = new UserEntityBuilder()
      .withUserName(userName)
      .withPassword(userPassword)
      .build();
    const request: ValidateUserDto = {
      username: userNameFixture,
      password: plainTextPassword,
    };
    await userRepository.save(user);

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toBe(user);
  });
});
