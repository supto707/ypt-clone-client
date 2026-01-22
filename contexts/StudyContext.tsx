'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

interface Subject {
    _id: string;
    title: string;
    color: string;
}

interface StudyContextType {
    activeSession: any;
    seconds: number;
    isRunning: boolean;
    subjects: Subject[];
    selectedSubjectId: string;
    isPomodoro: boolean;
    isStrict: boolean;
    isBreak: boolean;
    setSeconds: (s: number) => void;
    setSelectedSubjectId: (id: string) => void;
    setIsPomodoro: (val: boolean) => void;
    setIsStrict: (val: boolean) => void;
    startSession: () => Promise<void>;
    stopSession: () => Promise<void>;
    resetTimer: () => void;
    refreshSubjects: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
    const { socket } = useSocket();
    const [activeSession, setActiveSession] = useState<any>(null);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [isPomodoro, setIsPomodoro] = useState(false);
    const [isStrict, setIsStrict] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    const refreshSubjects = useCallback(async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data);
            if (res.data.length > 0 && !selectedSubjectId) {
                setSelectedSubjectId(res.data[0]._id);
            }
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    }, [selectedSubjectId]);

    useEffect(() => {
        const init = async () => {
            try {
                const [subjectsRes, todayRes] = await Promise.all([
                    api.get('/subjects'),
                    api.get('/stats/today')
                ]);

                setSubjects(subjectsRes.data);
                if (todayRes.data.activeSession) {
                    const session = todayRes.data.activeSession;
                    setActiveSession(session);
                    setSelectedSubjectId(session.subjectId._id);
                    setIsRunning(true);
                    const startTime = new Date(session.startTime).getTime();
                    const now = new Date().getTime();
                    setSeconds(Math.floor((now - startTime) / 1000));
                } else if (subjectsRes.data.length > 0) {
                    setSelectedSubjectId(subjectsRes.data[0]._id);
                }
            } catch (error) {
                console.error('Study init failed:', error);
            }
        };
        init();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const startSession = async () => {
        if (!selectedSubjectId) {
            toast.error('Select a subject first');
            return;
        }
        try {
            const response = await api.post('/sessions/start', { subjectId: selectedSubjectId });
            const session = response.data;
            setActiveSession(session);
            setIsRunning(true);
            if (socket) {
                socket.emit('sessionStarted', {
                    sessionId: session._id,
                    subjectId: session.subjectId._id,
                    subjectTitle: session.subjectId.title,
                    subjectColor: session.subjectId.color,
                    startTime: session.startTime
                });
            }
            toast.info('Session started!');
        } catch (error) {
            toast.error('Failed to start session');
        }
    };

    const stopSession = async () => {
        if (!activeSession) return;
        try {
            await api.post('/sessions/stop', { sessionId: activeSession._id });
            if (socket) {
                socket.emit('sessionStopped', {
                    sessionId: activeSession._id,
                    duration: seconds
                });
            }
            setActiveSession(null);
            setIsRunning(false);
            setSeconds(0);
            toast.success('Session saved!');
        } catch (error) {
            toast.error('Failed to stop session');
        }
    };

    const resetTimer = () => {
        setSeconds(0);
        setIsBreak(false);
    };

    return (
        <StudyContext.Provider value={{
            activeSession, seconds, isRunning, subjects, selectedSubjectId,
            isPomodoro, isStrict, isBreak,
            setSeconds, setSelectedSubjectId, setIsPomodoro, setIsStrict,
            startSession, stopSession, resetTimer, refreshSubjects
        }}>
            {children}
        </StudyContext.Provider>
    );
}

export function useStudy() {
    const context = useContext(StudyContext);
    if (context === undefined) {
        throw new Error('useStudy must be used within a StudyProvider');
    }
    return context;
}
