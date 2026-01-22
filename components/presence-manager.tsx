'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

export function PresenceManager() {
    const { socket, connected } = useSocket();
    const { user } = useAuth();
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!socket || !connected || !user) return;

        const handleVisibility = () => {
            if (document.hidden) {
                socket.emit('userIdle');
            } else {
                socket.emit('userActive');
            }
        };

        const resetIdleTimer = () => {
            socket.emit('userActive');
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

            // Auto-idle after 10 minutes of no mouse/keyboard activity
            idleTimerRef.current = setTimeout(() => {
                socket.emit('userIdle');
            }, 60000 * 10);
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);

        // Initial check
        resetIdleTimer();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [socket, connected, user]);

    return null; // Side-effect only component
}
