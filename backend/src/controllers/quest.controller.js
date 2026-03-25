const prisma = require("../config/db");

// GET quests for a faction
exports.getFactionQuests = async (req, res) => {
  const { factionId } = req.params;

  const quests = await prisma.quest.findMany({
    where: {
      factionId,
      status: "active", // ✅ ONLY ACTIVE
    },
  });

  res.json(quests);
};

// ACCEPT QUEST (prevent duplicates)
exports.acceptQuest = async (req, res) => {
  const userId = req.user.userId;
  const { questId } = req.body;

  // check if already accepted
  const existing = await prisma.questParticipation.findFirst({
    where: { userId, questId },
  });

  if (existing) {
    return res.status(400).json({ error: "Already accepted this quest" });
  }

  const participation = await prisma.questParticipation.create({
    data: {
      userId,
      questId,
      status: "accepted",
    },
  });

  res.json(participation);
};

// COMPLETE QUEST (reward user)
exports.completeQuest = async (req, res) => {
  const userId = req.user.userId;
  const { questId } = req.body;

  const participation = await prisma.questParticipation.findFirst({
    where: { userId, questId },
  });

  if (!participation) {
    return res.status(404).json({ error: "Quest not accepted" });
  }

  if (participation.status === "completed") {
    return res.status(400).json({ error: "Already completed" });
  }

  // get quest reward
  const quest = await prisma.quest.findUnique({
    where: { id: questId },
  });

  // update participation
  await prisma.questParticipation.update({
    where: { id: participation.id },
    data: { status: "completed" },
  });

  // add diamonds to user
  await prisma.user.update({
    where: { id: userId },
    data: {
      diamonds: {
        increment: quest.reward,
      },
    },
  });

  res.json({ message: `Quest completed! +${quest.reward} diamonds 💎` });
};

// CREATE QUEST (user-generated)
exports.createQuest = async (req, res) => {
  const userId = req.user.userId;
  const { title, description, reward, factionId } = req.body;

  const quest = await prisma.quest.create({
    data: {
      title,
      description,
      reward,
      factionId,
      createdBy: userId,
      status: "pending",
    },
  });

  res.json(quest);
};

// APPROVE QUEST (moderator)
exports.approveQuest = async (req, res) => {
  const { questId } = req.body;

  const quest = await prisma.quest.update({
    where: { id: questId },
    data: { status: "active" },
  });

  res.json({ message: "Quest approved ✅", quest });
};