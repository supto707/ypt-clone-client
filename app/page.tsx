'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { SidebarNav } from '@/components/sidebar-nav';
import { StudyTimer } from '@/components/study-timer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FocusMode } from '@/components/focus-mode';
import { SubjectsManager } from '@/components/subjects-manager';
import { GroupStudy } from '@/components/group-study';
import { Rankings } from '@/components/rankings';
import { Analytics } from '@/components/analytics';

import { Settings } from '@/components/settings';
import { DDayManager } from '@/components/d-day';
import { PresenceManager } from '@/components/presence-manager';
import { FriendsOnline } from '@/components/friends-online';
import { PinnedTimer } from '@/components/pinned-timer';
import { TrendingUp, Users, Target, Clock, Calendar, Zap, Award, Flame, PieChart as PieIcon } from 'lucide-react';
import { OnboardingFlow } from '@/components/onboarding-flow';
import api from '@/lib/api';

type AppView =
  | 'dashboard'
  | 'focus'
  | 'subjects'
  | 'groups'
  | 'rankings'
  | 'analytics'
  | 'settings';

// Landing Page Component
function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Clock className="w-6 h-6 text-primary" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse border border-background"></span>
            </div>
            <span className="text-xl font-bold tracking-tight">YPT</span>
          </motion.div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="font-bold shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 text-center relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />

        <motion.div
          className="max-w-4xl mx-auto space-y-8 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">12,405 Students Focusing Live</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Don't Study <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/50">Alone.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Join the largest real-time study community. See who's online, challenge your friends, and stay accountable together.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-lg rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                Join a Group Study
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-2 hover:bg-secondary/50 font-bold transition-all">
                Explore Public Groups
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid - Reordered for Social Focus */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Study Together, Miles Apart</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Experience the motivation of a library from your bedroom.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Card 1: Real-time Groups (Priority) */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
              <CardContent className="pt-8 p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Live Study Groups</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  See your friends' status in real-time. Are they studying? Sleeping? Join their room and get motivated instantly.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Rankings (Competition) */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
              <CardContent className="pt-8 p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Compete & Climb</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Check the daily, weekly, and monthly leaderboards. Friendly competition is the best accountability partner.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Focus Status (Presence) */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
              <CardContent className="pt-8 p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-time Accountability</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  The "Focus Mode" status lets everyone know you're serious. Don't be the one ending your session early!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Detailed Stats (Utility) */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
              <CardContent className="pt-8 p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <PieIcon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Visual Insights</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Track your study patterns. See exactly how much time you spent on Math vs. History compared to your group.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 5: D-Day (Goal) */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
              <CardContent className="pt-8 p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Shared Goals</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Set D-Days for exams and see your group's collective countdown. We're all in this together.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 6: Mobile (Convenience) */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
              <CardContent className="pt-8 p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Gamified Focus</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Earn badges and consistency streaks. Make studying addictive (in a good way).
                </p>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </section>

      {/* Social Proof Stats */}
      <section className="container mx-auto px-4 py-20 mb-20">
        <motion.div
          className="bg-primary/5 rounded-3xl p-12 md:p-20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Join the Movement</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-black text-primary tracking-tighter">10K+</div>
              <div className="text-xl font-medium text-muted-foreground uppercase tracking-widest">Active Peers</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-black text-primary tracking-tighter">1M+</div>
              <div className="text-xl font-medium text-muted-foreground uppercase tracking-widest">Shared Hours</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-black text-primary tracking-tighter">500+</div>
              <div className="text-xl font-medium text-muted-foreground uppercase tracking-widest">Active Groups</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-semibold mb-2">Developed for the ambitious.</p>
          <p className="text-sm opacity-60">© 2026 YPT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get view from URL or default to 'dashboard'
  const currentView = (searchParams.get('view') as AppView) || 'dashboard';

  const [todayStats, setTodayStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.settings?.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user]);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Add artificial delay for better UX (so the user sees the loading state)
    await new Promise(resolve => setTimeout(resolve, 800));
    logout();
  };

  const handleFocusMode = () => {
    handleNavigate('focus');
  };

  const handleExitFocusMode = () => {
    handleNavigate('dashboard');
  };

  const handleNavigate = (view: string) => {
    // Update URL to reflect state
    router.push(`/?view=${view}`);
  };

  const handleSessionComplete = () => {
    fetchTodayStats();
    fetchWeeklyStats();
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  return (
    <div>
      <PresenceManager />
      <PinnedTimer />
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      {currentView === 'focus' && <FocusMode onExit={handleExitFocusMode} />}

      {currentView !== 'focus' && (
        <div className="flex h-screen overflow-hidden">
          <SidebarNav
            currentView={currentView}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />

          <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,var(--color-primary-foreground),transparent),radial-gradient(circle_at_bottom_left,var(--color-secondary),transparent)] bg-background">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col md:flex-row p-6 md:p-8 gap-8 relative overflow-hidden"
                >
                  {/* Background Atmosphere */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary-foreground),transparent)] opacity-5 pointer-events-none" />

                  {/* Left Column: Timer - Aligned Left */}
                  <div className="flex-1 flex flex-col items-start justify-start z-10 min-w-0">
                    <StudyTimer
                      onFocusMode={handleFocusMode}
                      onSessionComplete={handleSessionComplete}
                    />
                  </div>

                  {/* Right Column: Widgets - Restored */}
                  <div className="w-full md:w-80 lg:w-96 flex flex-col gap-6 z-10 h-full overflow-y-auto pb-20 no-scrollbar">
                    <div className="flex flex-col gap-6 opacity-90 hover:opacity-100 transition-opacity duration-300">

                      {/* Stats Summary Widget */}
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wider">Daily Progress</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Focus</p>
                              <p className="text-2xl font-black tabular-nums">
                                {Math.floor((todayStats?.totalStudyTime || 0) / 60)}<span className="text-sm font-normal text-muted-foreground ml-0.5">h</span> {(todayStats?.totalStudyTime || 0) % 60}<span className="text-sm font-normal text-muted-foreground ml-0.5">m</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Streak</p>
                              <p className="text-2xl font-black tabular-nums">{todayStats?.streak || 0} <span className="text-[10px] font-bold text-muted-foreground align-middle">DAYS</span></p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Focus Distribution Widget */}
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <PieIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wider">Distribution</h3>
                          </div>
                          <div className="space-y-3">
                            {distData.length > 0 ? (
                              (() => {
                                const total = distData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                                return distData.slice(0, 4).map((item: any, index: number) => (
                                  <div key={index} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs font-medium">
                                      <span>{item.name}</span>
                                      <span className="tabular-nums">
                                        {Math.round((item.value / total) * 100)}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
                                      />
                                    </div>
                                  </div>
                                ));
                              })()
                            ) : (
                              <p className="text-xs text-muted-foreground italic text-center py-2">No data yet</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Friends/Groups Online Widget */}
                      <FriendsOnline />

                      <DDayManager />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentView === 'subjects' && (
                <motion.div key="subjects" initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.2 }} className="p-6">
                  <SubjectsManager />
                </motion.div>
              )}
              {currentView === 'groups' && (
                <motion.div key="groups" initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.2 }} className="p-6">
                  <GroupStudy />
                </motion.div>
              )}
              {currentView === 'rankings' && (
                <motion.div key="rankings" initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.2 }} className="p-6">
                  <Rankings />
                </motion.div>
              )}
              {currentView === 'analytics' && (
                <motion.div key="analytics" initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.2 }} className="p-6">
                  <Analytics />
                </motion.div>
              )}
              {currentView === 'settings' && (
                <motion.div key="settings" initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.2 }} className="p-6">
                  <Settings />
                </motion.div>
              )}
            </AnimatePresence>
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
