import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Diamond, Trophy, Users, Swords, Clock, Check, Plus, Shield, ArrowLeft, AlertTriangle, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Faction, Quest } from '@/context/AppContext';

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald text-accent-foreground',
  intermediate: 'bg-diamond text-primary-foreground',
  advanced: 'bg-crimson text-foreground',
};

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { factions, joinedFactions, diamonds, profile, currentUser, acceptQuest, completeQuest, createQuest, approveQuest, logout } = useApp();
  const { toast } = useToast();
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [showCreateQuest, setShowCreateQuest] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', duration: '7', penaltyGraceDays: '3' });

  const myFactions = factions.filter(f => joinedFactions.includes(f.id));
  const activeFaction = selectedFaction ? factions.find(f => f.id === selectedFaction) : null;
  const activeQuest = selectedQuest && activeFaction ? activeFaction.quests.find(q => q.id === selectedQuest) : null;

  const isExpired = (deadline: string) => new Date(deadline) < new Date();

  const handleAccept = (factionId: string, questId: string) => {
    acceptQuest(factionId, questId);
    toast({ title: '⚔️ Quest Accepted!', description: 'You have joined this quest. Good luck, warrior!' });
  };

  const handleComplete = (factionId: string, questId: string) => {
    completeQuest(factionId, questId);
    toast({ title: '🏆 Quest Completed!', description: 'Diamonds have been added to your wallet!' });
  };

  const handleCreateQuest = () => {
    if (!activeFaction || !newQuest.title || !newQuest.description) return;
    createQuest(activeFaction.id, {
      title: newQuest.title,
      description: newQuest.description,
      difficulty: activeFaction.difficulty,
      reward: 0,
      duration: parseInt(newQuest.duration),
      acceptDeadline: new Date(Date.now() + 7200000).toISOString(),
      createdBy: currentUser?.id || '',
      isUserGenerated: true,
      penaltyGraceDays: parseInt(newQuest.penaltyGraceDays),
    });
    toast({ title: '📜 Quest Submitted', description: 'Your quest has been sent to the moderator for approval.' });
    setShowCreateQuest(false);
    setNewQuest({ title: '', description: '', duration: '7', penaltyGraceDays: '3' });
  };

  const handleApprove = (factionId: string, questId: string) => {
    const faction = factions.find(f => f.id === factionId);
    const rewardMap = { beginner: 75, intermediate: 175, advanced: 300 };
    const reward = rewardMap[faction?.difficulty || 'beginner'];
    approveQuest(factionId, questId, reward);
    toast({ title: '✅ Quest Approved', description: `Reward set to ${reward} diamonds.` });
  };

  // QUEST DETAIL VIEW
  if (activeQuest && activeFaction) {
    const accepted = activeQuest.acceptedBy.includes(currentUser?.id || '');
    const completed = activeQuest.completedBy.includes(currentUser?.id || '');
    const expired = isExpired(activeQuest.acceptDeadline);
    const totalAccepted = activeQuest.acceptedBy.length;
    const totalCompleted = activeQuest.completedBy.length;
    const failRate = totalAccepted > 0 ? (activeQuest.failedBy.length / totalAccepted) : 0;
    const penaltyMultiplier = Math.max(0.5, 1 - failRate * 0.15);
    const adjustedReward = Math.round(activeQuest.reward * penaltyMultiplier);

    return (
      <div className="min-h-screen gradient-hero p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedQuest(null)} className="flex items-center gap-2 text-muted-foreground hover:text-diamond mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to {activeFaction.name}
          </button>

          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={difficultyColors[activeQuest.difficulty]}>{activeQuest.difficulty}</Badge>
                {activeQuest.isUserGenerated && <Badge variant="outline">User Generated</Badge>}
              </div>
              <CardTitle className="font-display text-2xl mt-2">{activeQuest.title}</CardTitle>
              <p className="text-muted-foreground">{activeQuest.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Diamond className="w-6 h-6 mx-auto mb-2 text-diamond" />
                  <p className="text-2xl font-display font-bold text-diamond">{adjustedReward}</p>
                  <p className="text-xs text-muted-foreground">Reward (adjusted)</p>
                  {failRate > 0 && <p className="text-xs text-crimson mt-1">-{Math.round((1 - penaltyMultiplier) * 100)}% group penalty</p>}
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-display font-bold">{activeQuest.duration}</p>
                  <p className="text-xs text-muted-foreground">Days</p>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">Quest Rules</h3>
                <p className="text-xs text-muted-foreground">• Accept window: {expired ? 'Expired' : 'Open'} (2-hour limit)</p>
                <p className="text-xs text-muted-foreground">• Grace period: {activeQuest.penaltyGraceDays} days to fail and still earn partial reward</p>
                <p className="text-xs text-muted-foreground">• After {activeQuest.penaltyGraceDays} consecutive inactive days: moderator can initiate removal poll</p>
                <p className="text-xs text-muted-foreground">• Group penalty applies when members fail</p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">Penalty Breakdown</h3>
                <p className="text-xs text-muted-foreground">• Base reward per member: {activeQuest.reward} 💎</p>
                <p className="text-xs text-muted-foreground">• Each failure reduces group reward by ~15%</p>
                <p className="text-xs text-muted-foreground">• Minimum reward: 50% of base</p>
                <p className="text-xs text-muted-foreground">• Sabotage (3+ inactive days): Moderator removal poll + group potential decrease</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{totalAccepted} accepted • {totalCompleted} completed</span>
                <span className={`${activeQuest.status === 'open' ? 'text-emerald-accent' : 'text-muted-foreground'}`}>
                  Status: {activeQuest.status}
                </span>
              </div>

              {activeQuest.status === 'pending_approval' ? (
                <div className="bg-secondary/30 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-diamond" />
                  <p className="text-sm">Awaiting moderator approval</p>
                  <Button variant="emerald" className="mt-3" onClick={() => handleApprove(activeFaction.id, activeQuest.id)}>
                    Approve Quest (Moderator)
                  </Button>
                </div>
              ) : !accepted && !expired ? (
                <Button variant="gold" className="w-full" onClick={() => handleAccept(activeFaction.id, activeQuest.id)}>
                  ⚔️ Accept Quest
                </Button>
              ) : accepted && !completed ? (
                <Button variant="emerald" className="w-full" onClick={() => handleComplete(activeFaction.id, activeQuest.id)}>
                  ✅ Mark as Completed
                </Button>
              ) : completed ? (
                <Button variant="outline" className="w-full" disabled>
                  <Check className="w-4 h-4 mr-2" /> Completed — {adjustedReward} 💎 earned
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Accept window expired
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // FACTION DETAIL VIEW
  if (activeFaction) {
    return (
      <div className="min-h-screen gradient-hero p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedFaction(null)} className="flex items-center gap-2 text-muted-foreground hover:text-diamond mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">{activeFaction.name}</h1>
              <p className="text-muted-foreground text-sm">{activeFaction.description}</p>
            </div>
            <Badge className={difficultyColors[activeFaction.difficulty]}>{activeFaction.difficulty}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card rounded-lg p-3 text-center border border-border/50">
              <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="font-semibold">{activeFaction.members.length}/{activeFaction.maxMembers}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div className="bg-card rounded-lg p-3 text-center border border-border/50">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-diamond" />
              <p className="font-semibold">{activeFaction.questsSolved}</p>
              <p className="text-xs text-muted-foreground">Quests Solved</p>
            </div>
            <div className="bg-card rounded-lg p-3 text-center border border-border/50">
              <Diamond className="w-5 h-5 mx-auto mb-1 text-diamond" />
              <p className="font-semibold">{activeFaction.totalDiamonds.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total 💎</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Quests</h2>
            <Button variant="outline" size="sm" onClick={() => setShowCreateQuest(!showCreateQuest)}>
              <Plus className="w-4 h-4 mr-1" /> Create Quest
            </Button>
          </div>

          {showCreateQuest && (
            <Card className="border-diamond/30 bg-card/80 mb-4">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Quest Title</Label>
                  <Input value={newQuest.title} onChange={e => setNewQuest(p => ({ ...p, title: e.target.value }))} placeholder="e.g., 10 Pushups Daily" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={newQuest.description} onChange={e => setNewQuest(p => ({ ...p, description: e.target.value }))} placeholder="Describe the quest..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Duration (days)</Label>
                    <Input type="number" value={newQuest.duration} onChange={e => setNewQuest(p => ({ ...p, duration: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Grace Period (days)</Label>
                    <Input type="number" value={newQuest.penaltyGraceDays} onChange={e => setNewQuest(p => ({ ...p, penaltyGraceDays: e.target.value }))} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Reward will be assigned by the moderator upon approval.</p>
                <Button variant="gold" className="w-full" onClick={handleCreateQuest}>Submit for Approval</Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {activeFaction.quests.map(q => (
              <Card key={q.id} className="border-border/50 bg-card/80 cursor-pointer hover:border-diamond/30 transition-all" onClick={() => setSelectedQuest(q.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{q.title}</h3>
                    <div className="flex items-center gap-2">
                      {q.status === 'pending_approval' && <Badge variant="outline" className="text-diamond border-diamond/50">Pending</Badge>}
                      <span className="flex items-center gap-1 text-sm text-diamond">
                        <Diamond className="w-3 h-3" /> {q.reward}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{q.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{q.duration} days</span>
                    <span>{q.acceptedBy.length} accepted</span>
                    <span>{isExpired(q.acceptDeadline) ? '⏰ Expired' : '🟢 Open'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activeFaction.quests.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No quests yet. Create one!</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen gradient-hero p-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome, {profile?.name || 'Warrior'}</h1>
            <p className="text-muted-foreground text-sm">Your quest dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-diamond/30 rounded-full px-4 py-2 glow-diamond">
              <Diamond className="w-5 h-5 text-diamond" />
              <span className="font-display font-bold text-diamond">{diamonds.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Button variant="gold" onClick={() => onNavigate('rewards')} className="h-auto py-4">
            <div className="text-center">
              <Gem className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Redeem Rewards</span>
            </div>
          </Button>
          <Button variant="outline" onClick={logout} className="h-auto py-4">
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Logout</span>
            </div>
          </Button>
        </div>

        {/* My Factions */}
        <h2 className="font-display text-lg mb-4">My Factions</h2>
        {myFactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">You haven't joined any factions yet.</p>
        ) : (
          <div className="grid gap-4">
            {myFactions.map(f => {
              const openQuests = f.quests.filter(q => q.status === 'open' || q.status === 'pending_approval').length;
              return (
                <Card key={f.id} className="border-border/50 bg-card/80 cursor-pointer hover:border-diamond/30 transition-all" onClick={() => setSelectedFaction(f.id)}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Swords className="w-6 h-6 text-diamond" />
                        <div>
                          <h3 className="font-display font-semibold">{f.name}</h3>
                          <p className="text-xs text-muted-foreground">{f.members.length} members • {openQuests} active quests</p>
                        </div>
                      </div>
                      <Badge className={difficultyColors[f.difficulty]}>{f.difficulty}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-diamond"><Trophy className="w-4 h-4" /> {f.questsSolved}</span>
                      <span className="flex items-center gap-1 text-diamond"><Diamond className="w-4 h-4" /> {f.totalDiamonds.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
