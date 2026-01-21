'use client';

import { useState } from 'react';
import { StudyTimer } from '@/components/study-timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, Users, TrendingUp, LogOut } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3 },
  { day: 'Wed', hours: 2.8 },
  { day: 'Thu', hours: 3.2 },
  { day: 'Fri', hours: 2.1 },
  { day: 'Sat', hours: 4 },
  { day: 'Sun', hours: 1.5 },
];

export function Dashboard({
  onLogout,
  onFocusMode,
}: {
  onLogout: () => void;
  onFocusMode: () => void;
}) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'timer'>('timer');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              ST
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">StudyTimer</h1>
              <p className="text-xs text-muted-foreground">Focus. Learn. Succeed.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('timer')}>
              Timer
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={onLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'timer' ? (
          // Timer View
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <StudyTimer onFocusMode={onFocusMode} />
          </div>
        ) : (
          // Dashboard View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Goal Progress */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Today's Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">3 hours</span>
                    <span className="text-muted-foreground">2.5 hours done</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '83%' }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">83% of daily goal complete</p>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Sessions</span>
                    <span className="font-semibold text-foreground">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Study Hours</span>
                    <span className="font-semibold text-foreground">18.6h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Per Session</span>
                    <span className="font-semibold text-foreground">40m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Group Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
                    <span className="text-sm font-medium text-accent-foreground">You</span>
                    <span className="text-sm font-semibold">#3</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Next rank: 2.1h away</p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Weekly Study Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--color-muted-foreground))" />
                    <YAxis stroke="hsl(var(--color-muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--color-card))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => `${value}h`}
                    />
                    <Bar dataKey="hours" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Breakdown */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Top Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Mathematics', hours: 6.5 },
                    { name: 'English', hours: 5.2 },
                    { name: 'Science', hours: 4.1 },
                  ].map((subject) => (
                    <div key={subject.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{subject.name}</span>
                      <span className="text-xs font-medium text-primary">{subject.hours}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
