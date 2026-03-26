import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { login as apiLogin, signup as apiSignup } from "../api/auth";
import { getMe, createProfile as apiCreateProfile } from "../api/user";
import { getFactions, joinFaction as apiJoinFaction } from "../api/factions";
import { acceptQuest as apiAcceptQuest, completeQuest as apiCompleteQuest, createQuest as apiCreateQuest, approveQuest as apiApproveQuest } from "../api/quests";
import { getRewards, redeemReward as apiRedeemReward } from "../api/rewards";

export interface UserProfile {
  name: string;
  gender: string;
  age: number;
  occupation: string;
}

export interface Faction {
  id: string;
  name: string;
  niche: string;
  maxMembers: number;
  memberCount?: number;
  questCount?: number;
  quests: any[];
  questsSolved: number;
  totalDiamonds: number;
  difficulty: string;
  members: any[];
  description: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
}

interface AppState {
  isAuthenticated: boolean;
  currentUser: { email: string; id: string } | null;
  profile: UserProfile | null;
  diamonds: number;
  factions: Faction[];
  rewards: RewardItem[];
  joinedFactions: string[];
  onboardingStep: string | null;
  niche: string;
  skillLevel: string;

  setProfile: (profile: any) => void;
  setNicheAndLevel: (niche: string, skillLevel: string) => void;
  setOnboardingStep: (step: string | null) => void;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  joinFaction: (factionId: string) => Promise<any>;
  acceptQuest: (_factionId: string, questId: string) => Promise<void>;
  completeQuest: (_factionId: string, questId: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<boolean>;
  
  createQuest: (factionId: string, questData: any) => Promise<void>;
  approveQuest: (factionId: string, questId: string, reward: number) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; id: string } | null>(null);
  const [profile, setProfileHook] = useState<UserProfile | null>(null);
  const [diamonds, setDiamonds] = useState(0);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [joinedFactions, setJoinedFactions] = useState<string[]>([]);
  const [niche, setNiche] = useState<string>(sessionStorage.getItem('niche') || '');
  const [skillLevel, setSkillLevel] = useState<string>(sessionStorage.getItem('skillLevel') || '');
  const [isNewUser, setIsNewUser] = useState<boolean>(sessionStorage.getItem('isNewUser') === 'true');

  const [manualOnboardingStep, setManualOnboardingStep] = useState<string | null>(null);

  let computedStep: string | null = null;
  if (currentUser?.email === 'Admin') computedStep = null;
  else if (!isNewUser) computedStep = null;
  else if (!profile) computedStep = 'profile';
  else if (joinedFactions.length > 0) computedStep = null;
  else if (!niche || !skillLevel) computedStep = 'questionnaire';
  else computedStep = 'factions';

  const onboardingStep = manualOnboardingStep || computedStep;

  const setOnboardingStep = (step: string | null) => {
    setManualOnboardingStep(step);
  };

  const setNicheAndLevel = (newNiche: string, newSkillLevel: string) => {
    setNiche(newNiche);
    setSkillLevel(newSkillLevel);
    sessionStorage.setItem('niche', newNiche);
    sessionStorage.setItem('skillLevel', newSkillLevel);
  };

  const setProfile = async (newProfile: any) => {
    setProfileHook(newProfile);
    try {
      await apiCreateProfile(newProfile);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  // 🔥 Load user on app start
  useEffect(() => {
    const load = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const data = await getMe();

        setIsAuthenticated(true);
        setCurrentUser({ email: data.email, id: data.id });
        setProfileHook(data.profile);
        setDiamonds(data.diamonds);
        setJoinedFactions(data.memberships?.map((m: any) => m.factionId) || []);
      } catch (err) {
        console.log("Auth load failed");
      }
    };

    load();
  }, []);

  // 🔥 Load factions + rewards
  useEffect(() => {
    getFactions().then(setFactions);
    getRewards().then(setRewards);
  }, []);

  // 🔐 LOGIN
  const login = async (email: string, password: string, isSignupTask = false) => {
    try {
      const res = await apiLogin(email, password);

      if (res && res.token) {
        sessionStorage.setItem("token", res.token);
        sessionStorage.setItem("isNewUser", isSignupTask ? "true" : "false");
        setIsNewUser(isSignupTask);

        const data = await getMe();

        setIsAuthenticated(true);
        setCurrentUser({ email: data.email, id: data.id });
        setProfileHook(data.profile);
        setDiamonds(data.diamonds);
        setJoinedFactions(data.memberships?.map((m: any) => m.factionId) || []);
        
        setNiche('');
        setSkillLevel('');
        sessionStorage.removeItem('niche');
        sessionStorage.removeItem('skillLevel');

        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // 🆕 SIGNUP
  const signup = async (email: string, password: string) => {
    try {
      await apiSignup(email, password);
      return await login(email, password, true);
    } catch {
      return false;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setProfileHook(null);
    setDiamonds(0);
    setJoinedFactions([]);
    setNiche('');
    setSkillLevel('');
    setIsNewUser(false);
    sessionStorage.removeItem('isNewUser');
    setManualOnboardingStep(null);
  };

  // 👥 JOIN FACTION
  const joinFaction = async (factionId: string) => {
    try {
      const result = await apiJoinFaction(factionId);
      if (result && (result.status === 'member' || result.status === 'queued')) {
        setJoinedFactions(prev => {
          if (!prev.includes(factionId)) return [...prev, factionId];
          return prev;
        });
        getFactions().then(setFactions); // Refresh faction stats
      }
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // 🎯 ACCEPT QUEST
  const acceptQuest = async (_factionId: string, questId: string) => {
    await apiAcceptQuest(questId);
    getFactions().then(setFactions);
  };

  // ✅ COMPLETE QUEST
  const completeQuest = async (_factionId: string, questId: string) => {
    await apiCompleteQuest(questId);
    getFactions().then(setFactions);

    const data = await getMe();
    setDiamonds(data.diamonds);
  };

  // 💎 REDEEM
  const redeemReward = async (rewardId: string) => {
    const res = await apiRedeemReward(rewardId);
    if (!res.error) {
      const data = await getMe();
      setDiamonds(data.diamonds);
      return true;
    }
    return false;
  };
  
  const createQuest = async (factionId: string, questData: any) => {
    await apiCreateQuest(factionId, questData);
    getFactions().then(setFactions);
  };
  
  const approveQuest = async (factionId: string, questId: string, reward: number) => {
    await apiApproveQuest(questId, reward);
    getFactions().then(setFactions);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        profile,
        diamonds,
        factions,
        rewards,
        joinedFactions,
        onboardingStep,
        niche,
        skillLevel,
        setProfile,
        setNicheAndLevel,
        setOnboardingStep,
        login,
        signup,
        logout,
        joinFaction,
        acceptQuest,
        completeQuest,
        redeemReward,
        createQuest,
        approveQuest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
