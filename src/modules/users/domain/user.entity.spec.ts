import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { UserEmailValueObject } from './user-email.value-object';
import { UserIdEntity } from './user-id.entity';
import { UserNameValueObject } from './user-name.value-object';
import { UserPasswordValueObject } from './user-password.value-object';
import { UserPropsInterface } from './user-props.interface';
import { UserEntity } from './user.entity';

jest.mock('uuid');

describe('UserEntity', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  describe('Guard user properties', () => {
    it('should guard username', () => {
      expect.assertions(1);
      const props = { username: null } as UserPropsInterface;

      const userEntityResult = UserEntity.create(props);

      expect(userEntityResult.isFailure).toBe(true);
    });

    it('should guard password', () => {
      expect.assertions(1);
      const username = UserNameValueObject.create(
        faker.internet.userName(),
      ).getValue();
      const props = {
        username,
        password: null,
      } as UserPropsInterface;

      const userEntityResult = UserEntity.create(props);

      expect(userEntityResult.isFailure).toBe(true);
    });

    it('should guard email', () => {
      expect.assertions(1);
      const username = UserNameValueObject.create(
        faker.internet.userName(),
      ).getValue();
      const password = UserPasswordValueObject.create({
        value: faker.internet.password(6),
      }).getValue();
      const props = {
        username,
        password,
        email: null,
      } as UserPropsInterface;

      const userEntityResult = UserEntity.create(props);

      expect(userEntityResult.isFailure).toBe(true);
    });
  });

  it('should create', () => {
    expect.assertions(5);
    const entityId = new UniqueEntityId();
    const username = UserNameValueObject.create(
      faker.internet.userName(),
    ).getValue();
    const password = UserPasswordValueObject.create({
      value: faker.internet.password(6),
    }).getValue();
    const email = UserEmailValueObject.create(
      faker.internet.email(),
    ).getValue();
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
  });
});
