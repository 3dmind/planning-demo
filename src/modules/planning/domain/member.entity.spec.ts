import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { UserId } from '../../users/domain/user-id.entity';
import { UserName } from '../../users/domain/user-name.valueobject';
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
    expect.assertions(2);
    const userIdFixture = UserId.create().getValue();
    UserName.create(faker.internet.userName()).getValue();
    const idFixture = faker.random.uuid();
    const entityIdFixture = new UniqueEntityId(idFixture);

    const memberResult = Member.create(
      {
        userId: userIdFixture,
      },
      entityIdFixture,
    );
    const member = memberResult.getValue();

    expect(memberResult.isSuccess).toBe(true);
    expect(member.memberId.id.toValue()).toEqual(idFixture);
  });

  it('should create snapshot', () => {
    expect.assertions(1);
    const userIdFixture = UserId.create(
      new UniqueEntityId('b21b86ba-a05c-4425-b8d7-09dda742199d'),
    ).getValue();
    UserName.create('TomTest').getValue();
    const dateFixture = new Date(Date.parse('1977-01-01'));
    const idFixture = new UniqueEntityId(
      '773f023e-3c57-4bd5-aa0a-0e0e0cc985ab',
    );
    const member = Member.create(
      {
        userId: userIdFixture,
        createdAt: dateFixture,
      },
      idFixture,
    ).getValue();

    const memberSnapshot = member.createSnapshot();

    expect(memberSnapshot).toMatchSnapshot();
  });
});
