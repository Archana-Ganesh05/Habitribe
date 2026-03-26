import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Diamond, Trophy, Clock, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald text-accent-foreground',
  intermediate: 'bg-diamond text-primary-foreground',
  advanced: 'bg-crimson text-foreground',
};

const nicheLabels: Record<string, string> = {
  fitness: '💪 Fitness',
  cs: '💻 Computer Science',
  mental: '🧠 Mental Wellbeing',
  productivity: '⚡ Productivity',
};

const FactionsPage = () => {
  const { factions, niche, skillLevel, joinFaction, joinedFactions, setOnboardingStep } = useApp();
  const { toast } = useToast();

  const relevantFactions = factions
    .filter(f => f.niche === niche && f.difficulty === skillLevel)
    .sort((a, b) => {
      const scoreA = (a.members?.length || 0) * 2 + (a.questsSolved || 0) * 3 + (a.totalDiamonds || 0) * 0.01;
      const scoreB = (b.members?.length || 0) * 2 + (b.questsSolved || 0) * 3 + (b.totalDiamonds || 0) * 0.01;
      return scoreB - scoreA;
    });

  const otherFactions = factions
    .filter(f => f.niche === niche && f.difficulty !== skillLevel)
    .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));

  const handleJoin = async (factionId: string) => {
    const result = await joinFaction(factionId);
    const faction = factions.find(f => f.id === factionId);
    if (!result) return;
    if (result.status === 'member') {
      toast({ title: `⚔️ Joined ${faction?.name}!`, description: 'You are now a member of this faction.' });
    } else if (result.status === 'queued') {
      toast({ title: `⏳ Added to Queue`, description: `${faction?.name} is full. You'll be added when a spot opens.` });
    } else if (result.error === 'wrong_level') {
      toast({ title: '🚫 Wrong Level', description: 'You can only join factions matching your skill level.', variant: 'destructive' });
    } else if (result.error === 'already_joined') {
      toast({ title: 'Already a member', description: 'You are already in this faction.' });
    }
  };

  const handleContinue = () => {
    setOnboardingStep('dashboard'); // done
  };

  const renderFactionCard = (f: typeof factions[0], joinable: boolean) => (
    <Card key={f.id} className="border-border/50 bg-card/80 hover:border-diamond/30 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg">{f.name}</CardTitle>
          <Badge className={difficultyColors[f.difficulty]}>{f.difficulty}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{f.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-secondary/50 rounded-lg p-2">
            <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-semibold">{f.members?.length || 0}/{f.maxMembers || 0}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-diamond" />
            <p className="text-sm font-semibold">{f.questsSolved || 0}</p>
            <p className="text-xs text-muted-foreground">Quests</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2">
            <Diamond className="w-4 h-4 mx-auto mb-1 text-diamond" />
            <p className="text-sm font-semibold">{(f.totalDiamonds || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Diamonds</p>
          </div>
        </div>
        {(f.queue?.length || 0) > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{f.queue?.length || 0} in queue</span>
          </div>
        )}
        {joinable ? (
          joinedFactions.includes(f.id) ? (
            <Button variant="outline" className="w-full" disabled>
              <Check className="w-4 h-4 mr-2" /> Joined
            </Button>
          ) : (
            <Button variant="gold" className="w-full" onClick={() => handleJoin(f.id)}>
              {(f.members?.length || 0) >= (f.maxMembers || 0) ? 'Join Queue' : 'Join Faction'}
            </Button>
          )
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3 text-crimson" />
            <span>Requires {f.difficulty} level</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen gradient-hero p-4 py-12">
      <div className="max-w-3xl mx-auto animate-slide-up">
        
        <button onClick={() => setOnboardingStep('questionnaire')} className="flex items-center gap-2 text-muted-foreground hover:text-diamond mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Questionnaire
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">Join Your Factions</h1>
          <p className="text-muted-foreground mt-2">
            {nicheLabels[niche || '']} • <span className="capitalize">{skillLevel}</span> Level
          </p>
        </div>

        <h2 className="font-display text-lg mb-4 text-diamond">Recommended for You</h2>
        <div className="grid gap-4 mb-8">
          {relevantFactions.map(f => renderFactionCard(f, true))}
          {relevantFactions.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No factions found for your level.</p>
          )}
        </div>

        {otherFactions.length > 0 && (
          <>
            <h2 className="font-display text-lg mb-4 text-muted-foreground">Other {nicheLabels[niche || '']} Factions</h2>
            <div className="grid gap-4 mb-8">
              {otherFactions.map(f => renderFactionCard(f, false))}
            </div>
          </>
        )}

        {joinedFactions.length > 0 && (
          <Button variant="gold" className="w-full" onClick={handleContinue}>
            Enter the Arena →
          </Button>
        )}
      </div>
    </div>
  );
};

export default FactionsPage;
