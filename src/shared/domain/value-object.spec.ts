import * as faker from 'faker';
import { ValueObject } from './value-object';

describe('ValueObject', () => {
  interface Props {
    value: string;
  }

  class Sentence extends ValueObject<Props> {
    constructor(props: Props) {
      super(props);
    }
  }

  it('should create new value object', () => {
    // Given
    const words = faker.lorem.words();

    // When
    const sentence = new Sentence({ value: words });

    // Then
    expect.assertions(1);
    expect(sentence.props.value).toEqual(words);
  });

  it('should compare other value objects by its properties', () => {
    // Given
    const wordsA = faker.lorem.words();
    const wordsB = faker.lorem.words();

    // When
    const sentenceOne = new Sentence({ value: wordsA });
    const sentenceTwo = new Sentence({ value: wordsA });
    const sentenceThree = ({} as unknown) as Sentence;
    const sentenceFour = new Sentence({ value: wordsB });

    // Then
    expect.assertions(5);
    expect(sentenceOne.equals(null)).toBe(false);
    expect(sentenceOne.equals(undefined)).toBe(false);
    expect(sentenceOne.equals(sentenceThree)).toBe(false);
    expect(sentenceOne.equals(sentenceFour)).toBe(false);
    expect(sentenceOne.equals(sentenceTwo)).toBe(true);
  });
});
