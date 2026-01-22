'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, Loader2, Filter, Globe, GraduationCap } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface RankUser {
    rank: number;
    userId: string;
    username: string;
    gradeLevel?: string;
    timeZone?: string;
    profilePic?: string;
    totalMinutes: number;
    totalHours: string;
    isCurrentUser: boolean;
}

export function Rankings() {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [category, setCategory] = useState<'global' | 'grade' | 'timezone'>('global');
    const [rankings, setRankings] = useState<RankUser[]>([]);
    const [currentUser, setCurrentUser] = useState<RankUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRankings();
    }, [period, category]);

    const fetchRankings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/rankings', {
                params: {
                    period,
                    category
                }
            });
            setRankings(response.data.rankings);
            setCurrentUser(response.data.currentUser);
        } catch (error) {
            console.error('Error fetching rankings:', error);
            toast.error('Failed to load rankings');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
            case 2: return <Medal className="w-6 h-6 text-slate-400" />;
            case 3: return <Award className="w-6 h-6 text-amber-600" />;
            default: return <span className="font-mono font-bold text-muted-foreground">{rank}</span>;
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Rankings</h1>
                        <p className="text-muted-foreground">See how you compare with other students</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex bg-muted p-1 rounded-lg">
                            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${period === p
                                            ? 'bg-card text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant={category === 'global' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="gap-2"
                                onClick={() => setCategory('global')}
                            >
                                <Globe className="w-4 h-4" /> Global
                            </Button>
                            <Button
                                variant={category === 'grade' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="gap-2"
                                onClick={() => setCategory('grade')}
                            >
                                <GraduationCap className="w-4 h-4" /> My Grade
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Current User Rank Strip */}
                    {currentUser && (
                        <Card className="bg-primary/5 border-primary/20 ring-1 ring-primary/10">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                        #{currentUser.rank}
                                    </div>
                                    <div>
                                        <p className="font-bold">Your Ranking</p>
                                        <p className="text-xs text-muted-foreground">{category === 'global' ? 'Global' : 'Grade Level'} {period} rank</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-primary">{currentUser.totalHours}h</p>
                                    <p className="text-xs text-muted-foreground">{currentUser.totalMinutes} minutes studied</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rankings List */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {rankings.map((rankUser) => (
                                    <div
                                        key={rankUser.userId}
                                        className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${rankUser.isCurrentUser ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-8 flex justify-center">
                                                {getRankIcon(rankUser.rank)}
                                            </div>
                                            <Avatar className="w-10 h-10 border border-border">
                                                <AvatarImage src={rankUser.profilePic} />
                                                <AvatarFallback>{rankUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold flex items-center gap-2">
                                                    {rankUser.username}
                                                    {rankUser.isCurrentUser && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">YOU</span>}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Grade {rankUser.gradeLevel || 'N/A'} • {rankUser.timeZone || 'UTC'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{rankUser.totalHours}h</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{rankUser.totalMinutes}m</p>
                                        </div>
                                    </div>
                                ))}
                                {rankings.length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground">
                                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No study data recorded for this period yet.</p>
                                        <p className="text-sm">Be the first to start the leaderboard!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
