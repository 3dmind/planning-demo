import { Prisma } from '@prisma/client';
import { alice, bob, e2eUser } from './users';

export const memberForAlice: Prisma.MemberModelCreateManyInput = {
  createdAt: new Date().toISOString(),
  memberBaseId: alice.baseUserId,
  memberId: 'a995c0db-3df0-4ae8-920d-d2b8b85146da',
};

export const memberForBob: Prisma.MemberModelCreateManyInput = {
  createdAt: new Date().toISOString(),
  memberBaseId: bob.baseUserId,
  memberId: '878e77d6-39ba-4367-ae0f-1e5c32d59b84',
};

export const memberForE2eUser: Prisma.MemberModelCreateManyInput = {
  createdAt: new Date().toISOString(),
  memberBaseId: e2eUser.baseUserId,
  memberId: 'b5248434-d829-466d-a9e7-9ad2c56e9531',
};
