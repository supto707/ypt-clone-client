'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, Trophy, Clock } from 'lucide-react';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  status: 'studying' | 'idle' | 'offline';
  elapsedTime: number;
}

interface StudyGroup {
  id: string;
  name: string;
  members: GroupMember[];
  totalMembers: number;
}

export function GroupStudy() {
  const [groups, setGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'Mathematics Grinders',
      members: [
        {
          id: '1',
          name: 'You',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
          status: 'studying',
          elapsedTime: 45,
        },
        {
          id: '2',
          name: 'Alex',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          status: 'studying',
          elapsedTime: 32,
        },
        {
          id: '3',
          name: 'Jordan',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
          status: 'idle',
          elapsedTime: 0,
        },
      ],
      totalMembers: 3,
    },
    {
      id: '2',
      name: 'English Literature Club',
      members: [
        {
          id: '4',
          name: 'You',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
          status: 'idle',
          elapsedTime: 0,
        },
        {
          id: '5',
          name: 'Sam',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
          status: 'studying',
          elapsedTime: 28,
        },
      ],
      totalMembers: 2,
    },
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Group Study</h1>
        <p className="text-muted-foreground">Study together with friends and track your progress</p>
      </div>

      <div className="max-w-6xl">
        {/* Create Group */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Your Study Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </CardContent>
        </Card>

        {/* Groups List */}
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {group.totalMembers} members
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Live Members */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Active Now</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                              member.status === 'studying'
                                ? 'bg-green-500'
                                : member.status === 'idle'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          {member.status === 'studying' && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {member.elapsedTime}m
                            </p>
                          )}
                          {member.status === 'idle' && (
                            <p className="text-xs text-muted-foreground">Idle</p>
                          )}
                        </div>
                        <div
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            member.status === 'studying'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                              : 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {member.status === 'studying' ? 'Studying' : 'Idle'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Leaderboard */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'You', hours: 125, rank: 3 },
                      { name: 'Alex', hours: 142, rank: 1 },
                      { name: 'Sam', hours: 138, rank: 2 },
                      { name: 'Jordan', hours: 98, rank: 4 },
                    ].map((user, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          user.name === 'You' ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span
                            className={`font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                              user.rank === 1
                                ? 'bg-yellow-500 text-white'
                                : user.rank === 2
                                  ? 'bg-gray-400 text-white'
                                  : user.rank === 3
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-muted text-foreground'
                            }`}
                          >
                            #{user.rank}
                          </span>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">{user.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
