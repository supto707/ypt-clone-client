'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Clock, BookOpen } from 'lucide-react';
import api from '@/lib/api';

interface Subject {
  _id: string;
  title: string;
  color: string;
}

export function SubjectsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const colors = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
        setSubjects([...subjects, response.data]);
        setNewSubject('');
        setSelectedColor('');
        setShowForm(false);
      } catch (error) {
        console.error('Error adding subject:', error);
      }
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter((s) => s._id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      </div>
    );
  }

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
            <CardDescription>Create color-coded subjects to organize your studies</CardDescription>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <div className="space-y-4">
                <Input
                  placeholder="Subject name (e.g., Mathematics)..."
                  value={newSubject || ''}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  className="bg-background border-border"
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Choose a color:</p>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSubject}
                    disabled={!newSubject.trim() || !selectedColor}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Add Subject
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setNewSubject('');
                      setSelectedColor('');
                    }}
                    variant="outline"
                    className="border-border"
                  >
                    Cancel
                  </Button>
                </div>
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

        {/* Empty State */}
        {subjects.length === 0 && !showForm && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No subjects yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first subject to start organizing your study sessions. You can track time and tasks for each subject.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Subject
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subject Grid */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base">{subject.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteSubject(subject._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Use this subject when starting study sessions
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
