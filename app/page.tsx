'use client';

import { useState } from 'react';
import { AuthLogin } from '@/components/auth-login';
import { SidebarNav } from '@/components/sidebar-nav';
import { StudyTimer } from '@/components/study-timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FocusMode } from '@/components/focus-mode';
import { SubjectsManager } from '@/components/subjects-manager';
import { GroupStudy } from '@/components/group-study';
import { Analytics } from '@/components/analytics';
import { Settings } from '@/components/settings';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Target } from 'lucide-react';

type AppView =
  | 'login'
  | 'dashboard'
  | 'focus'
  | 'subjects'
  | 'groups'
  | 'analytics'
  | 'settings';

const weeklyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3 },
  { day: 'Wed', hours: 2.8 },
  { day: 'Thu', hours: 3.2 },
  { day: 'Fri', hours: 2.1 },
  { day: 'Sat', hours: 4 },
  { day: 'Sun', hours: 1.5 },
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentView('login');
  };

  const handleFocusMode = () => {
    setCurrentView('focus');
  };

  const handleExitFocusMode = () => {
    setCurrentView('dashboard');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as AppView);
  };

  return (
    <>
      {currentView === 'login' && <AuthLogin onSuccess={handleLogin} />}

      {currentView === 'focus' && <FocusMode onExit={handleExitFocusMode} />}

      {currentView !== 'login' && currentView !== 'focus' && (
        <div className="flex h-screen overflow-hidden">
          <SidebarNav
            currentView={currentView}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />

          <main className="flex-1 overflow-auto bg-background">
            {currentView === 'dashboard' && (
              <div className="p-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back! Keep up your studying streak.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Timer Section */}
                  <div className="flex-1 flex items-center justify-center min-h-[500px] bg-card rounded-lg border border-border p-8">
                    <div className="w-full flex justify-center">
                      <StudyTimer onFocusMode={handleFocusMode} />
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="lg:w-80 space-y-6">
                    {/* Quick Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Today
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Goal Progress</span>
                            <span className="font-medium">83%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div className="bg-primary h-full rounded-full" style={{ width: '83%' }} />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm pt-2">
                          <span className="text-muted-foreground">Sessions</span>
                          <span className="font-medium">4</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time Studied</span>
                          <span className="font-medium">2.5h</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Weekly Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          This Week
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--color-card))',
                                border: '1px solid hsl(var(--color-border))',
                              }}
                              formatter={(value) => `${value}h`}
                            />
                            <Bar dataKey="hours" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Group Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Group Rank
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
                            <span className="text-sm font-medium">Current</span>
                            <span className="text-sm font-bold">#3</span>
                          </div>
                          <p className="text-xs text-muted-foreground">2.1h to next rank</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'subjects' && <SubjectsManager />}

            {currentView === 'groups' && <GroupStudy />}

            {currentView === 'analytics' && <Analytics />}

            {currentView === 'settings' && <Settings />}
          </main>
        </div>
      )}
    </>
  );
}
