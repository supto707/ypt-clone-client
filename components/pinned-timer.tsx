'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Zap, Clock, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

export function PinnedTimer() {
    const { socket, connected } = useSocket();
    const { user } = useAuth();
    const [activeSession, setActiveSession] = useState<any>(null);
    const [seconds, setSeconds] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkActiveSession = async () => {
            try {
                const res = await api.get('/stats/today');
                if (res.data.activeSession) {
                    const session = res.data.activeSession;
                    setActiveSession(session);
                    const startTime = new Date(session.startTime).getTime();
                    setSeconds(Math.floor((Date.now() - startTime) / 1000));
                    setIsVisible(true);
                }
            } catch (err) {
                console.error('Failed to check active session:', err);
            }
        };

        checkActiveSession();

        if (socket) {
            socket.on('userStartedStudying', (data: any) => {
                if (data.userId === user._id) {
                    setActiveSession(data.sessionData);
                    setSeconds(0);
                    setIsVisible(true);
                }
            });

            socket.on('userStoppedStudying', (data: any) => {
                if (data.userId === user._id) {
                    setIsVisible(false);
                    setActiveSession(null);
                }
            });

            return () => {
                socket.off('userStartedStudying');
                socket.off('userStoppedStudying');
            };
        }
    }, [socket, user]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isVisible && activeSession) {
            interval = setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isVisible, activeSession]);

    const handleStop = async () => {
        if (!activeSession) return;
        try {
            await api.post('/sessions/stop', { sessionId: activeSession.sessionId || activeSession._id });
            if (socket) {
                socket.emit('sessionStopped', {
                    sessionId: activeSession.sessionId || activeSession._id,
                    duration: seconds
                });
            }
            setIsVisible(false);
            setActiveSession(null);
            toast.success('Session saved!');
        } catch (err) {
            toast.error('Failed to stop session');
        }
    };

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isVisible && activeSession && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-background/80 backdrop-blur-xl border-2 border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-2xl px-6 py-3 flex items-center gap-6 min-w-[320px]">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                                </div>
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Studying</p>
                                <p className="text-sm font-bold truncate max-w-[120px]">{activeSession.subjectTitle}</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center">
                            <p className="text-2xl font-mono font-black text-primary tabular-nums">
                                {formatTime(seconds)}
                            </p>
                        </div>

                        <Button
                            onClick={handleStop}
                            size="icon"
                            variant="destructive"
                            className="h-10 w-10 rounded-xl shadow-lg shadow-destructive/20"
                        >
                            <Pause className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
