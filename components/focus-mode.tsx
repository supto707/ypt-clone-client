'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Music, Volume2, VolumeX, Shield, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudy } from '@/contexts/StudyContext';

interface FocusModeProps {
  onExit: () => void;
}

export function FocusMode({ onExit }: FocusModeProps) {
  const {
    seconds, isRunning, activeSession, subjects,
    isBreak, stopSession, startSession
  } = useStudy();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambientActive, setAmbientActive] = useState(false);

  const subject = subjects.find(s => s._id === activeSession?.subjectId?._id) ||
    subjects.find(s => s._id === activeSession?.subjectId);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      h: String(hrs).padStart(2, '0'),
      m: String(mins).padStart(2, '0'),
      s: String(secs).padStart(2, '0'),
      hasHours: hrs > 0
    };
  };

  const time = formatTime(seconds);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-950 text-white flex flex-col items-center justify-center overflow-hidden font-sans"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-20 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at center, ${subject?.color || '#3B82F6'} 0%, transparent 70%)`
          }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Studying</span>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject?.color }} />
              <h2 className="text-xl font-bold tracking-tight">{subject?.title || 'General Focus'}</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAmbientActive(!ambientActive)}
            className={`rounded-full transition-all ${ambientActive ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white'}`}
          >
            {ambientActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white/40 hover:text-white rounded-full"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="text-white/40 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Main Visualizer & Timer */}
      <div className="relative flex flex-col items-center justify-center space-y-24 z-10 w-full max-w-5xl">

        {/* Animated Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-[600px] h-[600px] border border-white/5 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[450px] h-[450px] border border-white/5 rounded-full border-dashed"
          />
        </div>

        {/* Center Timer */}
        <div className="text-center relative">
          <motion.div
            layout
            className="flex items-baseline justify-center gap-6"
          >
            {time.hasHours && (
              <>
                <div className="flex flex-col items-center">
                  <span className="text-[12vw] font-black tracking-tighter tabular-nums leading-none">
                    {time.h}
                  </span>
                </div>
                <span className="text-[8vw] font-thin opacity-20 -translate-y-4">:</span>
              </>
            )}
            <div className="flex flex-col items-center">
              <span className="text-[15vw] font-black tracking-tighter tabular-nums leading-none">
                {time.m}
              </span>
            </div>
            <span className="text-[8vw] font-thin opacity-20 -translate-y-4 animate-pulse">:</span>
            <div className="flex flex-col items-center">
              <span className="text-[15vw] font-black tracking-tighter tabular-nums leading-none">
                {time.s}
              </span>
            </div>
          </motion.div>

          {/* Motivation Quote */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg md:text-xl font-medium text-white/60 tracking-wide mt-12 italic"
          >
            {isBreak ? '"Rest is as important as the work itself."' : '"Focus on the process, not the destination."'}
          </motion.p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-12">
          <button
            onClick={isRunning ? stopSession : startSession}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 group relative ${isRunning ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-primary shadow-[0_0_50px_rgba(var(--primary),0.3)] hover:scale-110'
              }`}
          >
            {isRunning ? (
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-8 bg-white rounded-full" />
                <div className="w-2.5 h-8 bg-white rounded-full" />
              </div>
            ) : (
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Footer Information */}
      <div className="absolute bottom-0 left-0 right-0 p-12 flex justify-between items-end z-20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Efficiency Mode</span>
          </div>
          <div className="h-1.5 w-64 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: isRunning ? '60%' : '20%' }}
              transition={{ duration: 2 }}
            />
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Shield className="w-3 h-3 text-red-500" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Strict Mode Active</span>
          </div>
          <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em]">Esc to Exit Fullscreen</p>
        </div>
      </div>
    </motion.div>
  );
}
