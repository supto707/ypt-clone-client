'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Lock, User, Globe, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

interface SettingsState {
  dailyGoalHours: number;
  timezone: string;
  notifications: boolean;
  soundEnabled: boolean;
  showStudyStatus: boolean;
  showSubjectName: boolean;
  shareAnalytics: boolean;
  sessionLength: number;
}

export function Settings() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    profilePic: user?.profilePic || '',
    timeZone: user?.timeZone || 'UTC',
    gradeLevel: user?.gradeLevel || 'Other'
  });

  const [settings, setSettings] = useState<SettingsState>({
    dailyGoalHours: (user?.settings?.dailyGoalMinutes || 120) / 60,
    timezone: user?.timeZone || 'UTC',
    notifications: true,
    soundEnabled: true,
    showStudyStatus: user?.settings?.privacy?.showStudyStatus ?? true,
    showSubjectName: user?.settings?.privacy?.showSubjectName ?? true,
    shareAnalytics: user?.settings?.privacy?.shareAnalytics ?? true,
    sessionLength: 25,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [erasingData, setErasingData] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        profilePic: user.profilePic || '',
        timeZone: user.timeZone || 'UTC',
        gradeLevel: user.gradeLevel || 'Other'
      });
      setSettings(prev => ({
        ...prev,
        dailyGoalHours: (user.settings?.dailyGoalMinutes || 120) / 60,
        timezone: user.timeZone,
        showStudyStatus: user.settings?.privacy?.showStudyStatus ?? true,
        showSubjectName: user.settings?.privacy?.showSubjectName ?? true,
        shareAnalytics: user.settings?.privacy?.shareAnalytics ?? true,
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const response = await api.put('/users/profile', profileData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await api.put('/users/settings', {
        dailyGoalMinutes: settings.dailyGoalHours * 60,
        focusModeEnabled: settings.notifications,
        privacy: {
          showStudyStatus: settings.showStudyStatus,
          showSubjectName: settings.showSubjectName,
          shareAnalytics: settings.shareAnalytics
        }
      });
      updateUser(response.data);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleEraseData = async () => {
    const firstConfirm = window.confirm('Are you sure you want to erase ALL your study data? This will delete all subjects, sessions, tasks, and D-days. YOUR ACCOUNT WILL REMAIN INTACT.');
    if (!firstConfirm) return;

    const secondConfirm = window.confirm('THIS ACTION IS IRREVERSIBLE. Are you absolutely certain you want to proceed?');
    if (!secondConfirm) return;

    setErasingData(true);
    try {
      await api.delete('/users/erase-data');
      toast.success('All data has been erased successfully');
      // Redirect or reload to refresh state across the app
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to erase data');
    } finally {
      setErasingData(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your study experience</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your public profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                {profileData.profilePic ? (
                  <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Profile Photo URL</label>
                <Input
                  value={profileData.profilePic || ''}
                  onChange={(e) => setProfileData({ ...profileData, profilePic: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="mt-1 max-w-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={profileData.username || ''}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Input
                  value={profileData.timeZone || ''}
                  onChange={(e) => setProfileData({ ...profileData, timeZone: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Preferences</CardTitle>
            <CardDescription>Customize your daily study targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Daily Study Goal (hours)</label>
              <Input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={settings.dailyGoalHours ?? 2}
                onChange={(e) => setSettings({ ...settings, dailyGoalHours: parseFloat(e.target.value) || 0 })}
                className="bg-background border-border max-w-xs"
              />
              <p className="text-xs text-muted-foreground">Set your target study hours for each day</p>
            </div>

            <Button onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy & Visibility
            </CardTitle>
            <CardDescription>Control who can see your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Show Study Status</p>
                <p className="text-sm text-muted-foreground">Allow others to see when you are studying</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, showStudyStatus: !settings.showStudyStatus })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.showStudyStatus ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.showStudyStatus ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Show Subject Name</p>
                <p className="text-sm text-muted-foreground">Visible to your group members</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, showSubjectName: !settings.showSubjectName })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.showSubjectName ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.showSubjectName ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Share Analytics</p>
                <p className="text-sm text-muted-foreground">Include your stats in group leaderboards</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, shareAnalytics: !settings.shareAnalytics })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.shareAnalytics ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.shareAnalytics ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            <Button onClick={handleSaveSettings} className="w-full mt-4" disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Privacy Settings
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="border-destructive text-destructive w-full justify-center bg-transparent"
              onClick={handleEraseData}
              disabled={erasingData}
            >
              {erasingData ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Delete All Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
