import * as faker from 'faker';
import { UserNameValueObject } from './user-name.value-object';

describe('UserNameValueObject', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    const username = null;

    const userNameResult = UserNameValueObject.create(username);

    expect(userNameResult.isFailure).toBe(true);
  });

  it('should be guarded against empty name', () => {
    const username = '   ';

    const userNameResult = UserNameValueObject.create(username);

    expect(userNameResult.isFailure).toBe(true);
  });

  it('should be created', () => {
    const nameFixture = faker.internet.userName();

    const userNameResult = UserNameValueObject.create(nameFixture);
    const userName = userNameResult.getValue();

    expect(userNameResult.isSuccess).toBe(true);
    expect(userName).toBeDefined();
    expect(userName.value).toEqual(nameFixture);
  });
});
