import * as faker from 'faker';
import { UserName } from './user-name.valueobject';

describe('UserName', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    // Given
    const username = null;

    // When
    const userNameResult = UserName.create(username);

    // Then
    expect.assertions(1);
    expect(userNameResult.isFailure).toBe(true);
  });

  it('should be guarded against empty name', () => {
    // Given
    const username = '   ';

    // When
    const userNameResult = UserName.create(username);

    // Then
    expect.assertions(1);
    expect(userNameResult.isFailure).toBe(true);
  });

  it('should be created', () => {
    // Given
    const nameFixture = faker.internet.userName();

    // When
    const userNameResult = UserName.create(nameFixture);
    const userName = userNameResult.getValue();

    // Then
    expect.assertions(3);
    expect(userNameResult.isSuccess).toBe(true);
    expect(userName).toBeDefined();
    expect(userName.value).toEqual(nameFixture);
  });
});
