import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AuthPage from './AuthPage';
import ProfileSetup from './ProfileSetup';
import Questionnaire from './Questionnaire';
import FactionsPage from './FactionsPage';
import Dashboard from './Dashboard';
import RewardsPage from './RewardsPage';

const Index = () => {
  const { isAuthenticated, onboardingStep } = useApp();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  if (!isAuthenticated) return <AuthPage />;
  if (onboardingStep === 'profile') return <ProfileSetup />;
  if (onboardingStep === 'questionnaire') return <Questionnaire />;
  if (onboardingStep === 'factions') return <FactionsPage />;

  if (currentPage === 'rewards') return <RewardsPage onBack={() => setCurrentPage('dashboard')} />;
  return <Dashboard onNavigate={setCurrentPage} />;
};

export default Index;
