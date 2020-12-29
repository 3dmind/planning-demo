import * as faker from 'faker';
import { DescriptionValueObject } from './description.value-object';

describe('DescriptionValueObject', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    const descriptionResult = DescriptionValueObject.create(null);

    expect(descriptionResult.isFailure).toBe(true);
  });

  it('should have at least the minimum text length', () => {
    const descriptionResult = DescriptionValueObject.create('');

    expect(descriptionResult.isFailure).toBe(true);
  });

  it('should not exceed the maximum text length', () => {
    const text = faker.lorem.words(250);

    const descriptionResult = DescriptionValueObject.create(text);

    expect(descriptionResult.isFailure).toBe(true);
  });

  describe('should be created', () => {
    const text = faker.lorem.sentence(5);

    const descriptionResult = DescriptionValueObject.create(text);
    const description = descriptionResult.getValue();

    expect(descriptionResult.isSuccess).toBe(true);
    expect(description).toBeDefined();
    expect(description.value).toEqual(text);
  });
});
