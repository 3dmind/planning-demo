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
    expect.assertions(1);
    const props = { username: null } as UserProps;

    const userResult = User.create(props, entityId);

    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "password" property', () => {
    expect.assertions(1);
    const props = {
      username,
      password: null,
    } as UserProps;

    const userResult = User.create(props, entityId);

    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "email" property', () => {
    expect.assertions(1);
    const props = {
      username,
      password,
      email: null,
    } as UserProps;

    const userResult = User.create(props, entityId);

    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "isEmailVerified" property', () => {
    expect.assertions(1);
    const props = {
      username,
      password,
      email,
      isEmailVerified: null,
    } as UserProps;

    const userResult = User.create(props, entityId);

    expect(userResult.isFailure).toBe(true);
  });

  it('should guard "createdAt" property', () => {
    expect.assertions(1);
    const props = {
      username,
      password,
      email,
      isEmailVerified: false,
      createdAt: null,
    } as UserProps;

    const userResult = User.create(props, entityId);

    expect(userResult.isFailure).toBe(true);
  });

  it('should create', () => {
    expect.assertions(7);
    const props: UserProps = {
      username,
      password,
      email,
      isEmailVerified: true,
      createdAt: new Date(),
    };

    const userResult = User.create(props, entityId);
    const user = userResult.getValue();

    expect(userResult.isSuccess).toBe(true);
    expect(user.userId).toBeInstanceOf(UserId);
    expect(user.userId.id.equals(entityId)).toBe(true);
    expect(user.isEmailVerified).toBe(true);
    expect(user.createdAt).toEqual(props.createdAt);
    expect(user.email).toBe(email);
    expect(user.password).toBe(password);
  });

  it('should determine if user is logged in', () => {
    const accessTokenFixture = faker.random.alphaNumeric(20);
    const refreshTokenFixture = faker.random.alphaNumeric(20);
    const user = new UserEntityBuilder().build();

    expect(user.isLoggedIn()).toBe(false);

    user.setTokens(accessTokenFixture, refreshTokenFixture);

    expect(user.isLoggedIn()).toBe(true);
  });
});
