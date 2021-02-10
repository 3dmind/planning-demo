import { Prisma } from '@prisma/client';

export const e2eUser: Prisma.BaseUserModelCreateManyInput = {
  baseUserId: 'ef3052a7-d19e-4308-bdb2-08ff0d18e90a',
  createdAt: new Date().toISOString(),
  isEmailVerified: false,
  userEmail: 'e2e@planning.demo',
  username: 'e2e-planning-demo',
  userPassword: 'e2e-planning-demo',
};

export const alice: Prisma.BaseUserModelCreateManyInput = {
  baseUserId: 'd0c03cc6-4648-45bc-8546-4d3e6f03787a',
  createdAt: new Date().toISOString(),
  isEmailVerified: false,
  userEmail: 'alice@planning.demo',
  username: 'alice',
  userPassword: 'alice1234',
};

export const bob: Prisma.BaseUserModelCreateManyInput = {
  baseUserId: '5b6c64c4-2826-4ccb-a7b0-2e463b7dab02',
  createdAt: new Date().toISOString(),
  isEmailVerified: false,
  userEmail: 'bob@planning.demo',
  username: 'bob',
  userPassword: 'bob1234',
};

// No member is associated with this user.
export const noMemberUser: Prisma.BaseUserModelCreateManyInput = {
  baseUserId: 'c70374c4-7ff9-4cd6-af2b-855b61cfc318',
  createdAt: new Date().toISOString(),
  isEmailVerified: false,
  userEmail: 'no-member@planning.demo',
  username: 'no-member-planning-demo',
  userPassword: 'no-member-planning-demo',
};
