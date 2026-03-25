import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  gender: string;
  age: number;
  occupation: string;
}

export interface QuestAcceptance {
  odoneBy: string; 
  completed: boolean;
  completedAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  factionId: string;
  reward: number;
  duration: number; // days
  acceptDeadline: string; // ISO date
  acceptedBy: string[]; // user ids
  completedBy: string[];
  failedBy: string[];
  status: 'pending_approval' | 'open' | 'active' | 'completed' | 'expired';
  createdBy: string;
  isUserGenerated: boolean;
  penaltyGraceDays: number;
}

export interface Faction {
  id: string;
  name: string;
  niche: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  members: string[];
  maxMembers: number;
  queue: string[];
  questsSolved: number;
  totalDiamonds: number;
  description: string;
  moderator: string;
  quests: Quest[];
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
}

interface AppState {
  isAuthenticated: boolean;
  currentUser: { email: string; id: string } | null;
  profile: UserProfile | null;
  niche: string | null;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  diamonds: number;
  joinedFactions: string[];
  factions: Faction[];
  rewards: RewardItem[];
  onboardingStep: 'profile' | 'questionnaire' | 'factions' | 'done';
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string) => boolean;
  logout: () => void;
  setProfile: (p: UserProfile) => void;
  setNicheAndLevel: (niche: string, level: 'beginner' | 'intermediate' | 'advanced') => void;
  joinFaction: (factionId: string) => string;
  acceptQuest: (factionId: string, questId: string) => void;
  completeQuest: (factionId: string, questId: string) => void;
  createQuest: (factionId: string, quest: Omit<Quest, 'id' | 'status' | 'acceptedBy' | 'completedBy' | 'failedBy' | 'factionId'>) => void;
  approveQuest: (factionId: string, questId: string, reward: number) => void;
  redeemReward: (rewardId: string) => boolean;
  setOnboardingStep: (s: 'profile' | 'questionnaire' | 'factions' | 'done') => void;
}

const defaultFactions: Faction[] = [
  // FITNESS
  { id: 'f1', name: 'Iron Rookies', niche: 'fitness', difficulty: 'beginner', members: ['mod1'], maxMembers: 50, queue: [], questsSolved: 12, totalDiamonds: 3600, description: 'Start your fitness journey with supportive beginners.', moderator: 'mod1', quests: [
    { id: 'q1', title: 'Morning Stretch Routine', description: 'Complete a 10-minute morning stretch for 3 consecutive days.', difficulty: 'beginner', factionId: 'f1', reward: 50, duration: 3, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod1', isUserGenerated: false, penaltyGraceDays: 1 },
    { id: 'q2', title: 'Do 10 Pushups Daily', description: 'Complete 10 pushups every day for a week.', difficulty: 'beginner', factionId: 'f1', reward: 100, duration: 7, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod1', isUserGenerated: false, penaltyGraceDays: 3 },
  ]},
  { id: 'f2', name: 'Steel Warriors', niche: 'fitness', difficulty: 'intermediate', members: ['mod2', 'u1', 'u2', 'u3'], maxMembers: 50, queue: [], questsSolved: 45, totalDiamonds: 18000, description: 'Push your limits with structured workout challenges.', moderator: 'mod2', quests: [
    { id: 'q3', title: '5K Run Challenge', description: 'Run 5K three times this week.', difficulty: 'intermediate', factionId: 'f2', reward: 200, duration: 7, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod2', isUserGenerated: false, penaltyGraceDays: 2 },
  ]},
  { id: 'f3', name: 'Titan Legion', niche: 'fitness', difficulty: 'advanced', members: ['mod3', 'u4', 'u5', 'u6', 'u7', 'u8'], maxMembers: 50, queue: [], questsSolved: 120, totalDiamonds: 72000, description: 'Elite athletes pushing boundaries every day.', moderator: 'mod3', quests: [
    { id: 'q4', title: 'Do 50 Pushups Daily', description: 'Complete 50 pushups every day for 7 days straight.', difficulty: 'advanced', factionId: 'f3', reward: 300, duration: 7, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod3', isUserGenerated: false, penaltyGraceDays: 3 },
  ]},
  // CS
  { id: 'f4', name: 'Code Cadets', niche: 'cs', difficulty: 'beginner', members: ['mod4', 'u9'], maxMembers: 50, queue: [], questsSolved: 8, totalDiamonds: 2400, description: 'Learn to code together from scratch.', moderator: 'mod4', quests: [
    { id: 'q5', title: 'Hello World in 3 Languages', description: 'Write Hello World in Python, JavaScript, and Java.', difficulty: 'beginner', factionId: 'f4', reward: 50, duration: 3, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod4', isUserGenerated: false, penaltyGraceDays: 1 },
  ]},
  { id: 'f5', name: 'Algorithm Architects', niche: 'cs', difficulty: 'intermediate', members: ['mod5', 'u10', 'u11', 'u12'], maxMembers: 50, queue: [], questsSolved: 67, totalDiamonds: 26800, description: 'Master data structures and algorithms together.', moderator: 'mod5', quests: [
    { id: 'q6', title: '1 LeetCode Per Day', description: 'Solve one LeetCode problem every day for a week.', difficulty: 'intermediate', factionId: 'f5', reward: 200, duration: 7, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod5', isUserGenerated: false, penaltyGraceDays: 3 },
  ]},
  { id: 'f6', name: 'System Overlords', niche: 'cs', difficulty: 'advanced', members: ['mod6', 'u13', 'u14'], maxMembers: 50, queue: [], questsSolved: 89, totalDiamonds: 53400, description: 'System design, competitive programming, open source.', moderator: 'mod6', quests: [
    { id: 'q7', title: 'Build a REST API', description: 'Design and deploy a RESTful API with auth in 5 days.', difficulty: 'advanced', factionId: 'f6', reward: 350, duration: 5, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod6', isUserGenerated: false, penaltyGraceDays: 2 },
  ]},
  // MENTAL WELLBEING
  { id: 'f7', name: 'Calm Beginnings', niche: 'mental', difficulty: 'beginner', members: ['mod7'], maxMembers: 50, queue: [], questsSolved: 15, totalDiamonds: 4500, description: 'Start your mindfulness journey in a supportive space.', moderator: 'mod7', quests: [
    { id: 'q8', title: '5-Min Daily Meditation', description: 'Meditate for 5 minutes every day for 5 days.', difficulty: 'beginner', factionId: 'f7', reward: 75, duration: 5, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod7', isUserGenerated: false, penaltyGraceDays: 2 },
  ]},
  { id: 'f8', name: 'Mindful Warriors', niche: 'mental', difficulty: 'intermediate', members: ['mod8', 'u15', 'u16'], maxMembers: 50, queue: [], questsSolved: 34, totalDiamonds: 13600, description: 'Deepen your practice with journaling and breathwork.', moderator: 'mod8', quests: [
    { id: 'q9', title: 'Gratitude Journal Week', description: 'Write 3 things you are grateful for every night for 7 days.', difficulty: 'intermediate', factionId: 'f8', reward: 150, duration: 7, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod8', isUserGenerated: false, penaltyGraceDays: 3 },
  ]},
  { id: 'f9', name: 'Zen Masters', niche: 'mental', difficulty: 'advanced', members: ['mod9', 'u17'], maxMembers: 50, queue: [], questsSolved: 56, totalDiamonds: 33600, description: 'Advanced meditation, therapy techniques, deep reflection.', moderator: 'mod9', quests: [
    { id: 'q10', title: '30-Min Meditation Streak', description: 'Meditate for 30 minutes daily for 7 days straight.', difficulty: 'advanced', factionId: 'f9', reward: 300, duration: 7, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod9', isUserGenerated: false, penaltyGraceDays: 3 },
  ]},
  // PRODUCTIVITY
  { id: 'f10', name: 'Task Novices', niche: 'productivity', difficulty: 'beginner', members: ['mod10', 'u18'], maxMembers: 50, queue: [], questsSolved: 10, totalDiamonds: 3000, description: 'Learn basic time management and productivity habits.', moderator: 'mod10', quests: [
    { id: 'q11', title: 'Plan Your Tomorrow', description: 'Write a to-do list every evening for 5 days.', difficulty: 'beginner', factionId: 'f10', reward: 60, duration: 5, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod10', isUserGenerated: false, penaltyGraceDays: 2 },
  ]},
  { id: 'f11', name: 'Flow State Guild', niche: 'productivity', difficulty: 'intermediate', members: ['mod11', 'u19', 'u20', 'u21'], maxMembers: 50, queue: [], questsSolved: 52, totalDiamonds: 20800, description: 'Master deep work, Pomodoro, and time-blocking.', moderator: 'mod11', quests: [
    { id: 'q12', title: 'Pomodoro Power Week', description: 'Complete 4 Pomodoro sessions daily for 5 days.', difficulty: 'intermediate', factionId: 'f11', reward: 180, duration: 5, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod11', isUserGenerated: false, penaltyGraceDays: 2 },
  ]},
  { id: 'f12', name: 'Efficiency Apex', niche: 'productivity', difficulty: 'advanced', members: ['mod12', 'u22', 'u23'], maxMembers: 50, queue: [], questsSolved: 78, totalDiamonds: 46800, description: 'Extreme productivity: systems, automation, accountability.', moderator: 'mod12', quests: [
    { id: 'q13', title: 'Zero Inbox Challenge', description: 'Achieve and maintain inbox zero for 7 consecutive days.', difficulty: 'advanced', factionId: 'f12', reward: 280, duration: 7, acceptDeadline: new Date(Date.now() + 7200000).toISOString(), acceptedBy: [], completedBy: [], failedBy: [], status: 'open', createdBy: 'mod12', isUserGenerated: false, penaltyGraceDays: 3 },
  ]},
];

const defaultRewards: RewardItem[] = [
  { id: 'r1', name: 'Amazon Pay Gift Card ₹500', description: 'Redeem for a ₹500 Amazon Pay gift card.', cost: 5000, image: '🛒' },
  { id: 'r2', name: '10% Off Spotify Premium', description: 'Get 10% off on Spotify Premium subscription.', cost: 1000, image: '🎵' },
  { id: 'r3', name: 'Dominos ₹200 Voucher', description: 'Get a ₹200 Dominos pizza voucher.', cost: 2000, image: '🍕' },
  { id: 'r4', name: 'Netflix 1 Month Free', description: 'One month free Netflix subscription.', cost: 8000, image: '🎬' },
  { id: 'r5', name: 'Custom Avatar Frame', description: 'Unlock a premium avatar frame for your profile.', cost: 500, image: '🖼️' },
  { id: 'r6', name: 'Double XP Boost (7 days)', description: 'Earn double diamonds for 7 days.', cost: 1500, image: '⚡' },
];

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const loadState = (key: string, fallback: any) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(loadState('ht_auth', false));
  const [currentUser, setCurrentUser] = useState<{ email: string; id: string } | null>(loadState('ht_user', null));
  const [profile, setProfileState] = useState<UserProfile | null>(loadState('ht_profile', null));
  const [niche, setNiche] = useState<string | null>(loadState('ht_niche', null));
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(loadState('ht_skill', null));
  const [diamonds, setDiamonds] = useState<number>(loadState('ht_diamonds', 500));
  const [joinedFactions, setJoinedFactions] = useState<string[]>(loadState('ht_joined', []));
  const [factions, setFactions] = useState<Faction[]>(loadState('ht_factions', defaultFactions));
  const [onboardingStep, setOnboardingStep] = useState<'profile' | 'questionnaire' | 'factions' | 'done'>(loadState('ht_step', 'profile'));

  const save = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

  useEffect(() => { save('ht_auth', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { save('ht_user', currentUser); }, [currentUser]);
  useEffect(() => { save('ht_profile', profile); }, [profile]);
  useEffect(() => { save('ht_niche', niche); }, [niche]);
  useEffect(() => { save('ht_skill', skillLevel); }, [skillLevel]);
  useEffect(() => { save('ht_diamonds', diamonds); }, [diamonds]);
  useEffect(() => { save('ht_joined', joinedFactions); }, [joinedFactions]);
  useEffect(() => { save('ht_factions', factions); }, [factions]);
  useEffect(() => { save('ht_step', onboardingStep); }, [onboardingStep]);

  const login = (email: string, _password: string) => {
    const users = loadState('ht_users', []);
    const user = users.find((u: any) => u.email === email && u.password === _password);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser({ email: user.email, id: user.id });
      return true;
    }
    return false;
  };

  const signup = (email: string, password: string) => {
    const users = loadState('ht_users', []);
    if (users.find((u: any) => u.email === email)) return false;
    const newUser = { email, password, id: crypto.randomUUID() };
    users.push(newUser);
    save('ht_users', users);
    setIsAuthenticated(true);
    setCurrentUser({ email, id: newUser.id });
    setOnboardingStep('profile');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setProfile(null);
    setNiche(null);
    setSkillLevel(null);
    setDiamonds(500);
    setJoinedFactions([]);
    setFactions(defaultFactions);
    setOnboardingStep('profile');
  };

  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    setOnboardingStep('questionnaire');
  };

  const setNicheAndLevel = (n: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setNiche(n);
    setSkillLevel(level);
    setOnboardingStep('factions');
  };

  const joinFaction = (factionId: string): string => {
    const f = factions.find(f => f.id === factionId);
    if (!f || !currentUser) return 'error';
    if (f.difficulty !== skillLevel) return 'wrong_level';
    if (joinedFactions.includes(factionId)) return 'already_joined';
    if (f.members.length >= f.maxMembers) {
      setFactions(prev => prev.map(fa => fa.id === factionId ? { ...fa, queue: [...fa.queue, currentUser.id] } : fa));
      return 'queued';
    }
    setFactions(prev => prev.map(fa => fa.id === factionId ? { ...fa, members: [...fa.members, currentUser.id] } : fa));
    setJoinedFactions(prev => [...prev, factionId]);
    return 'joined';
  };

  const acceptQuest = (factionId: string, questId: string) => {
    if (!currentUser) return;
    setFactions(prev => prev.map(f => f.id === factionId ? {
      ...f, quests: f.quests.map(q => q.id === questId && !q.acceptedBy.includes(currentUser.id)
        ? { ...q, acceptedBy: [...q.acceptedBy, currentUser.id] } : q)
    } : f));
  };

  const completeQuest = (factionId: string, questId: string) => {
    if (!currentUser) return;
    const faction = factions.find(f => f.id === factionId);
    const quest = faction?.quests.find(q => q.id === questId);
    if (!quest) return;
    
    // Calculate reward with group penalty
    const totalAccepted = quest.acceptedBy.length;
    const totalCompleted = quest.completedBy.length;
    const failRate = totalAccepted > 0 ? (quest.failedBy.length / totalAccepted) : 0;
    const penaltyMultiplier = Math.max(0.5, 1 - failRate * 0.15);
    const finalReward = Math.round(quest.reward * penaltyMultiplier);

    setDiamonds(prev => prev + finalReward);
    setFactions(prev => prev.map(f => f.id === factionId ? {
      ...f, 
      totalDiamonds: f.totalDiamonds + finalReward,
      questsSolved: f.questsSolved + (quest.completedBy.length === 0 ? 1 : 0),
      quests: f.quests.map(q => q.id === questId
        ? { ...q, completedBy: [...q.completedBy, currentUser.id] } : q)
    } : f));
  };

  const createQuest = (factionId: string, quest: Omit<Quest, 'id' | 'status' | 'acceptedBy' | 'completedBy' | 'failedBy' | 'factionId'>) => {
    const newQuest: Quest = {
      ...quest,
      id: crypto.randomUUID(),
      factionId,
      status: 'pending_approval',
      acceptedBy: [],
      completedBy: [],
      failedBy: [],
    };
    setFactions(prev => prev.map(f => f.id === factionId ? { ...f, quests: [...f.quests, newQuest] } : f));
  };

  const approveQuest = (factionId: string, questId: string, reward: number) => {
    setFactions(prev => prev.map(f => f.id === factionId ? {
      ...f, quests: f.quests.map(q => q.id === questId ? { ...q, status: 'open', reward } : q)
    } : f));
  };

  const redeemReward = (rewardId: string): boolean => {
    const reward = defaultRewards.find(r => r.id === rewardId);
    if (!reward || diamonds < reward.cost) return false;
    setDiamonds(prev => prev - reward.cost);
    return true;
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated, currentUser, profile, niche, skillLevel, diamonds, joinedFactions,
      factions, rewards: defaultRewards, onboardingStep,
      login, signup, logout, setProfile, setNicheAndLevel, joinFaction,
      acceptQuest, completeQuest, createQuest, approveQuest, redeemReward, setOnboardingStep,
    }}>
      {children}
    </AppContext.Provider>
  );
};
