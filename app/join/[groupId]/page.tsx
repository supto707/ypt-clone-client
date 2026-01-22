'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ArrowRight, ShieldCheck, Globe, Lock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function JoinGroupPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    const groupId = params.groupId as string;

    useEffect(() => {
        if (groupId) {
            fetchGroupInfo();
        }
    }, [groupId]);

    const fetchGroupInfo = async () => {
        try {
            const response = await api.get(`/groups/${groupId}`);
            setGroup(response.data);
        } catch (error) {
            console.error('Failed to fetch group info:', error);
            toast.error('Group not found or unavailable');
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) {
            router.push(`/login?redirect=/join/${groupId}`);
            return;
        }

        setJoining(true);
        try {
            await api.post(`/groups/${groupId}/members`);
            toast.success(`Welcome to ${group.name}!`);
            router.push(`/?view=groups`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to join group');
        } finally {
            setJoining(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!group) return null;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,var(--color-primary-foreground),transparent)] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-primary/20 shadow-2xl overflow-hidden">
                <div className="h-2 w-full bg-primary/20">
                    <div className="h-full bg-primary w-full" />
                </div>
                <CardHeader className="text-center pt-8">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-black">{group.name}</CardTitle>
                    <CardDescription className="text-lg">
                        You've been invited to join this study group
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="bg-secondary/50 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-medium">Privacy</span>
                            {group.isPublic ? (
                                <span className="flex items-center gap-1 text-green-500 font-bold uppercase tracking-tighter text-[10px] bg-green-500/10 px-2 py-1 rounded">
                                    <Globe className="w-3 h-3" /> Public
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-orange-500 font-bold uppercase tracking-tighter text-[10px] bg-orange-500/10 px-2 py-1 rounded">
                                    <Lock className="w-3 h-3" /> Private
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-medium">Members</span>
                            <span className="font-bold">{group.memberCount || 0} / {group.maxMembers}</span>
                        </div>
                        {group.rules && (
                            <div className="pt-2 border-t border-border/50">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 italic flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Group Rules
                                </p>
                                <p className="text-xs italic text-muted-foreground">{group.rules}</p>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full h-16 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 group"
                    >
                        {joining ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            user ? 'JOIN GROUP NOW' : 'SIGN IN TO JOIN'
                        )}
                        {!joining && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="w-full text-muted-foreground"
                    >
                        Not now, take me home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
