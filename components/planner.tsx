'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from './ui/checkbox';
import { Clock, Plus, Trash2, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Subject {
    _id: string;
    title: string;
    color: string;
}

interface Task {
    _id: string;
    title: string;
    completed: boolean;
    subjectId: string | null;
}

export function Planner() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksRes, subjectsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/subjects')
            ]);
            setTasks(tasksRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Failed to fetch planner data:', error);
            toast.error('Failed to load planner');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const response = await api.post('/tasks', { title: newTaskTitle });
            setTasks([...tasks, response.data]);
            setNewTaskTitle('');
            toast.success('Task added');
        } catch (error) {
            toast.error('Failed to add task');
        }
    };

    const toggleTask = async (taskId: string, completed: boolean) => {
        try {
            await api.put(`/tasks/${taskId}`, { completed: !completed });
            setTasks(tasks.map(t => t._id === taskId ? { ...t, completed: !completed } : t));
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(t => t._id !== taskId));
            toast.success('Task deleted');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    // 10-minute blocks logic
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const blocks = Array.from({ length: 6 }, (_, i) => i * 10);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Daily Planner</h1>
                <p className="text-muted-foreground">Manage your tasks and plan your study blocks</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Daily To-Do */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Daily To-Do
                            </CardTitle>
                            <CardDescription>Stay on top of your daily goals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                                <Input
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </form>

                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <div key={task._id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={() => toggleTask(task._id, task.completed)}
                                            />
                                            <span className={`${task.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteTask(task._id)}
                                            className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {!loading && tasks.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground py-4">No tasks for today. Add one!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Completion Rate</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <CalendarIcon className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 10-Minute Planning Blocks */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Time Blocks
                                </CardTitle>
                                <CardDescription>Plan your day in 10-minute increments</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    <span className="text-xs text-muted-foreground">Studied</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-secondary" />
                                    <span className="text-xs text-muted-foreground">Empty</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {hours.map((hour) => (
                                    <div key={hour} className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                                            {hour.toString().padStart(2, '0')}:00
                                        </span>
                                        <div className="flex-1 grid grid-cols-6 gap-1">
                                            {blocks.map((block) => (
                                                <div
                                                    key={block}
                                                    title={`${hour}:${block}`}
                                                    className="h-6 rounded-sm bg-muted border border-border/50 hover:border-primary transition-all cursor-pointer"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
