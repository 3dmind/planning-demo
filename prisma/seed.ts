import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { e2eUser, noMemberUser } from './seeds';

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main(): Promise<void> {
  const result = await prisma.baseUserModel.createMany({
    data: [
      {
        baseUserId: e2eUser.id,
        createdAt: new Date().toISOString(),
        isEmailVerified: e2eUser.isEmailVerified,
        userEmail: e2eUser.email,
        username: e2eUser.username,
        userPassword: await hashPassword(e2eUser.password),
      },
      {
        baseUserId: noMemberUser.id,
        createdAt: new Date().toISOString(),
        isEmailVerified: noMemberUser.isEmailVerified,
        userEmail: noMemberUser.email,
        username: noMemberUser.username,
        userPassword: await hashPassword(noMemberUser.password),
      },
    ],
  });
  console.log(`Created ${result.count} users.`);

  await prisma.memberModel.create({
    data: {
      createdAt: new Date().toISOString(),
      memberBaseId: e2eUser.id,
      memberId: e2eUser.memberId,
    },
  });
  console.log(`Created associated member for user ${e2eUser.username}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database.');
  });
