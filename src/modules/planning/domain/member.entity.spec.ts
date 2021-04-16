import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { UserId } from '../../users/domain/user-id.entity';
import { MemberProps } from './member-props.interface';
import { Member } from './member.entity';

jest.mock('uuid');

describe('Member entity', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should guard "userId" property', () => {
    // Given
    const propsWithNull = { userId: null } as MemberProps;
    const propsWithUndefined = {} as MemberProps;

    // When
    const memberResultNull = Member.create(propsWithNull);
    const memberResultUndefined = Member.create(propsWithUndefined);

    // Then
    expect.assertions(4);
    expect(memberResultNull.isFailure).toBe(true);
    expect(memberResultNull.errorValue()).toEqual(
      'userId is null or undefined',
    );
    expect(memberResultUndefined.isFailure).toBe(true);
    expect(memberResultUndefined.errorValue()).toEqual(
      'userId is null or undefined',
    );
  });

  it('should create new member', () => {
    // Given
    const userIdFixture = UserId.create().getValue();
    const idFixture = faker.random.uuid();
    const entityIdFixture = new UniqueEntityId(idFixture);
    const dateFixture = new Date();

    // When
    const memberResult = Member.create(
      {
        createdAt: dateFixture,
        userId: userIdFixture,
      },
      entityIdFixture,
    );
    const member = memberResult.getValue();

    // Then
    expect.assertions(7);
    expect(memberResult.isSuccess).toBe(true);
    expect(member.memberId.id.equals(entityIdFixture)).toBe(true);
    expect(member.ownerId.id.equals(entityIdFixture)).toBe(true);
    expect(member.assigneeId.id.equals(entityIdFixture)).toBe(true);
    expect(member.authorId.id.equals(entityIdFixture)).toBeTruthy();
    expect(member.userId.equals(userIdFixture)).toBe(true);
    expect(member.createdAt).toBe(dateFixture);
  });
});
