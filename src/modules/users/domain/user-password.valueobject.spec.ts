import * as faker from 'faker';
import { UserPassword } from './user-password.valueobject';

describe('UserPassword', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    expect.assertions(1);

    const userPasswordResult = UserPassword.create({
      value: null,
      hashed: false,
    });

    expect(userPasswordResult.isFailure).toBe(true);
  });

  it('should be guarded against to short passwords', () => {
    expect.assertions(1);
    const password = faker.internet.password(UserPassword.minLength - 1);

    const userPasswordResult = UserPassword.create({
      value: password,
      hashed: false,
    });

    expect(userPasswordResult.isFailure).toBe(true);
  });

  it('should be created', () => {
    expect.assertions(3);
    const passwordFixture = faker.internet.password(UserPassword.minLength);

    const userPasswordResult = UserPassword.create({
      value: passwordFixture,
      hashed: false,
    });
    const userPassword = userPasswordResult.getValue();

    expect(userPasswordResult.isSuccess).toBe(true);
    expect(userPassword).toBeDefined();
    expect(userPassword.value).toEqual(passwordFixture);
  });
});
