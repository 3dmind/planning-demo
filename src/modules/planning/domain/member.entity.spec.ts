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
    expect.assertions(4);
    const propsWithNull = { userId: null } as MemberProps;
    const propsWithUndefined = {} as MemberProps;

    const memberResultNull = Member.create(propsWithNull);
    const memberResultUndefined = Member.create(propsWithUndefined);

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
    expect.assertions(4);
    const userIdFixture = UserId.create().getValue();
    const idFixture = faker.random.uuid();
    const entityIdFixture = new UniqueEntityId(idFixture);
    const dateFixture = new Date();

    const memberResult = Member.create(
      {
        createdAt: dateFixture,
        userId: userIdFixture,
      },
      entityIdFixture,
    );
    const member = memberResult.getValue();

    expect(memberResult.isSuccess).toBe(true);
    expect(member.memberId.id.equals(entityIdFixture)).toBe(true);
    expect(member.userId.equals(userIdFixture)).toBe(true);
    expect(member.createdAt).toBe(dateFixture);
  });
});
