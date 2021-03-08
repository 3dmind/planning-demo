import * as faker from 'faker';
import { Description } from './description.valueobject';

describe('Description', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    // When
    const descriptionResult = Description.create(null);

    // Then
    expect.assertions(1);
    expect(descriptionResult.isFailure).toBe(true);
  });

  it('should have at least the minimum text length', () => {
    // When
    const descriptionResult = Description.create('');

    // Then
    expect.assertions(1);
    expect(descriptionResult.isFailure).toBe(true);
  });

  it('should not exceed the maximum text length', () => {
    // Given
    const text = faker.lorem.words(250);

    // When
    const descriptionResult = Description.create(text);

    // Then
    expect.assertions(1);
    expect(descriptionResult.isFailure).toBe(true);
  });

  it('should be created', () => {
    // Given
    const text = faker.lorem.sentence(5);

    // When
    const descriptionResult = Description.create(text);
    const description = descriptionResult.getValue();

    // Then
    expect.assertions(3);
    expect(descriptionResult.isSuccess).toBe(true);
    expect(description).toBeDefined();
    expect(description.value).toEqual(text);
  });
});
