import * as faker from 'faker';
import { CommentText } from './comment-text.valueobject';

describe('CommentText', () => {
  it('should have value', () => {
    // Given
    const text = faker.lorem.paragraph();

    // When
    const commentText = CommentText.create(text).getValue();

    // Then
    expect(commentText.value).toEqual(text);
  });

  it('should be guarded against undefined text', () => {
    // Given
    const text1 = null;
    const text2 = undefined;

    // When
    const result1 = CommentText.create(text1);
    const result2 = CommentText.create(text2);

    // Then
    expect.assertions(2);
    expect(result1.isFailure).toBe(true);
    expect(result2.isFailure).toBe(true);
  });

  it('should not have empty text', () => {
    // Given
    const text = '';

    // When
    const result = CommentText.create(text);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });
});
