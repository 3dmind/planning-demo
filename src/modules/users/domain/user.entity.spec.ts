import * as faker from 'faker';
import { UniqueEntityId } from '../../../shared/domain';
import { UserEmail } from './user-email.valueobject';
import { UserId } from './user-id.entity';
import { UserName } from './user-name.valueobject';
import { UserPassword } from './user-password.valueobject';
import { UserProps } from './user-props.interface';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  const idFixture = faker.random.uuid();
  const userNameFixture = faker.internet.userName();
  const passwordFixture = faker.internet.password(6);
  const emailFixture = faker.internet.email();
  const entityId = new UniqueEntityId(idFixture);
  const username = UserName.create(userNameFixture).getValue();
  const password = UserPassword.create({
    value: passwordFixture,
  }).getValue();
  const email = UserEmail.create(emailFixture).getValue();

  describe('Guard user properties', () => {
    it('should guard username', () => {
      expect.assertions(1);
      const props = { username: null } as UserProps;

      const userEntityResult = UserEntity.create(props, entityId);

      expect(userEntityResult.isFailure).toBe(true);
    });

    it('should guard password', () => {
      expect.assertions(1);
      const props = {
        username,
        password: null,
      } as UserProps;

      const userEntityResult = UserEntity.create(props, entityId);

      expect(userEntityResult.isFailure).toBe(true);
    });

    it('should guard email', () => {
      expect.assertions(1);
      const props = {
        username,
        password,
        email: null,
      } as UserProps;

      const userEntityResult = UserEntity.create(props, entityId);

      expect(userEntityResult.isFailure).toBe(true);
    });
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

    const userEntityResult = UserEntity.create(props, entityId);
    const userEntity = userEntityResult.getValue();

    expect(userEntityResult.isSuccess).toBe(true);
    expect(userEntity.userId).toBeInstanceOf(UserId);
    expect(userEntity.userId.id.equals(entityId)).toBe(true);
    expect(userEntity.props.isEmailVerified).toBe(true);
    expect(userEntity.props.createdAt).toEqual(props.createdAt);
    expect(userEntity.email).toBe(email);
    expect(userEntity.password).toBe(password);
  });

  it('should determine if user is logged in', () => {
    const accessTokenFixture = faker.random.alphaNumeric(20);
    const refreshTokenFixture = faker.random.alphaNumeric(20);
    const user = UserEntity.create({
      email,
      password,
      username,
    }).getValue();

    expect(user.isLoggedIn()).toBe(false);

    user.setTokens(accessTokenFixture, refreshTokenFixture);

    expect(user.isLoggedIn()).toBe(true);
  });
});
