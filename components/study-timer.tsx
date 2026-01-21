'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudyTimerProps {
  onFocusMode?: () => void;
}

export function StudyTimer({ onFocusMode }: StudyTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionDuration] = useState(25 * 60); // 25 minutes default

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => (s < sessionDuration ? s + 1 : s));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, sessionDuration]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = (seconds / sessionDuration) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
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
            stroke="hsl(var(--color-primary))"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: `${2 * Math.PI * 120}` }}
            animate={{
              strokeDashoffset: `${2 * Math.PI * 120 * (1 - progress / 100)}`,
            }}
            transition={{ duration: 0.5 }}
            style={{
              strokeDasharray: `${2 * Math.PI * 120}`,
            }}
          />
        </svg>

        {/* Timer Text */}
        <div className="text-center z-10">
          <div className="text-6xl font-bold text-foreground tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Pomodoro Session</p>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="w-full max-w-sm">
        <label className="text-sm font-medium text-foreground mb-2 block">Current Subject</label>
        <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm">
          <option>Mathematics</option>
          <option>English</option>
          <option>Science</option>
          <option>History</option>
        </select>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={() => setSeconds(0)}
          size="lg"
          variant="outline"
          className="border-border hover:bg-muted"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </Button>
        <Button
          onClick={onFocusMode}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Focus Mode
        </Button>
      </div>
    </div>
  );
}
