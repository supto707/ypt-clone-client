'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Zap, Target, BookOpen, Clock, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OnboardingFlowProps {
    onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [goal, setGoal] = useState('120');
    const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Physics', 'History']);
    const [newSubject, setNewSubject] = useState('');

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFinish = async () => {
        setLoading(true);
        try {
            // 1. Create initial subjects
            await Promise.all(subjects.map(s =>
                api.post('/subjects', { title: s, color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}` })
            ));

            // 2. Update user settings
            await api.put('/users/settings', {
                dailyGoalMinutes: parseInt(goal),
                onboardingCompleted: true
            });

            updateUser({
                settings: {
                    ...user?.settings,
                    dailyGoalMinutes: parseInt(goal),
                    onboardingCompleted: true
                } as any
            });

            toast.success('Onboarding complete! Welcome to YPT.');
            onComplete();
        } catch (error) {
            console.error('Onboarding failed:', error);
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <Card className="w-full max-w-lg border-primary/20 shadow-2xl overflow-hidden">
                <div className="h-1.5 w-full bg-secondary">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: '33.3%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="p-8 space-y-6"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Target className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black">Set Your Goal</CardTitle>
                                <CardDescription className="text-lg">
                                    How many minutes do you want to focus every day?
                                </CardDescription>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {['60', '120', '180', '240', '300', '360'].map(val => (
                                        <Button
                                            key={val}
                                            variant={goal === val ? 'default' : 'outline'}
                                            onClick={() => setGoal(val)}
                                            className="h-16 text-lg font-bold"
                                        >
                                            {parseInt(val) / 60}h
                                        </Button>
                                    ))}
                                </div>
                                <div className="pt-4">
                                    <Label>Custom Minutes</Label>
                                    <Input
                                        type="number"
                                        value={goal}
                                        onChange={e => setGoal(e.target.value)}
                                        className="h-12 text-center text-xl font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex justify-center">
                                <Button onClick={nextStep} size="lg" className="h-14 px-12 text-lg font-bold rounded-full">
                                    Next Step <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="p-8 space-y-6"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black">Choose Subjects</CardTitle>
                                <CardDescription className="text-lg">
                                    What will you be studying? We'll track your time per subject.
                                </CardDescription>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex flex-wrap gap-2">
                                    {subjects.map(s => (
                                        <div
                                            key={s}
                                            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm"
                                        >
                                            {s}
                                            <button
                                                onClick={() => setSubjects(subjects.filter(item => item !== s))}
                                                className="hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Input
                                        placeholder="Add custom subject..."
                                        value={newSubject}
                                        onChange={e => setNewSubject(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && newSubject) {
                                                setSubjects([...subjects, newSubject]);
                                                setNewSubject('');
                                            }
                                        }}
                                    />
                                    <Button onClick={() => {
                                        if (newSubject) {
                                            setSubjects([...subjects, newSubject]);
                                            setNewSubject('');
                                        }
                                    }}>Add</Button>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between">
                                <Button onClick={prevStep} variant="ghost" size="lg">Back</Button>
                                <Button onClick={nextStep} size="lg" className="h-14 px-12 text-lg font-bold rounded-full">
                                    Almost Done <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="p-8 space-y-6"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <CardTitle className="text-3xl font-black">Ready to Focus?</CardTitle>
                                <CardDescription className="text-lg text-pretty">
                                    You're all set. Your daily goal is <strong>{parseInt(goal)} minutes</strong> and you have <strong>{subjects.length} subjects</strong> ready to track.
                                </CardDescription>
                            </div>

                            <div className="space-y-4 pt-8">
                                <div className="bg-secondary/50 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-sm font-medium">Time Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-sm font-medium">Auto-detected settings active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex flex-col gap-3">
                                <Button
                                    onClick={handleFinish}
                                    disabled={loading}
                                    size="lg"
                                    className="h-16 text-xl font-bold rounded-2xl w-full shadow-xl shadow-primary/20"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin w-6 h-6" />
                                    ) : (
                                        'Get Started'
                                    )}
                                </Button>
                                <Button onClick={prevStep} variant="ghost" disabled={loading}>Go Back</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
