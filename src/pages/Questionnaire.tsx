import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dumbbell, Code, Brain, Zap, ChevronRight } from 'lucide-react';

const niches = [
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'text-emerald-accent' },
  { id: 'cs', label: 'Computer Science', icon: Code, color: 'text-xp' },
  { id: 'mental', label: 'Mental Wellbeing', icon: Brain, color: 'text-diamond' },
  { id: 'productivity', label: 'Productivity', icon: Zap, color: 'text-crimson' },
];

const nicheQuestions: Record<string, { question: string; options: { value: string; label: string }[] }[]> = {
  fitness: [
    { question: 'How physically active are you currently?', options: [
      { value: 'sedentary', label: 'Sedentary – little to no exercise' },
      { value: 'light', label: 'Lightly active – 1-2 times a week' },
      { value: 'moderate', label: 'Moderately active – 3-4 times a week' },
      { value: 'very', label: 'Very active – 5+ times a week' },
    ]},
    { question: 'What is your primary fitness goal?', options: [
      { value: 'start', label: 'Just starting out with exercise' },
      { value: 'consistency', label: 'Building consistency' },
      { value: 'performance', label: 'Improving performance/strength' },
      { value: 'compete', label: 'Training for competitions' },
    ]},
    { question: 'How would you rate your nutrition awareness?', options: [
      { value: 'none', label: 'I don\'t track nutrition at all' },
      { value: 'basic', label: 'I have basic awareness' },
      { value: 'track', label: 'I track macros and calories' },
      { value: 'optimize', label: 'I optimize meal plans regularly' },
    ]},
  ],
  cs: [
    { question: 'How experienced would you say you are in coding?', options: [
      { value: 'none', label: 'No coding experience' },
      { value: 'basics', label: 'Know basics (variables, loops)' },
      { value: 'projects', label: 'Built personal projects' },
      { value: 'professional', label: 'Professional developer' },
    ]},
    { question: 'Which area interests you most?', options: [
      { value: 'web', label: 'Web Development' },
      { value: 'dsa', label: 'Data Structures & Algorithms' },
      { value: 'ml', label: 'Machine Learning / AI' },
      { value: 'systems', label: 'System Design / DevOps' },
    ]},
    { question: 'How often do you practice coding?', options: [
      { value: 'rarely', label: 'Rarely or never' },
      { value: 'weekly', label: 'A few times a week' },
      { value: 'daily', label: 'Almost daily' },
      { value: 'intense', label: 'Multiple hours every day' },
    ]},
  ],
  mental: [
    { question: 'Have you practiced mindfulness or meditation before?', options: [
      { value: 'never', label: 'Never tried it' },
      { value: 'tried', label: 'Tried a few times' },
      { value: 'regular', label: 'Practice regularly' },
      { value: 'deep', label: 'Deep, long-term practice' },
    ]},
    { question: 'What is your primary wellbeing goal?', options: [
      { value: 'stress', label: 'Managing stress & anxiety' },
      { value: 'sleep', label: 'Improving sleep quality' },
      { value: 'focus', label: 'Better focus and clarity' },
      { value: 'growth', label: 'Personal growth & self-awareness' },
    ]},
    { question: 'How do you currently handle stress?', options: [
      { value: 'struggle', label: 'I often feel overwhelmed' },
      { value: 'cope', label: 'I have some coping strategies' },
      { value: 'manage', label: 'I manage stress well usually' },
      { value: 'thrive', label: 'I thrive under pressure' },
    ]},
  ],
  productivity: [
    { question: 'How would you rate your current productivity level?', options: [
      { value: 'low', label: 'I struggle to stay productive' },
      { value: 'moderate', label: 'Somewhat productive but inconsistent' },
      { value: 'good', label: 'Generally productive' },
      { value: 'high', label: 'Highly productive and optimized' },
    ]},
    { question: 'Do you use any productivity systems?', options: [
      { value: 'none', label: 'No system at all' },
      { value: 'basic', label: 'Basic to-do lists' },
      { value: 'system', label: 'GTD / Pomodoro / time-blocking' },
      { value: 'advanced', label: 'Advanced systems with automation' },
    ]},
    { question: 'What is your biggest productivity challenge?', options: [
      { value: 'starting', label: 'Getting started on tasks' },
      { value: 'focus', label: 'Staying focused' },
      { value: 'priority', label: 'Prioritizing effectively' },
      { value: 'burnout', label: 'Avoiding burnout' },
    ]},
  ],
};

function calculateLevel(answers: string[]): 'beginner' | 'intermediate' | 'advanced' {
  const scores: Record<string, number> = {};
  answers.forEach(a => {
    // First option = beginner weight, last = advanced
    const allOptions = Object.values(nicheQuestions).flat().flatMap(q => q.options);
    allOptions.forEach((opt, i) => {
      if (opt.value === a) {
        const qOptions = Object.values(nicheQuestions).flat().find(q => q.options.some(o => o.value === a))?.options || [];
        const idx = qOptions.findIndex(o => o.value === a);
        scores[a] = idx;
      }
    });
  });
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const avg = total / answers.length;
  if (avg < 1.2) return 'beginner';
  if (avg < 2.2) return 'intermediate';
  return 'advanced';
}

const Questionnaire = () => {
  const { setNicheAndLevel } = useApp();
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = selectedNiche ? nicheQuestions[selectedNiche] || [] : [];

  const handleAnswer = (idx: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!selectedNiche || answers.length < questions.length) return;
    const level = calculateLevel(answers);
    setNicheAndLevel(selectedNiche, level);
  };

  const allAnswered = answers.filter(Boolean).length === questions.length;

  return (
    <div className="min-h-screen gradient-hero p-4 py-12">
      <div className="max-w-2xl mx-auto animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">Choose Your Path</h1>
          <p className="text-muted-foreground mt-2">What do you want to improve upon?</p>
        </div>

        {!selectedNiche ? (
          <div className="grid grid-cols-2 gap-4">
            {niches.map(n => (
              <Card key={n.id} className="cursor-pointer border-border/50 bg-card/80 hover:border-diamond/50 transition-all hover:glow-diamond group" onClick={() => { setSelectedNiche(n.id); setAnswers([]); }}>
                <CardContent className="p-6 text-center">
                  <n.icon className={`w-12 h-12 mx-auto mb-3 ${n.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="font-display text-sm font-semibold">{n.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <button onClick={() => { setSelectedNiche(null); setAnswers([]); }} className="text-sm text-muted-foreground hover:text-diamond transition-colors">
              ← Change niche
            </button>

            <div className="flex items-center gap-3 mb-4">
              {React.createElement(niches.find(n => n.id === selectedNiche)?.icon || Zap, { className: `w-6 h-6 ${niches.find(n => n.id === selectedNiche)?.color}` })}
              <h2 className="font-display text-xl font-bold">{niches.find(n => n.id === selectedNiche)?.label}</h2>
            </div>

            {questions.map((q, idx) => (
              <Card key={idx} className="border-border/50 bg-card/80">
                <CardContent className="pt-6 space-y-3">
                  <Label className="text-base font-semibold">{q.question}</Label>
                  <Select value={answers[idx] || ''} onValueChange={v => handleAnswer(idx, v)}>
                    <SelectTrigger><SelectValue placeholder="Select an answer" /></SelectTrigger>
                    <SelectContent>
                      {q.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}

            {allAnswered && (
              <Button variant="gold" className="w-full" onClick={handleSubmit}>
                Find My Factions <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
