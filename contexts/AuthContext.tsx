'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { signInWithPopup, AuthProvider as FirebaseAuthProvider } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';


interface User {
    _id: string;
    username: string;
    email: string;
    timeZone: string;
    gradeLevel: string;
    profilePic?: string;
    settings?: {
        onboardingCompleted?: boolean;
        dailyGoalMinutes?: number;
        focusModeEnabled?: boolean;
        allowedSites?: string[];
        privacy?: {
            showStudyStatus: boolean;
            showSubjectName: boolean;
            shareAnalytics: boolean;
        };
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithGitHub: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    timeZone: string;
    gradeLevel: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: newToken, ...userData } = response.data;

            setToken(newToken);
            setUser(userData);

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await api.post('/auth/register', data);
            const { token: newToken, ...userData } = response.data;

            setToken(newToken);
            setUser(userData);

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const loginWithSocial = async (provider: FirebaseAuthProvider, providerName: 'google' | 'github') => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const response = await api.post('/auth/social-login', {
                email: user.email,
                username: user.displayName,
                profilePic: user.photoURL,
                socialId: user.uid,
                provider: providerName,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            const { token: newToken, ...userData } = response.data;

            setToken(newToken);
            setUser(userData);

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error: any) {
            console.error(`Social login failed for ${providerName}:`, error);
            if (error.response) {
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
            } else if (error.request) {
                console.error('Request was made but no response was received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            throw new Error(error.response?.data?.message || `${providerName} login failed`);
        }
    };

    const loginWithGoogle = () => loginWithSocial(googleProvider, 'google');
    const loginWithGitHub = () => loginWithSocial(githubProvider, 'github');

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            loginWithGoogle,
            loginWithGitHub,
            register,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
