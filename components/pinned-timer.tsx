'use client';

import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useStudy } from '@/contexts/StudyContext';

export function PinnedTimer() {
    const { isRunning, seconds, activeSession, stopSession, subjects } = useStudy();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'dashboard';

    // Only show pinned timer if:
    // 1. A session is running
    // 2. We are NOT on the dashboard (where the main timer is)
    // 3. We are NOT in focus mode (which has its own big timer)
    const isVisible = isRunning && currentView !== 'dashboard' && currentView !== 'focus';

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const subject = activeSession ? (subjects.find(s => s._id === (activeSession.subjectId?._id || activeSession.subjectId))) : null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm"
                >
                    <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/20 shadow-[0_8px_48px_rgba(0,0,0,0.3)] rounded-3xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Zap className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Studying</p>
                                <p className="text-sm font-black truncate text-foreground">{subject?.title || 'Active Session'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-2xl font-mono font-black text-primary tabular-nums leading-none">
                                    {formatTime(seconds)}
                                </p>
                            </div>

                            <Button
                                onClick={stopSession}
                                size="icon"
                                className="h-12 w-12 rounded-2xl shadow-xl shadow-destructive/20 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all active:scale-95"
                            >
                                <Pause className="w-6 h-6 fill-current" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
