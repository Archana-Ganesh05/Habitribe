const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'Admin';
  const plainPassword = 'Admin!1234';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log('Forcefully updated existing Admin password.');
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'admin',
        profile: {
          create: {
            name: 'Grand Moderator',
          }
        }
      }
    });
    console.log('Created new Admin account.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
