import { UniqueEntityId } from '../../../shared/domain';
import { UserEmailValueObject } from './user-email.value-object';
import { UserNameValueObject } from './user-name.value-object';
import { UserPasswordValueObject } from './user-password.value-object';
import { UserSnapshot } from './user-snapshot';
import { UserEntity } from './user.entity';

describe('UserSnapshot', () => {
  it('should be defined', () => {
    expect.assertions(2);
    const id = new UniqueEntityId('8597ccd9-4237-44a6-b434-8836693c4b51');
    const username = UserNameValueObject.create('TomTest').getValue();
    const password = UserPasswordValueObject.create({
      value: '123456',
    }).getValue();
    const email = UserEmailValueObject.create('tom.test@gmail.com').getValue();
    const createdAt = new Date(Date.parse('1977-01-01'));
    const userEntity = UserEntity.create(
      {
        createdAt,
        email,
        isEmailVerified: false,
        password,
        username,
      },
      id,
    ).getValue();

    const userSnapshot = new UserSnapshot(userEntity.props, userEntity.userId);

    expect(userSnapshot).toMatchSnapshot();
    expect(Object.isFrozen(userSnapshot)).toBe(true);
  });
});
