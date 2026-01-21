'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
  tasks: number;
  totalTime: number;
}

export function SubjectsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', color: 'bg-blue-500', tasks: 5, totalTime: 12 },
    { id: '2', name: 'English', color: 'bg-purple-500', tasks: 3, totalTime: 8 },
    { id: '3', name: 'Science', color: 'bg-green-500', tasks: 4, totalTime: 10 },
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [showForm, setShowForm] = useState(false);

  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setSubjects([
        ...subjects,
        {
          id: String(Date.now()),
          name: newSubject,
          color: colors[Math.floor(Math.random() * colors.length)],
          tasks: 0,
          totalTime: 0,
        },
      ]);
      setNewSubject('');
      setShowForm(false);
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Subjects & Tasks</h1>
        <p className="text-muted-foreground">Organize your study materials by subject</p>
      </div>

      <div className="max-w-6xl">
        {/* Add Subject */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">My Subjects</CardTitle>
            <CardDescription>Organize your study materials by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Subject name..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  className="bg-background border-border"
                />
                <Button
                  onClick={handleAddSubject}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setNewSubject('');
                  }}
                  variant="outline"
                  className="border-border"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Subject
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-4 h-4 rounded-full ${subject.color}`} />
                    <div className="flex-1">
                      <CardTitle className="text-base">{subject.name}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {Math.floor((subject.totalTime / 25) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-full ${subject.color} rounded-full`}
                      style={{ width: `${Math.floor((subject.totalTime / 25) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted p-2 rounded">
                    <p className="text-muted-foreground text-xs">Tasks</p>
                    <p className="font-semibold text-foreground">{subject.tasks}</p>
                  </div>
                  <div className="bg-muted p-2 rounded flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Hours</p>
                      <p className="font-semibold text-foreground">{subject.totalTime}h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
