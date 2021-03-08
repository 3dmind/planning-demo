import * as faker from 'faker';
import { UserEmail } from './user-email.valueobject';

describe('UserEmail', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    // Given
    const email = null;

    // When
    const userEmailResult = UserEmail.create(email);

    // Then
    expect.assertions(1);
    expect(userEmailResult.isFailure).toBe(true);
  });

  it('should be guarded against invalid email address', () => {
    // Given
    const email = 'lorem ipsum';

    // When
    const userEmailResult = UserEmail.create(email);

    // Then
    expect.assertions(2);
    expect(userEmailResult.isFailure).toBe(true);
    expect(userEmailResult.errorValue()).toEqual('Email address is not valid.');
  });

  it('should be created', () => {
    // Given
    const email = faker.internet.email('tom', 'test', 'gmail.com');

    // When
    const userEmailResult = UserEmail.create(email);
    const userEmail = userEmailResult.getValue();

    // Then
    expect.assertions(3);
    expect(userEmailResult.isSuccess).toBe(true);
    expect(userEmail).toBeDefined();
    expect(userEmail.value).toEqual(email);
  });
});
