const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findUnique({where:{email:'anirudh123@gmail.com'}});
  const match = await bcrypt.compare('Anirudh!69', u.password);
  console.log('Match?', match);
}
main();
