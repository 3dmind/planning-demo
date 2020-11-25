import * as faker from 'faker';
import { UniqueEntityId } from '../../../shared/domain';
import { UserEmailValueObject } from './user-email.value-object';
import { UserIdEntity } from './user-id.entity';
import { UserNameValueObject } from './user-name.value-object';
import { UserPasswordValueObject } from './user-password.value-object';
import { UserPropsInterface } from './user-props.interface';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  const idFixture = faker.random.uuid();
  const userNameFixture = faker.internet.userName();
  const passwordFixture = faker.internet.password(6);
  const emailFixture = faker.internet.email();
  const entityId = new UniqueEntityId(idFixture);
  const username = UserNameValueObject.create(userNameFixture).getValue();
  const password = UserPasswordValueObject.create({
    value: passwordFixture,
  }).getValue();
  const email = UserEmailValueObject.create(emailFixture).getValue();

  describe('Guard user properties', () => {
    it('should guard username', () => {
      expect.assertions(1);
      const props = { username: null } as UserPropsInterface;

      const userEntityResult = UserEntity.create(props, entityId);

      expect(userEntityResult.isFailure).toBe(true);
    });

    it('should guard password', () => {
      expect.assertions(1);
      const props = {
        username,
        password: null,
      } as UserPropsInterface;

      const userEntityResult = UserEntity.create(props, entityId);

      expect(userEntityResult.isFailure).toBe(true);
    });

    it('should guard email', () => {
      expect.assertions(1);
      const props = {
        username,
        password,
        email: null,
      } as UserPropsInterface;

      const userEntityResult = UserEntity.create(props, entityId);

      expect(userEntityResult.isFailure).toBe(true);
    });
  });

  it('should create', () => {
    expect.assertions(7);
    const props: UserPropsInterface = {
      username,
      password,
      email,
      isEmailVerified: true,
      createdAt: new Date(),
    };

    const userEntityResult = UserEntity.create(props, entityId);
    const userEntity = userEntityResult.getValue();

    expect(userEntityResult.isSuccess).toBe(true);
    expect(userEntity.userId).toBeInstanceOf(UserIdEntity);
    expect(userEntity.userId.id.equals(entityId)).toBe(true);
    expect(userEntity.props.isEmailVerified).toBe(true);
    expect(userEntity.props.createdAt).toEqual(props.createdAt);
    expect(userEntity.email).toBe(email);
    expect(userEntity.password).toBe(password);
  });
});
