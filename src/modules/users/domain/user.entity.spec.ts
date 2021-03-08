import * as faker from 'faker';
import * as uuid from 'uuid';
import { UserEntityBuilder } from '../../../../test/builder/user-entity.builder';
import { UniqueEntityId } from '../../../shared/domain';
import { UserEmail } from './user-email.valueobject';
import { UserId } from './user-id.entity';
import { UserName } from './user-name.valueobject';
import { UserPassword } from './user-password.valueobject';
import { UserProps } from './user-props.interface';
import { User } from './user.entity';

jest.mock('uuid');

describe('User', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  const idFixture = faker.random.uuid();
  const userNameFixture = faker.internet.userName();
  const passwordFixture = faker.internet.password(UserPassword.minLength);
  const emailFixture = faker.internet.email();
  const entityId = new UniqueEntityId(idFixture);
  const username = UserName.create(userNameFixture).getValue();
  const password = UserPassword.create({
    value: passwordFixture,
  }).getValue();
  const email = UserEmail.create(emailFixture).getValue();

  it('should guard "username" property', () => {
    // Given
    const props = { username: null } as UserProps;

    // When
    const userResult = User.create(props, entityId);

    // Then
    expect.assertions(1);
    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "password" property', () => {
    // Given
    const props = {
      username,
      password: null,
    } as UserProps;

    // When
    const userResult = User.create(props, entityId);

    expect.assertions(1);
    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "email" property', () => {
    // Given
    const props = {
      username,
      password,
      email: null,
    } as UserProps;

    // When
    const userResult = User.create(props, entityId);

    // Then
    expect.assertions(1);
    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "isEmailVerified" property', () => {
    // Given
    const props = {
      username,
      password,
      email,
      isEmailVerified: null,
    } as UserProps;

    // When
    const userResult = User.create(props, entityId);

    // Then
    expect.assertions(1);
    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "createdAt" property', () => {
    // Given
    const props = {
      username,
      password,
      email,
      isEmailVerified: false,
      createdAt: null,
    } as UserProps;

    // When
    const userResult = User.create(props, entityId);

    // Then
    expect.assertions(1);
    expect(userResult.isFailure).toBe(true);
  });

  it('should create', () => {
    // Given
    const props: UserProps = {
      username,
      password,
      email,
      isEmailVerified: true,
      createdAt: new Date(),
    };

    // When
    const userResult = User.create(props, entityId);
    const user = userResult.getValue();

    // Then
    expect.assertions(7);
    expect(userResult.isSuccess).toBe(true);
    expect(user.userId).toBeInstanceOf(UserId);
    expect(user.userId.id.equals(entityId)).toBe(true);
    expect(user.isEmailVerified).toBe(true);
    expect(user.createdAt).toEqual(props.createdAt);
    expect(user.email).toBe(email);
    expect(user.password).toBe(password);
  });

  it('should determine if user is logged in', () => {
    // Given
    const accessTokenFixture = faker.random.alphaNumeric(20);
    const refreshTokenFixture = faker.random.alphaNumeric(20);
    const user = new UserEntityBuilder().build();

    // When
    user.setTokens(accessTokenFixture, refreshTokenFixture);

    // Then
    expect.assertions(1);
    expect(user.isLoggedIn()).toBe(true);
  });
});
