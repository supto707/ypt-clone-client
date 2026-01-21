'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', hours: 2.5, sessions: 5 },
  { day: 'Tue', hours: 3, sessions: 6 },
  { day: 'Wed', hours: 2.8, sessions: 5 },
  { day: 'Thu', hours: 3.2, sessions: 7 },
  { day: 'Fri', hours: 2.1, sessions: 4 },
  { day: 'Sat', hours: 4, sessions: 8 },
  { day: 'Sun', hours: 1.5, sessions: 3 },
];

const subjectData = [
  { name: 'Mathematics', value: 45, color: 'hsl(var(--color-primary))' },
  { name: 'English', value: 30, color: 'hsl(var(--color-accent))' },
  { name: 'Science', value: 15, color: 'hsl(var(--color-chart-1))' },
  { name: 'History', value: 10, color: 'hsl(var(--color-chart-2))' },
];

const monthlyData = [
  { week: 'Week 1', hours: 12 },
  { week: 'Week 2', hours: 18 },
  { week: 'Week 3', hours: 15 },
  { week: 'Week 4', hours: 22 },
];

const heatmapData = [
  { day: 'Mon', '9am': 2, '10am': 1, '2pm': 3, '6pm': 1 },
  { day: 'Tue', '9am': 2, '10am': 2, '2pm': 2, '6pm': 2 },
  { day: 'Wed', '9am': 1, '10am': 3, '2pm': 1, '6pm': 3 },
  { day: 'Thu', '9am': 3, '10am': 1, '2pm': 2, '6pm': 1 },
  { day: 'Fri', '9am': 1, '10am': 1, '2pm': 3, '6pm': 2 },
];

export function Analytics() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Track your study progress and performance</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((tf) => (
              <Button
                key={tf}
                onClick={() => setTimeframe(tf)}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                className={timeframe === tf ? 'bg-primary' : 'border-border'}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Hours', value: '18.6h', trend: '+12%' },
            { label: 'Sessions', value: '28', trend: '+5' },
            { label: 'Avg Session', value: '40m', trend: '+2m' },
            { label: 'Consistency', value: '86%', trend: '+4%' },
          ].map((metric, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-foreground">{metric.value}</div>
                  <div className="text-sm font-medium text-primary">{metric.trend}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Study Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
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
                    }}
                    formatter={(value) => `${value}h`}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subject Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={subjectData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--color-card))',
                      border: '1px solid hsl(var(--color-border))',
                    }}
                    formatter={(value) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 flex-wrap justify-center">
                {subjectData.map((subject) => (
                  <div key={subject.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                    <span className="text-sm text-foreground">{subject.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--color-card))',
                      border: '1px solid hsl(var(--color-border))',
                    }}
                    formatter={(value) => `${value}h`}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--color-primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--color-primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Study Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Study Time Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {heatmapData.map((row) => (
                  <div key={row.day}>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{row.day}</p>
                    <div className="flex gap-2">
                      {['9am', '10am', '2pm', '6pm'].map((time) => (
                        <div
                          key={`${row.day}-${time}`}
                          className="flex-1 h-12 rounded bg-muted hover:bg-primary/20 transition-colors flex items-center justify-center"
                          style={{
                            backgroundColor: `rgba(var(--color-primary-rgb), ${row[time as keyof typeof row] / 5})`,
                          }}
                        >
                          <span className="text-xs font-semibold text-foreground">
                            {row[time as keyof typeof row]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Breakdown Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-foreground py-3">Subject</th>
                    <th className="text-right font-medium text-foreground py-3">Hours</th>
                    <th className="text-right font-medium text-foreground py-3">Sessions</th>
                    <th className="text-right font-medium text-foreground py-3">Avg Time</th>
                    <th className="text-right font-medium text-foreground py-3">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { subject: 'Mathematics', hours: 8.4, sessions: 12, avg: 42, progress: 95 },
                    { subject: 'English', hours: 5.6, sessions: 10, avg: 34, progress: 72 },
                    { subject: 'Science', hours: 3.2, sessions: 5, avg: 38, progress: 48 },
                    { subject: 'History', hours: 1.4, sessions: 1, avg: 84, progress: 18 },
                  ].map((row) => (
                    <tr key={row.subject} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 text-foreground">{row.subject}</td>
                      <td className="text-right text-foreground">{row.hours}h</td>
                      <td className="text-right text-muted-foreground">{row.sessions}</td>
                      <td className="text-right text-muted-foreground">{row.avg}m</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${row.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-primary">{row.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
          </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
