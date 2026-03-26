const prisma = require("../config/db");

// GET all factions
exports.getFactions = async (req, res) => {
  const factions = await prisma.faction.findMany({
    include: {
      members: true,
      quests: {
        include: {
          participants: true
        }
      },
    },
  });

  const formatted = factions.map((f) => ({
    ...f,
    memberCount: f.members.length,
    questCount: f.quests.length,
    quests: f.quests.map(q => ({
      ...q,
      acceptedBy: q.participants.filter(p => p.status === 'accepted' || p.status === 'completed').map(p => p.userId),
      completedBy: q.participants.filter(p => p.status === 'completed').map(p => p.userId),
      failedBy: q.participants.filter(p => p.status === 'failed').map(p => p.userId)
    }))
  }));

  res.json(formatted);
};

// JOIN faction
exports.joinFaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { factionId } = req.body;

    const existing = await prisma.membership.findFirst({
      where: { userId, factionId }
    });
    if (existing) return res.status(400).json({ error: "already_joined" });

    // count current members
    const count = await prisma.membership.count({
      where: {
        factionId,
        status: "member",
      },
    });

    const faction = await prisma.faction.findUnique({
      where: { id: factionId },
    });

    const status = count < faction.maxMembers ? "member" : "queued";

    const membership = await prisma.membership.create({
      data: {
        userId,
        factionId,
        status,
      },
    });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyFactions = async (req, res) => {
  const userId = req.user.userId;

  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      faction: true,
    },
  });

  res.json(memberships);
};

exports.getFactionLeaderboard = async (req, res) => {
  const factions = await prisma.faction.findMany({
    include: {
      members: {
        include: {
          user: {
            include: {
              participations: {
                where: { status: "completed" },
                include: {
                  quest: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const leaderboard = factions.map((faction) => {
    let totalDiamonds = 0;
    let totalCompleted = 0;

    faction.members.forEach((member) => {
      member.user.participations.forEach((p) => {
        totalDiamonds += p.quest.reward;
        totalCompleted += 1;
      });
    });

    return {
      factionId: faction.id,
      name: faction.name,
      totalDiamonds,
      totalCompleted,
    };
  });

  // sort descending
  leaderboard.sort((a, b) => b.totalDiamonds - a.totalDiamonds);

  res.json(leaderboard);
};