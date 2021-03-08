import * as faker from 'faker';
import { UserPassword } from './user-password.valueobject';

describe('UserPassword', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    // When
    const userPasswordResult = UserPassword.create({
      value: null,
      hashed: false,
    });

    // Then
    expect.assertions(1);
    expect(userPasswordResult.isFailure).toBe(true);
  });

  it('should be guarded against to short passwords', () => {
    // Given
    const password = faker.internet.password(UserPassword.minLength - 1);

    // When
    const userPasswordResult = UserPassword.create({
      value: password,
      hashed: false,
    });

    // Then
    expect.assertions(1);
    expect(userPasswordResult.isFailure).toBe(true);
  });

  it('should be created', () => {
    // Given
    const passwordFixture = faker.internet.password(UserPassword.minLength);

    // When
    const userPasswordResult = UserPassword.create({
      value: passwordFixture,
      hashed: false,
    });
    const userPassword = userPasswordResult.getValue();

    // Then
    expect.assertions(3);
    expect(userPasswordResult.isSuccess).toBe(true);
    expect(userPassword).toBeDefined();
    expect(userPassword.value).toEqual(passwordFixture);
  });
});
