'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
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
    <div className="flex flex-col items-center justify-center space-y-8 w-full">
      {/* Mode Status */}
      <div className="flex items-center gap-4 bg-muted/50 px-4 py-2 rounded-full border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pomodoro</span>
          <Switch checked={isPomodoro} onCheckedChange={setIsPomodoro} disabled={isRunning} />
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Strict Mode</span>
          <Switch checked={isStrict} onCheckedChange={setIsStrict} disabled={isRunning} />
        </div>
        {isPomodoro && (
          <div className="flex items-center gap-2 border-l border-border pl-4">
            {isBreak ? <Coffee className="w-4 h-4 text-green-500" /> : <Zap className="w-4 h-4 text-primary" />}
            <span className="text-xs font-bold uppercase tracking-wider">
              {isBreak ? 'Break' : 'Focus'}
            </span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 256 256">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="hsl(var(--color-border))"
            strokeWidth="8"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={isBreak ? "hsl(var(--color-green-500))" : "hsl(var(--color-primary))"}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: 2 * Math.PI * 120, strokeDashoffset: 2 * Math.PI * 120 }}
            animate={{
              strokeDashoffset: isRunning ? (isPomodoro ? (2 * Math.PI * 120) * (1 - seconds / (isBreak ? 300 : 1500)) : 0) : 2 * Math.PI * 120,
            }}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Timer Text */}
        <div className="text-center z-10 flex flex-col items-center">
          <div className={`text-5xl font-bold tabular-nums ${isIdle ? 'text-muted-foreground animate-pulse' : 'text-foreground'}`}>
            {formatTime(seconds)}
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center gap-1">
            {isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                {isBreak ? 'Relaxing...' : (isIdle ? 'Idle Detected' : 'Studying...')}
              </>
            ) : 'Ready to Start'}
          </p>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="w-full max-w-sm space-y-2">
        <label className="text-sm font-medium text-foreground block">Select Subject</label>
        <Select
          value={selectedSubjectId}
          onValueChange={setSelectedSubjectId}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((sub) => (
              <SelectItem key={sub._id} value={sub._id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                  {sub.title}
                </div>
              </SelectItem>
            ))}
            {subjects.length === 0 && (
              <SelectItem value="none" disabled>No subjects found. Create one first!</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          onClick={handleToggleTimer}
          size="lg"
          className={`${isRunning ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} text-white px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all`}
        >
          {isRunning ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
          {isRunning ? 'Stop Session' : 'Start Study'}
        </Button>

        <Button
          onClick={handleReset}
          size="lg"
          variant="outline"
          disabled={isRunning}
          className="border-border hover:bg-muted h-14"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>

        <Button
          onClick={onFocusMode}
          size="lg"
          variant="secondary"
          className="bg-accent hover:bg-accent/90 text-accent-foreground h-14"
        >
          <Zap className="w-5 h-5 mr-2" />
          Focus
        </Button>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
