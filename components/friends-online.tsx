'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Loader2, UserCircle } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface OnlineUser {
    userId: string;
    username: string;
    profilePic?: string;
    status: 'Online' | 'Idle' | 'Studying';
    sessionData?: {
        subjectTitle: string;
        subjectColor: string;
        startTime: string;
    } | null;
}

export function FriendsOnline() {
    const { socket, connected } = useSocket();
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [myGroups, setMyGroups] = useState<any[]>([]);

    // Fetch groups on mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups');
                setMyGroups(res.data);
            } catch (err) {
                console.error('Failed to fetch groups for friends list:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchGroups();
    }, [user]);

    // Handle socket events
    useEffect(() => {
        if (!socket || !connected || myGroups.length === 0) return;

        // Request status for all groups
        myGroups.forEach(group => {
            socket.emit('getGroupStatus', group._id);
        });

        // Listeners
        const handleGroupStatus = (data: { groupId: string, onlineMembers: OnlineUser[] }) => {
            setOnlineUsers(prev => {
                const others = prev.filter(u => !data.onlineMembers.some(newU => newU.userId === u.userId));
                // Merge and deduplicate by userId
                const merged = [...others, ...data.onlineMembers];
                // Ensure uniqueness
                const unique = Array.from(new Map(merged.map(item => [item.userId, item])).values());
                // Remove self
                return unique.filter(u => u.userId !== user?._id);
            });
        };

        const handleUserJoined = (data: any) => {
            // We might not have user details here immediately, but we can re-fetch group status
            socket.emit('getGroupStatus', data.groupId);
        };

        const handleUserLeft = (data: { userId: string }) => {
            // Only remove if they are not in any other of my groups (complex check, simplified: remove and let refresh handle?)
            // Safer: Modify status to offline? Or just remove.
            // For accurate tracking, we'd need to know which group they left.
            // If they are in Group A and Group B, and leave Group A, they are still online in Group B.
            // Simplification: We blindly accept 'userDisconnected' for global offline.
            // For 'userLeft' (group leave), we might just re-poll.
            socket.emit('getGroupStatus', data.groupId); // Refresh specific group
        };

        const handleUserDisconnected = (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
        };

        const handleUserStartedStudying = (data: { userId: string, sessionData: any }) => {
            setOnlineUsers(prev => prev.map(u => {
                if (u.userId === data.userId) {
                    return { ...u, status: 'Studying', sessionData: data.sessionData };
                }
                return u;
            }));
        };

        const handleUserStoppedStudying = (data: { userId: string }) => {
            setOnlineUsers(prev => prev.map(u => {
                if (u.userId === data.userId) {
                    return { ...u, status: 'Online', sessionData: null };
                }
                return u;
            }));
        };

        const handleStatusUpdate = (data: { userId: string, status: 'Online' | 'Idle' }) => {
            setOnlineUsers(prev => prev.map(u => {
                if (u.userId === data.userId) {
                    // Preserve study status if they are studying? Usually Idle overrides Online but Studying is higher priority?
                    // Let's say if they are studying, they can't be idle? Or they can be idle while timer runs?
                    // For YPT, if timer is running, you shouldn't be idle usually, but let's prioritize 'Studying' as the display text
                    // unless we want to show 'Studying (Idle)'.
                    // Simple logic: If studying, keep studying.
                    if (u.status === 'Studying') return u;
                    return { ...u, status: data.status };
                }
                return u;
            }));
        };

        socket.on('groupStatus', handleGroupStatus);
        socket.on('userJoined', handleUserJoined); // When someone enters the room
        socket.on('userLeft', handleUserLeft);
        socket.on('userDisconnected', handleUserDisconnected);
        socket.on('userStartedStudying', handleUserStartedStudying);
        socket.on('userStoppedStudying', handleUserStoppedStudying);
        socket.on('userStatusUpdate', handleStatusUpdate);

        return () => {
            socket.off('groupStatus', handleGroupStatus);
            socket.off('userJoined', handleUserJoined);
            socket.off('userLeft', handleUserLeft);
            socket.off('userDisconnected', handleUserDisconnected);
            socket.off('userStartedStudying', handleUserStartedStudying);
            socket.off('userStoppedStudying', handleUserStoppedStudying);
            socket.off('userStatusUpdate', handleStatusUpdate);
        };
    }, [socket, connected, myGroups, user]);


    if (loading) {
        return (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Users className="w-5 h-5" />
                    </div>
                    <CardTitle className="font-bold text-sm uppercase tracking-wider">Group Mates Online</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-4">
                {onlineUsers.length > 0 ? (
                    <div className="space-y-4">
                        {onlineUsers.slice(0, 5).map((u) => (
                            <div key={u.userId} className="flex items-center justify-between group cursor-default p-2 rounded-lg hover:bg-white/5 transition-colors -mx-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border border-border/50">
                                        <AvatarImage src={u.profilePic} />
                                        <AvatarFallback className="text-[10px] bg-secondary font-bold">
                                            {u.username.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-bold">{u.username}</p>
                                        <div className="text-[10px] font-medium flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Studying' ? 'bg-primary animate-pulse' :
                                                u.status === 'Idle' ? 'bg-yellow-500' : 'bg-green-500'
                                                }`} />
                                            <span className={
                                                u.status === 'Studying' ? 'text-primary' :
                                                    u.status === 'Idle' ? 'text-yellow-500' : 'text-green-500 text-muted-foreground'
                                            }>
                                                {u.status === 'Studying' && u.sessionData ? `Studying ${u.sessionData.subjectTitle}` : u.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {u.status === 'Studying' && (
                                    <span className="text-[10px] font-mono font-medium text-muted-foreground">
                                        {/* We could calculate live duration here if we had startTime, for now static icon or simplified */}
                                        <Loader2 className="w-3 h-3 animate-spin opacity-50" />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-xs text-muted-foreground italic mb-2">No active group mates.</p>
                        <Link href="/groups">
                            <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-wider">
                                Find Groups
                            </Button>
                        </Link>
                    </div>
                )}

                {onlineUsers.length > 5 && (
                    <div className="pt-2 border-t border-border/10">
                        <Button variant="ghost" className="w-full text-xs h-8 hover:bg-white/5">
                            View All ({onlineUsers.length})
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
