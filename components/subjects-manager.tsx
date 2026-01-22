'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BookOpen, Archive, ArchiveRestore, Layers, CheckCircle2, Check, Loader2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useStudy } from '@/contexts/StudyContext';

interface Subject {
  _id: string;
  title: string;
  color: string;
  isArchived?: boolean;
}

function SubjectTasks({ subjectId, color }: { subjectId: string, color: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks?subjectId=${subjectId}`);
        setTasks(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [subjectId]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await api.post('/tasks', { title: newTask, subjectId });
      setTasks([res.data, ...tasks]);
      setNewTask('');
    } catch (e) {
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await api.put(`/tasks/${taskId}`, { completed: !completed });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, completed: !completed } : t));
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="py-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin opacity-20" /></div>;

  return (
    <div className="space-y-3 mt-4 animate-in fade-in duration-500">
      <div className="flex gap-2">
        <Input
          placeholder="New task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAddTask()}
          className="h-8 text-xs bg-muted/50 border-none shadow-inner"
        />
        <Button onClick={handleAddTask} size="icon" className="h-8 w-8 shrink-0">
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
        {tasks.map(task => (
          <div key={task._id} className="flex items-center justify-between group/task bg-muted/30 p-2 rounded-lg border border-transparent hover:border-border/50 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task._id, task.completed)}
                className="w-4 h-4"
              />
              <span className={`text-[11px] font-bold truncate ${task.completed ? 'line-through text-muted-foreground/40' : 'text-foreground/80'}`}>
                {task.title}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
              className="opacity-0 group-hover/task:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded-md transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-[10px] text-center text-muted-foreground py-2 italic">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}

export function SubjectsManager() {
  const { refreshSubjects } = useStudy();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const colors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  ];

  useEffect(() => {
    fetchSubjects();
  }, [showArchived]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects', {
        params: { includeArchived: showArchived }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (newSubject.trim() && selectedColor) {
      try {
        const response = await api.post('/subjects', {
          title: newSubject,
          color: selectedColor,
        });
        setSubjects([response.data, ...subjects]);
        setNewSubject('');
        setShowForm(false);
        refreshSubjects();
        toast.success('Subject added');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to add subject');
      }
    }
  };

  const handleArchiveSubject = async (id: string, isArchived: boolean) => {
    try {
      await api.put(`/subjects/${id}`, { isArchived: !isArchived });
      setSubjects(subjects.filter(s => s._id !== id));
      refreshSubjects();
      toast.success(isArchived ? 'Subject restored' : 'Subject archived');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure? This will delete all history for this subject.')) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter((s) => s._id !== id));
      refreshSubjects();
      toast.success('Subject deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading Subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-8 rounded-3xl border border-primary/10">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2 flex items-center gap-3">
            <Layers className="w-10 h-10 text-primary" />
            Curriculum
          </h1>
          <p className="text-muted-foreground font-medium">Manage your academic subjects and focus áreas</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={showArchived ? 'default' : 'outline'}
            onClick={() => setShowArchived(!showArchived)}
            className="rounded-xl h-12 px-6"
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Subject
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {showForm && (
          <Card className="border-primary/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="h-1.5 w-full bg-primary" />
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Subject Name</Label>
                  <Input
                    placeholder="e.g. Molecular Biology"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="h-14 text-lg font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Identify Color</Label>
                  <div className="flex gap-3 flex-wrap pt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-xl border-4 transition-all hover:scale-110 ${selectedColor === color ? 'border-foreground shadow-lg' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button onClick={handleAddSubject} className="h-14 px-10 font-black flex-1 md:flex-none">Save Subject</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} className="h-14 px-8">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-50">
            <BookOpen className="w-20 h-20 text-muted-foreground" />
            <div>
              <h3 className="text-2xl font-black">No {showArchived ? 'archived' : 'active'} subjects</h3>
              <p className="text-muted-foreground">You haven't {showArchived ? 'archived' : 'created'} any subjects yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject._id} className={`group relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${subject.isArchived ? 'bg-muted/50 border-dashed opacity-80' : 'border-border/50'}`}>
                <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-full" style={{ backgroundColor: subject.color }} />
                <CardHeader className="pl-6 pt-6 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{subject.title}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {subject.isArchived ? 'Archived Subject' : 'Active Curricula'}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-primary"
                        onClick={() => handleArchiveSubject(subject._id, subject.isArchived || false)}
                        title={subject.isArchived ? 'Restore' : 'Archive'}
                      >
                        {subject.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteSubject(subject._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pl-6 pb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-4">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                    {subject.color.toUpperCase()}
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                      Quick Tasks
                    </p>
                    <SubjectTasks subjectId={subject._id} color={subject.color} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
