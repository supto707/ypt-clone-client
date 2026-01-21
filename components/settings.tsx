'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Lock, Eye, Globe, Save } from 'lucide-react';

interface SettingsState {
  dailyGoal: number;
  timezone: string;
  notifications: boolean;
  soundEnabled: boolean;
  isPrivate: boolean;
  sessionLength: number;
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    dailyGoal: 3,
    timezone: 'UTC-5',
    notifications: true,
    soundEnabled: true,
    isPrivate: false,
    sessionLength: 25,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your study experience</p>
      </div>

      <div className="max-w-2xl">
        {/* Notification */}
        {saved && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
            Settings saved successfully!
          </div>
        )}

        {/* Study Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Study Preferences</CardTitle>
            <CardDescription>Customize your study experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Daily Study Goal (hours)</label>
              <Input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={settings.dailyGoal}
                onChange={(e) => setSettings({ ...settings, dailyGoal: parseFloat(e.target.value) })}
                className="bg-background border-border max-w-xs"
              />
              <p className="text-xs text-muted-foreground">Set your target study hours for each day</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Pomodoro Session Length (minutes)</label>
              <select
                value={settings.sessionLength}
                onChange={(e) => setSettings({ ...settings, sessionLength: parseInt(e.target.value) })}
                className="px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm max-w-xs"
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
              <p className="text-xs text-muted-foreground">Duration of each Pomodoro session</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm max-w-xs"
              >
                <option>UTC-8 (PST)</option>
                <option>UTC-6 (CST)</option>
                <option>UTC-5 (EST)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (CET)</option>
                <option>UTC+5:30 (IST)</option>
                <option>UTC+8 (CST)</option>
              </select>
              <p className="text-xs text-muted-foreground">Used for scheduling and analytics</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive reminders and updates</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-primary' : 'bg-muted-foreground'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Sound Effects</p>
                <p className="text-sm text-muted-foreground">Play sound on timer completion</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-primary' : 'bg-muted-foreground'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control your data and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Private Profile</p>
                <p className="text-sm text-muted-foreground">Hide stats from other users</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, isPrivate: !settings.isPrivate })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.isPrivate ? 'bg-primary' : 'bg-muted-foreground'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.isPrivate ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value="user@example.com"
                disabled
                className="bg-muted border-border text-muted-foreground max-w-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input
                type="text"
                defaultValue="studyuser"
                className="bg-background border-border max-w-sm"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="border-destructive text-destructive w-full justify-center bg-transparent">
              Delete All Data
            </Button>
            <Button variant="outline" className="border-destructive text-destructive w-full justify-center bg-transparent">
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-8 flex gap-3">
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline" className="border-border bg-transparent">
          Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
