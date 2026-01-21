'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusModeProps {
  onExit: () => void;
}

export function FocusMode({ onExit }: FocusModeProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [sessionDuration] = useState(25 * 60);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Detect tab visibility to warn about leaving
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowWarning(true);
        const timer = setTimeout(() => setShowWarning(false), 3000);
        return () => clearTimeout(timer);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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

  const isCompleted = seconds >= sessionDuration;

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Tab Warning */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg text-sm font-medium z-50"
        >
          Stay focused! Keep your eyes on this window.
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center space-y-12 px-4">
        {/* Subject Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <p className="text-lg text-muted-foreground font-medium">Mathematics</p>
        </motion.div>

        {/* Large Timer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="text-9xl font-bold text-primary tabular-nums mb-4">
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <p className="text-2xl text-muted-foreground">
            {isCompleted ? '🎉 Session Complete!' : 'Keep Studying'}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-96 max-w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Elapsed</p>
            <p className="text-2xl font-bold text-foreground">
              {String(minutes).padStart(2, '0')}m
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold text-foreground">
              {String(Math.floor((sessionDuration - seconds) / 60))
                .padStart(2, '0')}
              m
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <Button
            onClick={() => setIsRunning(!isRunning)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </Button>
          <Button
            onClick={onExit}
            size="lg"
            variant="outline"
            className="border-border hover:bg-muted px-8 bg-transparent"
          >
            <X className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </motion.div>
      </div>

      {/* Exit Button (Top Right) */}
      <button
        onClick={onExit}
        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2"
        aria-label="Exit focus mode"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}
