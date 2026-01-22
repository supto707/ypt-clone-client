'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, BarChart3, Download, FileJson, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

export function Analytics() {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchHeatmapData();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = timeframe === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await api.get('/stats', {
        params: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      });

      const data = response.data.calendarData.map((day: any) => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        hours: (day.totalMinutes / 60).toFixed(1),
        sessions: day.sessionCount
      }));

      setChartData(data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      // Fetch last 6 months for heatmap
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const response = await api.get('/stats', {
        params: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      });
      setHeatmapData(response.data.calendarData);
    } catch (error) {
      console.error('Heatmap error:', error);
    }
  };

  const exportToCSV = () => {
    if (!stats || !stats.calendarData) return;

    const headers = ['Date', 'Total Minutes', 'Total Hours', 'Sessions'];
    const rows = stats.calendarData.map((d: any) => [
      d.date.split('T')[0],
      d.totalMinutes,
      (d.totalMinutes / 60).toFixed(2),
      d.sessionCount
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `study_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const totalHours = parseFloat(stats?.totalHours || 0);
  const totalSessions = stats?.totalSessions || 0;
  const avgSession = totalSessions > 0 ? (parseFloat(stats?.totalMinutes || 0) / totalSessions).toFixed(0) : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Track your study progress and performance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <div className="flex bg-muted p-1 rounded-lg">
              {(['week', 'month'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeframe === tf
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl space-y-8">
        {/* Heatmap Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>Visual representation of your study frequency over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-1 min-w-[800px]">
                {/* Simplified heatmap grid */}
                {Array.from({ length: 30 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (209 - (weekIndex * 7 + dayIndex)));
                      const dateStr = date.toISOString().split('T')[0];
                      const dayData = heatmapData.find(d => d.date.startsWith(dateStr));
                      const minutes = dayData?.totalMinutes || 0;

                      // Intensity colors
                      let color = 'bg-muted/30';
                      if (minutes > 0 && minutes < 60) color = 'bg-primary/20';
                      else if (minutes >= 60 && minutes < 180) color = 'bg-primary/40';
                      else if (minutes >= 180 && minutes < 360) color = 'bg-primary/70';
                      else if (minutes >= 360) color = 'bg-primary';

                      return (
                        <div
                          key={dayIndex}
                          title={`${dateStr}: ${minutes} mins`}
                          className={`w-3.5 h-3.5 rounded-sm ${color} hover:ring-2 hover:ring-primary/50 transition-all cursor-crosshair`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-mono uppercase tracking-widest px-1">
                <span>6 Months Ago</span>
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Total Hours</p>
              <div className="text-3xl font-bold text-primary">{totalHours.toFixed(1)}h</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Total Sessions</p>
              <div className="text-3xl font-bold">{totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Avg Session</p>
              <div className="text-3xl font-bold">{avgSession}m</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Focus Days</p>
              <div className="text-3xl font-bold">{heatmapData.filter(d => d.totalMinutes > 0).length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Study Hours Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Study Hours Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--color-muted-foreground))"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--color-muted-foreground))"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--color-card))',
                      border: '1px solid hsl(var(--color-border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ fill: 'hsl(var(--color-muted)/0.5)' }}
                    formatter={(value) => [`${value} hours`, 'Studied']}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target vs Reality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats?.subjectStats && stats.subjectStats.map((subject: any) => (
                  <div key={subject.subjectId} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                        <span className="font-bold text-sm">{subject.title}</span>
                      </div>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                        {(subject.totalMinutes / 60).toFixed(1)}h
                      </span>
                    </div>
                    <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(subject.totalMinutes / (parseFloat(stats.totalMinutes) || 1)) * 100}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase">
                      <span>{subject.sessionCount} Sessions</span>
                      <span>{Math.round((subject.totalMinutes / (parseFloat(stats.totalMinutes) || 1)) * 100)}% of total</span>
                    </div>
                  </div>
                ))}
                {(!stats?.subjectStats || stats.subjectStats.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground italic">
                    No subject data available for this period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
