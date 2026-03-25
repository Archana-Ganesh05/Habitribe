import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Diamond, Shield, Swords } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const AuthPage = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    if (!isLogin && !PASSWORD_REGEX.test(password)) {
      setError('Password must be 8+ chars with uppercase, lowercase, number, and special character.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (isLogin) {
      if (!login(email, password)) setError('Invalid email or password.');
    } else {
      if (!signup(email, password)) setError('Email already registered.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-diamond" />
            <h1 className="text-4xl font-display font-bold text-diamond tracking-wider">HABITRIBE</h1>
            <Swords className="w-10 h-10 text-diamond" />
          </div>
          <p className="text-muted-foreground font-body">Forge habits. Join factions. Earn glory.</p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-display text-xl">{isLogin ? 'Welcome Back' : 'Join the Tribe'}</CardTitle>
            <CardDescription>{isLogin ? 'Login to continue your quest' : 'Create your warrior account'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="warrior@habitribe.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                </div>
              )}
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  8+ characters, uppercase, lowercase, number, and special character required.
                </p>
              )}
              {error && <p className="text-sm text-crimson">{error}</p>}
              <Button type="submit" variant="gold" className="w-full text-base">
                <Diamond className="w-4 h-4 mr-2" />
                {isLogin ? 'Enter the Arena' : 'Begin Your Journey'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-muted-foreground hover:text-diamond transition-colors">
                {isLogin ? "Don't have an account? Sign up" : 'Already a warrior? Login'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
