const prisma = require("../config/db");

// GET all factions
exports.getFactions = async (req, res) => {
  const factions = await prisma.faction.findMany({
    include: {
      members: true,
      quests: {
        where: { status: "active" },
      },
    },
  });

  const formatted = factions.map((f) => ({
    id: f.id,
    name: f.name,
    niche: f.niche,
    maxMembers: f.maxMembers,

    memberCount: f.members.length,
    questCount: f.quests.length,
  }));

  res.json(formatted);
};

// JOIN faction
exports.joinFaction = async (req, res) => {
  const userId = req.user.userId;
  const { factionId } = req.body;

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