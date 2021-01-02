import { UniqueEntityId } from '../../../shared/domain';
import { UserEmail } from './user-email.valueobject';
import { UserName } from './user-name.valueobject';
import { UserPassword } from './user-password.valueobject';
import { UserSnapshot } from './user-snapshot';
import { User } from './user.entity';

describe('UserSnapshot', () => {
  it('should be defined', () => {
    expect.assertions(2);
    const id = new UniqueEntityId('8597ccd9-4237-44a6-b434-8836693c4b51');
    const username = UserName.create('TomTest').getValue();
    const password = UserPassword.create({
      value: '123456',
    }).getValue();
    const email = UserEmail.create('tom.test@gmail.com').getValue();
    const createdAt = new Date(Date.parse('1977-01-01'));
    const accessToken = '8597ccd9423744a6b4348836693c4b51';
    const refreshToken = '8597ccd9423744a6b4348836693c4b51';
    const user = User.create(
      {
        accessToken,
        createdAt,
        email,
        isEmailVerified: false,
        password,
        refreshToken,
        username,
      },
      id,
    ).getValue();

    const userSnapshot = new UserSnapshot(user.props, user.userId);

    expect(userSnapshot).toMatchSnapshot();
    expect(Object.isFrozen(userSnapshot)).toBe(true);
  });
});
