import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { e2eUser, noMemberUser } from './seeds';

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main(): Promise<void> {
  await prisma.baseUserModel.create({
    data: {
      baseUserId: e2eUser.id,
      createdAt: new Date().toISOString(),
      isEmailVerified: e2eUser.isEmailVerified,
      userEmail: e2eUser.email,
      username: e2eUser.username,
      userPassword: await hashPassword(e2eUser.password),
      memberModel: {
        create: {
          createdAt: new Date().toISOString(),
          memberId: e2eUser.memberId,
        },
      },
    },
  });

  await prisma.baseUserModel.create({
    data: {
      baseUserId: noMemberUser.id,
      createdAt: new Date().toISOString(),
      isEmailVerified: noMemberUser.isEmailVerified,
      userEmail: noMemberUser.email,
      username: noMemberUser.username,
      userPassword: await hashPassword(noMemberUser.password),
    },
  });
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
