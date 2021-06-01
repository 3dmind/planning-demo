import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { alice, bob, e2eUser, noMemberUser } from './seeds';
import { memberForAlice, memberForBob, memberForE2eUser } from './seeds/members';

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main(): Promise<void> {
  const users = await prisma.baseUserModel.createMany({
    data: [
      {
        ...e2eUser,
        userPassword: await hashPassword(e2eUser.userPassword),
      },
      {
        ...alice,
        userPassword: await hashPassword(alice.userPassword),
      },
      {
        ...bob,
        userPassword: await hashPassword(bob.userPassword),
      },
      {
        ...noMemberUser,
        userPassword: await hashPassword(noMemberUser.userPassword),
      },
    ],
  });
  console.log(`Created ${users.count} users.`);

  const members = await prisma.memberModel.createMany({
    data: [memberForAlice, memberForBob, memberForE2eUser],
  });
  console.log(`Created ${members.count} members.`);
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
