import React from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Diamond, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RewardsPageProps {
  onBack: () => void;
}

const RewardsPage = ({ onBack }: RewardsPageProps) => {
  const { rewards, diamonds, redeemReward } = useApp();
  const { toast } = useToast();

  const handleRedeem = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;
    if (diamonds < reward.cost) {
      toast({ title: '💎 Not enough diamonds', description: `You need ${reward.cost - diamonds} more diamonds.`, variant: 'destructive' });
      return;
    }
    const success = redeemReward(rewardId);
    if (success) {
      toast({ title: '🎉 Reward Redeemed!', description: `${reward.name} has been added to your account.` });
    }
  };

  return (
    <div className="min-h-screen gradient-hero p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-diamond mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">Reward Shop</h1>
          <div className="flex items-center justify-center gap-2 mt-3 bg-card border border-diamond/30 rounded-full px-6 py-3 mx-auto w-fit glow-diamond">
            <Diamond className="w-6 h-6 text-diamond" />
            <span className="font-display text-2xl font-bold text-diamond">{diamonds.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm ml-1">diamonds</span>
          </div>
        </div>

        <div className="grid gap-4">
          {rewards.map(r => {
            const canAfford = diamonds >= r.cost;
            return (
              <Card key={r.id} className={`border-border/50 bg-card/80 transition-all ${canAfford ? 'hover:border-diamond/30 hover:glow-diamond' : 'opacity-60'}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl w-16 h-16 flex items-center justify-center bg-secondary rounded-lg">
                      {r.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{r.name}</h3>
                      <p className="text-sm text-muted-foreground">{r.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Diamond className="w-4 h-4 text-diamond" />
                        <span className="font-display font-bold text-diamond">{r.cost.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button
                      variant={canAfford ? 'gold' : 'outline'}
                      onClick={() => handleRedeem(r.id)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Redeem' : 'Need more 💎'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
