import * as faker from 'faker';
import { Description } from './description';

describe('Description', () => {
  it(`should be guarded against 'null' or 'undefined'`, () => {
    const descriptionResult = Description.create(null);

    expect(descriptionResult.isFailure).toBe(true);
  });

  it('should have at least the minimum text length', () => {
    const descriptionResult = Description.create('');

    expect(descriptionResult.isFailure).toBe(true);
  });

  it('should not exceed the maximum text length', () => {
    const text = faker.lorem.words(250);

    const descriptionResult = Description.create(text);

    expect(descriptionResult.isFailure).toBe(true);
  });

  describe('should be created', () => {
    const text = faker.lorem.sentence(5);

    const descriptionResult = Description.create(text);
    const description = descriptionResult.getValue();

    expect(descriptionResult.isSuccess).toBe(true);
    expect(description).toBeDefined();
    expect(description.value).toEqual(text);
  });
});
