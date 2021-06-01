import * as faker from 'faker';
import { Identifier } from './identifier';

describe('Identifier', () => {
  it('should create identifier', () => {
    // Given
    const value = faker.random.number();

    // When
    const identifier = new Identifier<number>(value);

    // Then
    expect.assertions(1);
    expect(identifier).toBeDefined();
  });

  it('should contain value', () => {
    // Given
    const value = faker.random.number();
    const identifier = new Identifier<number>(value);

    // When
    const result = identifier.toValue();

    // Then
    expect.assertions(1);
    expect(result).toBe(value);
  });

  it('should compare other identifiers', async () => {
    // Given
    const value = faker.random.number();
    const identifierOne = new Identifier<number>(value);
    const identifierTwo = new Identifier<number>(value);
    const identifierThree = new Identifier<number>(faker.random.number());
    const identifierFour = new Identifier<number>(faker.random.number());
    const identifierFive = new Identifier<number>(faker.random.number());
    const id = {} as unknown as Identifier<number>;

    // Then
    expect.assertions(5);
    expect(identifierOne.equals(identifierTwo)).toBe(true);
    expect(identifierThree.equals(identifierFour)).toBe(false);
    expect(identifierFive.equals(null)).toBe(false);
    expect(identifierFive.equals(undefined)).toBe(false);
    expect(identifierFive.equals(id)).toBe(false);
  });

  it('should convert value to a string', () => {
    //?
    const value = faker.random.number();
    const identifier = new Identifier<number>(value);

    // When
    const result = identifier.toString();

    // Then
    expect.assertions(1);
    expect(result).toEqual(value.toString());
  });
});
