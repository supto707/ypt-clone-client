'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        if (socketRef.current) return; // Prevent multiple connections

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Global Socket connected:', newSocket.id);
            setConnected(true);
            newSocket.emit('authenticate', user._id);
        });

        newSocket.on('disconnect', () => {
            console.log('Global Socket disconnected');
            setConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return () => {
            // Note: We don't disconnect here on every minor unmount, only if user logs out
            // The ref check at the top handles that.
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
