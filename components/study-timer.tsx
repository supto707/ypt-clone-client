'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, Coffee, Loader2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card, CardContent } from './ui/card';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

interface Subject {
  _id: string;
  title: string;
  color: string;
}

interface StudyTimerProps {
  onFocusMode?: () => void;
  onSessionComplete?: () => void;
}

export function StudyTimer({ onFocusMode, onSessionComplete }: StudyTimerProps) {
  const { socket } = useSocket();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Advanced Features State
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isStrict, setIsStrict] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Fetch subjects and active session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [subjectsRes, todayRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/stats/today')
        ]);

        setSubjects(subjectsRes.data);
        if (subjectsRes.data.length > 0) {
          setSelectedSubjectId(subjectsRes.data[0]._id);
        }

        if (todayRes.data.activeSession) {
          const session = todayRes.data.activeSession;
          setActiveSession(session);
          setSelectedSubjectId(session.subjectId._id);
          setIsRunning(true);

          // Calculate elapsed time
          const startTime = new Date(session.startTime).getTime();
          const now = new Date().getTime();
          setSeconds(Math.floor((now - startTime) / 1000));
        }
      } catch (error) {
        console.error('Failed to initialize timer:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        if (isStrict) {
          handleToggleTimer(); // Force stop session
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
  }, [isRunning, isStrict, activeSession]);

  // Idle Detection
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      lastActivityRef.current = Date.now();
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

  // Update timer every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          // Pomodoro logic
          if (isPomodoro) {
            const limit = isBreak ? 5 * 60 : 25 * 60;
            if (next >= limit) {
              handlePomodoroComplete();
              return 0;
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPomodoro, isBreak]);

  const handlePomodoroComplete = () => {
    const wasBreak = isBreak;
    setIsBreak(!wasBreak);
    toast.success(wasBreak ? 'Break finished! Time to study.' : 'Pomodoro finished! Take a 5-min break.');
    // Play sound if possible
    try { new Audio('/notification.mp3').play(); } catch (e) { }
  };

  const handleToggleTimer = async () => {
    if (!selectedSubjectId && !isRunning) {
      toast.error('Please select a subject first!');
      return;
    }

    try {
      if (!isRunning) {
        // Start session
        const response = await api.post('/sessions/start', {
          subjectId: selectedSubjectId,
          focusMode: false
        });
        const session = response.data;
        setActiveSession(session);
        setIsRunning(true);
        toast.info('Study session started. Stay focused!');

        // Socket event
        if (socket) {
          socket.emit('sessionStarted', {
            sessionId: session._id,
            subjectId: session.subjectId._id,
            subjectTitle: session.subjectId.title,
            subjectColor: session.subjectId.color,
            startTime: session.startTime
          });
        }
      } else {
        // Stop session
        if (activeSession) {
          await api.post('/sessions/stop', { sessionId: activeSession._id });

          // Socket event
          if (socket) {
            socket.emit('sessionStopped', {
              sessionId: activeSession._id,
              duration: seconds
            });
          }

          setActiveSession(null);
          setIsRunning(false);
          setSeconds(0);
          setIsBreak(false);
          toast.success('Session saved successfully!');
          if (onSessionComplete) onSessionComplete();
        }
      }
    } catch (error) {
      console.error('Failed to toggle timer:', error);
      toast.error('Failed to save session');
    }
  };

  const handleReset = () => {
    if (isRunning) {
      toast.warning('Please stop the timer before resetting');
      return;
    }
    setSeconds(0);
    setIsBreak(false);
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="w-full flex justify-start">
      <Card className="w-full max-w-4xl bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardContent className="p-12 md:p-20 flex flex-col items-center space-y-16">
          {/* Typographic Countdown Display */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <span className="text-[clamp(4rem,10vw,8rem)] font-black tracking-tight tabular-nums leading-none text-foreground">
                  {formatTime(seconds).split(':')[0]}
                </span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mt-4">
                  Minutes
                </span>
              </div>

              <span className="text-[clamp(3rem,8vw,6rem)] font-light opacity-20 translate-y-[-1rem]">
                :
              </span>

              <div className="flex flex-col items-center">
                <span className="text-[clamp(4rem,10vw,8rem)] font-black tracking-tight tabular-nums leading-none text-foreground">
                  {formatTime(seconds).split(':')[1]}
                </span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mt-4">
                  Seconds
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-12 flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {isRunning ? (isBreak ? 'Break Mode' : 'Focus Mode') : 'Ready to Start'}
              </span>
            </div>
          </div>

          {/* Subject Context Selector */}
          <div className="w-full max-w-xs">
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              disabled={isRunning}
            >
              <SelectTrigger className="w-full h-12 bg-background border-input text-sm font-medium hover:border-primary/50 transition-colors focus:ring-1 focus:ring-primary">
                <div className="flex items-center gap-2 mx-auto">
                  <SelectValue placeholder="Select Subject" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub._id} value={sub._id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span>{sub.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controls - Interactive Buttons */}
          <div className="flex flex-col items-center gap-8 w-full">
            <Button
              onClick={handleToggleTimer}
              size="lg"
              className={`w-full max-w-sm h-16 text-lg font-bold tracking-widest uppercase transition-all duration-300 shadow-lg ${isRunning
                ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20 border-2'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                }`}
            >
              {isRunning ? (
                <span className="flex items-center gap-3">
                  <Pause className="w-5 h-5 fill-current" />
                  Stop Session
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Play className="w-5 h-5 fill-current" />
                  Start Focus
                </span>
              )}
            </Button>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isRunning}
                className="h-10 px-6 text-xs font-bold tracking-wider uppercase hover:bg-secondary"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onFocusMode}
                className="h-10 px-6 text-xs font-bold tracking-wider uppercase border-primary/20 text-primary hover:bg-primary/5"
              >
                <Zap className="w-3.5 h-3.5 mr-2" />
                Zen Mode
              </Button>
            </div>
          </div>

          {/* System Settings */}
          <div className="flex items-center gap-8 pt-4 border-t w-full justify-center">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pomodoro</span>
              <Switch checked={isPomodoro} onCheckedChange={setIsPomodoro} disabled={isRunning} />
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strict Mode</span>
              <Switch checked={isStrict} onCheckedChange={setIsStrict} disabled={isRunning} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
