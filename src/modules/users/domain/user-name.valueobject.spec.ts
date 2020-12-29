import * as faker from 'faker';
import { UserName } from './user-name.valueobject';

describe('UserName', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    const username = null;

    const userNameResult = UserName.create(username);

    expect(userNameResult.isFailure).toBe(true);
  });

  it('should be guarded against empty name', () => {
    const username = '   ';

    const userNameResult = UserName.create(username);

    expect(userNameResult.isFailure).toBe(true);
  });

  it('should be created', () => {
    const nameFixture = faker.internet.userName();

    const userNameResult = UserName.create(nameFixture);
    const userName = userNameResult.getValue();

    expect(userNameResult.isSuccess).toBe(true);
    expect(userName).toBeDefined();
    expect(userName.value).toEqual(nameFixture);
  });
});
