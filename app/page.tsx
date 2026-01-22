'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { SidebarNav } from '@/components/sidebar-nav';
import { StudyTimer } from '@/components/study-timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FocusMode } from '@/components/focus-mode';
import { SubjectsManager } from '@/components/subjects-manager';
import { GroupStudy } from '@/components/group-study';
import { Rankings } from '@/components/rankings';
import { Analytics } from '@/components/analytics';
import { Planner } from '@/components/planner';
import { Settings } from '@/components/settings';
import { DDayManager } from '@/components/d-day';
import { PresenceManager } from '@/components/presence-manager';
import { PinnedTimer } from '@/components/pinned-timer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Clock, Calendar, Zap, Award, Flame, PieChart as PieIcon } from 'lucide-react';
import api from '@/lib/api';

type AppView =
  | 'dashboard'
  | 'focus'
  | 'subjects'
  | 'planner'
  | 'groups'
  | 'rankings'
  | 'analytics'
  | 'settings';

// Landing Page Component
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">YPT</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Track Your Study Time,
            <span className="text-primary"> Boost Your Productivity</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Join thousands of students using YPT to stay focused, compete with friends,
            and achieve their academic goals.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Studying Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-muted-foreground text-lg">
            Powerful features to help you stay focused and motivated
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Study Timer</h3>
              <p className="text-muted-foreground">
                Track your study sessions with precision. Start, pause, and stop with ease.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Subject Management</h3>
              <p className="text-muted-foreground">
                Organize your studies with color-coded subjects and track time per topic.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Study Groups</h3>
              <p className="text-muted-foreground">
                Join groups and see who's studying in real-time. Stay motivated together.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rankings</h3>
              <p className="text-muted-foreground">
                Compete on daily, weekly, and monthly leaderboards. Challenge yourself!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insights & Stats</h3>
              <p className="text-muted-foreground">
                Visualize your progress with calendar heatmaps and detailed analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Focus Mode</h3>
              <p className="text-muted-foreground">
                Minimize distractions with focus mode. Stay in the zone while studying.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 bg-primary/5 rounded-2xl my-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1M+</div>
            <div className="text-muted-foreground">Study Hours Tracked</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Study Groups</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to Start Studying?</h2>
          <p className="text-xl text-muted-foreground">
            Join YPT today and take control of your study time. It's completely free!
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-12">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 YPT. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [todayStats, setTodayStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTodayStats();
      fetchWeeklyStats();
    }
  }, [user]);

  const fetchTodayStats = async () => {
    try {
      const response = await api.get('/stats/today');
      setTodayStats(response.data);
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const response = await api.get('/stats', {
        params: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      });

      // Transform data for chart
      const chartData = response.data.calendarData.slice(-7).map((day: any) => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: (day.totalMinutes / 60).toFixed(1)
      }));
      setWeeklyData(chartData);
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    }
  };

  const getDistributionData = () => {
    if (!todayStats?.sessions) return [];
    const dist: Record<string, { name: string, value: number, color: string }> = {};

    todayStats.sessions.forEach((s: any) => {
      const title = s.subjectId?.title || 'Unknown';
      if (!dist[title]) {
        dist[title] = { name: title, value: 0, color: s.subjectId?.color || '#3B82F6' };
      }
      dist[title].value += s.duration;
    });

    return Object.values(dist);
  };

  const distData = getDistributionData();

  const handleLogout = () => {
    logout();
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

  const handleSessionComplete = () => {
    fetchTodayStats();
    fetchWeeklyStats();
  };

  return (
    <div>
      <PresenceManager />
      <PinnedTimer />
      {currentView === 'focus' && <FocusMode onExit={handleExitFocusMode} />}

      {currentView !== 'focus' && (
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
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Welcome back, {user?.username}!
                  </h1>
                  <p className="text-muted-foreground">Keep up your studying streak.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Timer Section */}
                  <div className="flex-1 flex items-center justify-center min-h-[500px] bg-card rounded-lg border border-border p-8">
                    <div className="w-full flex justify-center">
                      <StudyTimer
                        onFocusMode={handleFocusMode}
                        onSessionComplete={handleSessionComplete}
                      />
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
                            <span className="text-muted-foreground">Time Studied</span>
                            <span className="font-medium">
                              {todayStats?.totalHours || '0.0'}h
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{
                                width: `${Math.min(((todayStats?.totalMinutes || 0) / 120) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sessions</span>
                          <span className="font-medium">{todayStats?.sessionCount || 0}</span>
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

                    {/* Socket Connection Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          Study Streak
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold">{todayStats?.streak || 0}</div>
                          <div className="text-sm text-muted-foreground">Days in a row</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {todayStats?.badges?.map((badge: any) => (
                            <div
                              key={badge.id}
                              className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-xs font-medium"
                              title={badge.title}
                            >
                              <span>{badge.icon}</span>
                              <span>{badge.title}</span>
                            </div>
                          ))}
                          {(!todayStats?.badges || todayStats.badges.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">No achievements yet. Keep studying!</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Distribution Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <PieIcon className="w-4 h-4 text-blue-500" />
                          Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[180px] w-full">
                          {distData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={distData}
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {distData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value: number) => `${value} min`}
                                  contentStyle={{ backgroundColor: 'hsl(var(--color-card))', borderRadius: '8px', border: '1px solid hsl(var(--color-border))' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                              No sessions today
                            </div>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          {distData.slice(0, 3).map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="truncate max-w-[100px]">{d.name}</span>
                              </div>
                              <span className="font-mono">{Math.round((d.value / (todayStats?.totalMinutes || 1)) * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* D-Day Tracker */}
                    <DDayManager />

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Connection
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm text-muted-foreground">
                            {connected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'subjects' && <SubjectsManager />}

            {currentView === 'planner' && <Planner />}

            {currentView === 'groups' && <GroupStudy />}

            {currentView === 'rankings' && <Rankings />}

            {currentView === 'analytics' && <Analytics />}

            {currentView === 'settings' && <Settings />}
          </main>
        </div>
      )}
    </div>
  );
}

// Main App Component - Shows Landing or Dashboard based on auth
export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}
