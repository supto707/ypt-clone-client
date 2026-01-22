'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface DDay {
    _id: string;
    title: string;
    targetDate: string;
    color: string;
}

export function DDayManager() {
    const [ddays, setDDays] = useState<DDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchDDays();
    }, []);

    const fetchDDays = async () => {
        try {
            const response = await api.get('/ddays');
            setDDays(response.data);
        } catch (error) {
            console.error('Failed to fetch ddays:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newTitle || !newDate) return;
        try {
            const response = await api.post('/ddays', {
                title: newTitle,
                targetDate: newDate
            });
            setDDays([...ddays, response.data].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()));
            setNewTitle('');
            setNewDate('');
            setShowAdd(false);
            toast.success('D-Day added!');
        } catch (error) {
            toast.error('Failed to add D-Day');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/ddays/${id}`);
            setDDays(ddays.filter(d => d._id !== id));
            toast.success('D-Day removed');
        } catch (error) {
            toast.error('Failed to remove D-Day');
        }
    };

    const calculateDaysLeft = (targetDate: string) => {
        const diff = new Date(targetDate).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    D-Day List
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                {showAdd && (
                    <div className="space-y-2 mb-4 p-3 bg-muted/50 rounded-lg">
                        <Input
                            placeholder="Title (e.g. Final Exam)"
                            value={newTitle || ''}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="text-xs h-8"
                        />
                        <Input
                            type="date"
                            value={newDate || ''}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="text-xs h-8"
                        />
                        <Button size="sm" className="w-full text-xs" onClick={handleAdd}>Add D-Day</Button>
                    </div>
                )}
                <div className="space-y-3">
                    {ddays.map(d => {
                        const daysLeft = calculateDaysLeft(d.targetDate);
                        return (
                            <div key={d._id} className="flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{d.title}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {mounted ? new Date(d.targetDate).toLocaleDateString() : '...'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${daysLeft <= 7 ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                                        }`}>
                                        {mounted ? `D-${daysLeft < 0 ? `+${Math.abs(daysLeft)}` : daysLeft}` : '...'}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(d._id)}
                                    >
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                    {ddays.length === 0 && !loading && (
                        <p className="text-center text-xs text-muted-foreground py-4 italic">No D-Days set</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
