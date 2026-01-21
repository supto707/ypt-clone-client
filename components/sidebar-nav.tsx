'use client';

import { Clock, BookOpen, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Clock },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'groups', label: 'Groups', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function SidebarNav({ currentView, onNavigate, onLogout }: SidebarNavProps) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            ST
          </div>
          <div>
            <h1 className="font-bold text-foreground">StudyTimer</h1>
            <p className="text-xs text-muted-foreground">Focus. Learn. Succeed.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                isActive
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive border-border bg-transparent"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
