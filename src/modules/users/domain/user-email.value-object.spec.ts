import * as faker from 'faker';
import { UserEmailValueObject } from './user-email.value-object';

describe('UserEmailValueObject', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    expect.assertions(1);
    const email = null;

    const userEmailResult = UserEmailValueObject.create(email);

    expect(userEmailResult.isFailure).toBe(true);
  });

  it('should be guarded against invalid email address', () => {
    expect.assertions(2);
    const email = 'lorem ipsum';

    const userEmailResult = UserEmailValueObject.create(email);

    expect(userEmailResult.isFailure).toBe(true);
    expect(userEmailResult.errorValue()).toEqual('Email address is not valid.');
  });

  it('should be created', () => {
    expect.assertions(3);
    const email = faker.internet.email('tom', 'test', 'gmail.com');

    const userEmailResult = UserEmailValueObject.create(email);
    const userEmail = userEmailResult.getValue();

    expect(userEmailResult.isSuccess).toBe(true);
    expect(userEmail).toBeDefined();
    expect(userEmail.value).toEqual(email);
  });
});
