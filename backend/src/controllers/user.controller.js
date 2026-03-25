const prisma = require("../config/db");

exports.getMe = async (req, res) => {
  const userId = req.user.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      memberships: {
        include: {
          faction: true,
        },
      },
      participations: {
        include: {
          quest: true,
        },
      },
    },
  });

  res.json(user);
};