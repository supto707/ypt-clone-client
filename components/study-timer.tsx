'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, Coffee, Loader2, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card, CardContent } from './ui/card';
import { useStudy } from '@/contexts/StudyContext';
import { toast } from 'sonner';

interface StudyTimerProps {
  onFocusMode?: () => void;
  onSessionComplete?: () => void;
}

export function StudyTimer({ onFocusMode }: StudyTimerProps) {
  const {
    activeSession, seconds, isRunning, subjects, selectedSubjectId,
    isPomodoro, isStrict, isBreak,
    setSelectedSubjectId, setIsPomodoro, setIsStrict,
    startSession, stopSession, resetTimer
  } = useStudy();

  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Page Visibility API & Strict Mode Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        if (isStrict) {
          stopSession();
          toast.error('STRICT MODE: Session terminated for leaving the tab!', {
            duration: 10000,
            icon: <Zap className="text-red-500" />
          });
        } else {
          toast.warning('Warning: You left the study tab! Stay focused.', {
            duration: 5000,
            icon: <AlertTriangle className="text-orange-500" />
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isStrict, stopSession]);

  // Idle Detection
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (isRunning) {
        idleTimerRef.current = setTimeout(() => {
          setIsIdle(true);
          toast.info('Are you still there? No activity detected.', {
            icon: <AlertTriangle className="text-yellow-500" />
          });
        }, 60000 * 5); // 5 minutes idle
      }
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    if (isRunning) resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex justify-start">
      <Card className="w-full max-w-4xl bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden relative">
        {/* Animated Background Gradients */}
        {isRunning && (
          <motion.div
            className="absolute inset-0 bg-primary/5 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        )}

        <CardContent className="p-12 md:p-20 flex flex-col items-center space-y-16 relative z-10">
          {/* Typographic Countdown Display */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <motion.span
                  key={formatTime(seconds).split(':')[0]}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[clamp(4rem,12vw,9rem)] font-black tracking-tighter tabular-nums leading-none text-foreground"
                >
                  {formatTime(seconds).split(':')[0]}
                </motion.span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mt-4 opacity-50">
                  {formatTime(seconds).includes(':') && formatTime(seconds).split(':').length === 3 ? 'Hours' : 'Minutes'}
                </span>
              </div>

              <span className="text-[clamp(3rem,8vw,6rem)] font-thin opacity-20 translate-y-[-1.5rem] animate-pulse">
                :
              </span>

              <div className="flex flex-col items-center">
                <motion.span
                  key={formatTime(seconds).split(':').pop()}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[clamp(4rem,12vw,9rem)] font-black tracking-tighter tabular-nums leading-none text-foreground"
                >
                  {formatTime(seconds).split(':').pop()}
                </motion.span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mt-4 opacity-50">
                  {formatTime(seconds).includes(':') ? 'Seconds' : 'Minutes'}
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <motion.div
              layout
              className="mt-12 flex items-center gap-3 bg-secondary/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-border/50 shadow-sm"
            >
              <div className="relative">
                <span className={`block w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                {isRunning && <span className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                {isRunning ? (isBreak ? 'Taking a Break' : 'Deep Work Session') : 'Ready to Focus'}
              </span>
            </motion.div>
          </div>

          <div className="w-full max-w-sm space-y-8">
            {/* Subject Selector */}
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              disabled={isRunning}
            >
              <SelectTrigger className="w-full h-14 bg-background/50 border-border text-base font-bold hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/20 rounded-2xl">
                <div className="flex items-center gap-3 mx-auto">
                  {selectedSubjectId ? (
                    <>
                      <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ backgroundColor: subjects.find(s => s._id === selectedSubjectId)?.color }} />
                      <SelectValue placeholder="Select Subject" />
                    </>
                  ) : (
                    <span className="opacity-50">Choose a Subject</span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border shadow-2xl">
                {subjects.map((sub) => (
                  <SelectItem key={sub._id} value={sub._id} className="h-12 focus:bg-primary/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="font-bold">{sub.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Controls */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={isRunning ? stopSession : startSession}
                size="lg"
                className={`h-20 text-xl font-black tracking-[0.1em] uppercase transition-all duration-500 rounded-3xl shadow-2xl shadow-primary/10 group ${isRunning
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] border-none'
                  }`}
              >
                {isRunning ? (
                  <span className="flex items-center gap-4">
                    <Pause className="w-6 h-6 fill-current" />
                    Finish Session
                  </span>
                ) : (
                  <span className="flex items-center gap-4">
                    <Play className="w-6 h-6 fill-current" />
                    Commence Focus
                  </span>
                )}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={resetTimer}
                  disabled={isRunning}
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-border/50 hover:bg-secondary transition-all"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={onFocusMode}
                  className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-primary/20 text-primary hover:bg-primary/5 transition-all group"
                >
                  <Zap className="w-4 h-4 mr-2 fill-primary group-hover:scale-125 transition-transform" />
                  Enter Zen Mode
                </Button>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-sm pt-8 border-t border-border/50 text-center">
            <button
              onClick={() => setIsPomodoro(!isPomodoro)}
              disabled={isRunning}
              className={`flex flex-col items-center gap-2 group transition-opacity ${isRunning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            >
              <div className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isPomodoro ? 'bg-primary' : 'bg-muted'}`}>
                <motion.div
                  animate={{ x: isPomodoro ? 24 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isPomodoro ? 'text-primary' : 'text-muted-foreground'}`}>Pomodoro</span>
            </button>

            <button
              onClick={() => setIsStrict(!isStrict)}
              disabled={isRunning}
              className={`flex flex-col items-center gap-2 group transition-opacity ${isRunning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            >
              <div className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isStrict ? 'bg-red-500' : 'bg-muted'}`}>
                <motion.div
                  animate={{ x: isStrict ? 24 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isStrict ? 'text-red-500' : 'text-muted-foreground'}`}>Strict Focus</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Decorative Blur Elements */}
      <div className="fixed -z-10 top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -z-10 bottom-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
