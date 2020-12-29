import * as faker from 'faker';
import { UserEmail } from './user-email.valueobject';

describe('UserEmail', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    expect.assertions(1);
    const email = null;

    const userEmailResult = UserEmail.create(email);

    expect(userEmailResult.isFailure).toBe(true);
  });

  it('should be guarded against invalid email address', () => {
    expect.assertions(2);
    const email = 'lorem ipsum';

    const userEmailResult = UserEmail.create(email);

    expect(userEmailResult.isFailure).toBe(true);
    expect(userEmailResult.errorValue()).toEqual('Email address is not valid.');
  });

  it('should be created', () => {
    expect.assertions(3);
    const email = faker.internet.email('tom', 'test', 'gmail.com');

    const userEmailResult = UserEmail.create(email);
    const userEmail = userEmailResult.getValue();

    expect(userEmailResult.isSuccess).toBe(true);
    expect(userEmail).toBeDefined();
    expect(userEmail.value).toEqual(email);
  });
});
