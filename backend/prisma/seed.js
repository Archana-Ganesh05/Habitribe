const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const factions = [
  { name: 'Couch to 5K Runners', niche: 'fitness', difficulty: 'beginner', maxMembers: 50, description: 'Start your fitness journey with other beginners.' },
  { name: 'Iron Lifters Club', niche: 'fitness', difficulty: 'intermediate', maxMembers: 30, description: 'For those who have a solid foundation in lifting.' },
  { name: 'Elite Marathoners', niche: 'fitness', difficulty: 'advanced', maxMembers: 20, description: 'Train for your next ultra or marathon with pros.' },

  { name: 'HTML & CSS Basics', niche: 'cs', difficulty: 'beginner', maxMembers: 100, description: 'Learn the foundational building blocks of the web.' },
  { name: 'React Developers', niche: 'cs', difficulty: 'intermediate', maxMembers: 50, description: 'Build full-stack applications and component libraries.' },
  { name: 'Low-Level Systems', niche: 'cs', difficulty: 'advanced', maxMembers: 15, description: 'C, Rust, and OS level development for hardcore devs.' },

  { name: 'Mindful Starters', niche: 'mental', difficulty: 'beginner', maxMembers: 80, description: 'Begin your journey into mindfulness and meditation.' },
  { name: 'Daily Zen Practitioners', niche: 'mental', difficulty: 'intermediate', maxMembers: 40, description: 'Consistent practitioners aiming for deeper focus.' },
  { name: 'Enlightened Monks', niche: 'mental', difficulty: 'advanced', maxMembers: 10, description: 'Deep, long-term meditation and self-discovery.' },

  { name: 'To-Do List Masters', niche: 'productivity', difficulty: 'beginner', maxMembers: 100, description: 'Get organized and start checking things off.' },
  { name: 'Pomodoro Warriors', niche: 'productivity', difficulty: 'intermediate', maxMembers: 50, description: 'Optimize your work blocks and manage your energy.' },
  { name: 'Automation Architects', niche: 'productivity', difficulty: 'advanced', maxMembers: 25, description: 'Build systems and automation to do the work for you.' },
];

const nicheQuests = {
  fitness: [
    { title: 'The Starting Line', description: 'Complete a 1km continuous movement (run, walk, or jog) to set your baseline.', duration: 2 },
    { title: 'Strength Foundation', description: 'Perform 3 sets of 10 pushups or bodyweight squats.', duration: 3 }
  ],
  cs: [
    { title: 'Hello World+', description: 'Write a simple program in any language that takes user input and prints it back.', duration: 1 },
    { title: 'Bug Hunt', description: 'Find an open source repository, clone it, and run their test suite locally.', duration: 5 }
  ],
  mental: [
    { title: 'Digital Detox', description: 'Spend 2 continuous hours entirely away from all screens and devices.', duration: 1 },
    { title: 'Morning Journal', description: 'Write down 3 things you are explicitly grateful for today.', duration: 2 }
  ],
  productivity: [
    { title: 'The 2-Minute Rule', description: 'Find 5 separate tasks that take less than 2 minutes each and do them immediately.', duration: 1 },
    { title: 'Time Block', description: 'Schedule your entire day tomorrow into dedicated 30-minute functional blocks.', duration: 2 }
  ]
};

const rewardsStore = [
  { name: 'Amazon Pay Gift Card ($10)', description: 'Digital gift card sent via email.', cost: 2000 },
  { name: 'Spotify Premium (20% Off)', description: 'Discount code for a 1-year subscription.', cost: 1500 },
  { name: 'Exclusive Discord Role', description: 'Stand out with a glowing username in the HabiTribe community.', cost: 500 },
  { name: '1-on-1 Coaching Session', description: '30-minute accountability call with a verified mentor.', cost: 5000 },
  { name: 'HabiTribe T-Shirt', description: 'Limited edition merch shipped to your door.', cost: 8000 }
];

async function main() {
  console.log('Clearing old factions and related records...');
  await prisma.userReward.deleteMany({});
  await prisma.reward.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.questParticipation.deleteMany({});
  await prisma.quest.deleteMany({});
  await prisma.faction.deleteMany({});
  
  console.log('Creating 15 dummy users for membership seeding...');
  const dummyUsers = [];
  const hashedPassword = await bcrypt.hash('Password!123', 10);
  for(let i=1; i<=15; i++) {
    const u = await prisma.user.upsert({
      where: { email: `dummy${i}@habitribe.com` },
      update: {},
      create: {
        email: `dummy${i}@habitribe.com`,
        password: hashedPassword,
        profile: {
          create: { name: `Warrior ${i}` }
        }
      }
    });
    dummyUsers.push(u);
  }

  console.log('Seeding factions and assigning minimum 3 members each...');
  for (let i = 0; i < factions.length; i++) {
    const f = factions[i];
    const created = await prisma.faction.create({ data: f });
    
    for (let j = 0; j < 3; j++) {
      const userIndex = (i * 3 + j) % dummyUsers.length;
      await prisma.membership.create({
        data: {
          userId: dummyUsers[userIndex].id,
          factionId: created.id,
          status: 'member'
        }
      });
    }

    const baseReward = f.difficulty === 'beginner' ? 50 : f.difficulty === 'intermediate' ? 100 : 200;
    const starters = nicheQuests[f.niche] || [];
    for (const sq of starters) {
      await prisma.quest.create({
        data: {
          title: sq.title,
          description: sq.description,
          factionId: created.id,
          reward: Math.round(baseReward * (1 + sq.duration * 0.1)),
          status: 'open',
          difficulty: f.difficulty,
          duration: sq.duration,
          penaltyGraceDays: 2
        }
      });
    }

    console.log(`Created faction: ${f.name} with 3 members and 2 quests.`);
  }

  console.log('Seeding Global Rewards Shop...');
  for (const rw of rewardsStore) {
    await prisma.reward.create({ data: rw });
  }
  console.log(`Created ${rewardsStore.length} physical and digital incentives.`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
