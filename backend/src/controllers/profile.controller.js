const prisma = require("../config/db");

exports.createProfile = async (req, res) => {
  const { name, gender, age, occupation } = req.body;

  const profile = await prisma.profile.create({
    data: {
      userId: req.user.userId,
      name,
      gender,
      age,
      occupation,
    },
  });

  res.json(profile);
};

exports.getProfile = async (req, res) => {
  const userId = req.user.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  res.json({
    ...user.profile,
    diamonds: user.diamonds,
  });
};