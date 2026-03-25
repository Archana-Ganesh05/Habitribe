const prisma = require("../config/db");

// GET all rewards
exports.getRewards = async (req, res) => {
  const rewards = await prisma.reward.findMany();
  res.json(rewards);
};

// REDEEM reward
exports.redeemReward = async (req, res) => {
  const userId = req.user.userId;
  const { rewardId } = req.body;

  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user.diamonds < reward.cost) {
    return res.status(400).json({ error: "Not enough diamonds" });
  }

  // deduct diamonds
  await prisma.user.update({
    where: { id: userId },
    data: {
      diamonds: {
        decrement: reward.cost,
      },
    },
  });

  // save redemption
  await prisma.userReward.create({
    data: {
      userId,
      rewardId,
    },
  });

  res.json({ message: "Reward redeemed 🎉" });
};