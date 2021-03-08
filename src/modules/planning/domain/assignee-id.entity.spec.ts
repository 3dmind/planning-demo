import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { AssigneeId } from './assignee-id.entity';

jest.mock('uuid');

describe('AssigneeId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should accept existing ID', () => {
    // Given
    const idFixture = new UniqueEntityId(uuid.v4());

    // When
    const assigneeIdResult = AssigneeId.create(idFixture);
    const assigneeId = assigneeIdResult.getValue();

    // Then
    expect.assertions(2);
    expect(assigneeIdResult.isSuccess).toBe(true);
    expect(assigneeId.id.equals(idFixture)).toBe(true);
  });

  it('should create new ID', () => {
    // When
    const assigneeIdResult = AssigneeId.create();
    const assigneeId = assigneeIdResult.getValue();

    // Then
    expect.assertions(2);
    expect(assigneeIdResult.isSuccess).toBe(true);
    expect(assigneeId.id).toBeDefined();
  });
});
