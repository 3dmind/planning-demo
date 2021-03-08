import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { OwnerId } from './owner-id.entity';

jest.mock('uuid');

describe('OwnerId', () => {
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
    const ownerIdResult = OwnerId.create(idFixture);
    const ownerId = ownerIdResult.getValue();

    // Then
    expect.assertions(2);
    expect(ownerIdResult.isSuccess).toBe(true);
    expect(ownerId.id.equals(idFixture)).toBe(true);
  });

  it('should create new ID', () => {
    // When
    const ownerIdResult = OwnerId.create();
    const ownerId = ownerIdResult.getValue();

    // Then
    expect.assertions(2);
    expect(ownerIdResult.isSuccess).toBe(true);
    expect(ownerId.id).toBeDefined();
  });
});
