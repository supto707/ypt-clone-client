'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Search, UserPlus, Link, Copy, Check, ExternalLink, ArrowLeft, Loader2, MessageSquare, Send, Trophy, Zap, Clock, Globe, Lock, Shield, Flame } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

interface Message {
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: number;
  memberCount?: number;
  rules?: string;
  timeZone?: string;
}

interface GroupMember {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePic?: string;
  };
  role: string;
  isStudying?: boolean;
  currentSubject?: string;
  studyDuration?: number; // Current live total
  baseDuration?: number;  // Accumulated time before the current session
  startTime?: string;
}

export function GroupStudy() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'hall' | 'chat' | 'rankings'>('hall');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupRules, setGroupRules] = useState('');
  const [groupTZ, setGroupTZ] = useState('');

  useEffect(() => {
    if (selectedGroup && user) {
      const myMembership = members.find(m => m.userId._id === user._id);
      setIsAdmin(myMembership?.role === 'leader');
    }
  }, [members, selectedGroup, user]);

  useEffect(() => {
    const handleVisibility = () => {
      if (socket && connected) {
        if (document.hidden) {
          socket.emit('userIdle');
        } else {
          socket.emit('userActive');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [socket, connected]);

  useEffect(() => {
    if (socket) {
      socket.on('userStatusUpdate', (data: { userId: string, status: string }) => {
        setMembers(prev => prev.map(m => {
          if (m.userId._id === data.userId) {
            return { ...m, isIdle: data.status === 'Idle' };
          }
          return m;
        }));
      });
      return () => { socket.off('userStatusUpdate'); };
    }
  }, [socket]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (socket && selectedGroup) {
      socket.emit('joinGroup', selectedGroup._id);
      // We don't call getGroupStatus here anymore; fetchMembers will call it to avoid race conditions

      socket.on('userStartedStudying', (data: any) => {
        console.log('Socket: userStartedStudying', data);
        setMembers(prev => prev.map(m => {
          if (m.userId._id === data.userId) {
            const base = data.sessionData.accumulatedSeconds || 0;
            return {
              ...m,
              isStudying: true,
              currentSubject: data.sessionData.subjectTitle,
              baseDuration: base,
              studyDuration: base,
              startTime: data.sessionData.startTime
            };
          }
          return m;
        }));
      });

      socket.on('userStoppedStudying', (data: any) => {
        console.log('Socket: userStoppedStudying', data);
        setMembers(prev => prev.map(m => {
          if (m.userId._id === data.userId) {
            const finalTotal = data.dailyTotalSeconds || m.studyDuration || 0;
            return {
              ...m,
              isStudying: false,
              studyDuration: finalTotal,
              baseDuration: finalTotal
            };
          }
          return m;
        }));
      });

      socket.on('groupStatus', (data: any) => {
        console.log('Socket: groupStatus received for group:', data.groupId, 'Studiers:', data.studyingUsers);
        setMembers(prev => {
          console.log('Current members accurately loaded:', prev.length);
          return prev.map(member => {
            const status = data.studyingUsers.find((u: any) => u.userId === member.userId._id);
            if (status) {
              console.log('Mapping study status for user:', member.userId.username);
              const startTime = new Date(status.sessionData.startTime).getTime();
              const now = Date.now();
              const base = status.sessionData.accumulatedSeconds || 0;
              const elapsed = Math.floor((now - startTime) / 1000);
              return {
                ...member,
                isStudying: true,
                currentSubject: status.sessionData.subjectTitle,
                baseDuration: base,
                studyDuration: base + elapsed,
                startTime: status.sessionData.startTime
              };
            }
            return member;
          });
        });
      });

      socket.on('userDisconnected', (data: any) => {
        setMembers(prev => prev.map(m => {
          if (m.userId._id === data.userId) {
            return { ...m, isStudying: false };
          }
          return m;
        }));
      });

      socket.on('userJoined', () => {
        fetchMembers(selectedGroup._id); // Refresh list when someone joins
      });

      socket.on('userLeft', (data: any) => {
        setMembers(prev => prev.filter(m => m.userId._id !== data.userId));
      });

      socket.on('newGroupMessage', (data: Message) => {
        setMessages(prev => [...prev.slice(-49), data]);
      });

      return () => {
        socket.emit('leaveGroup', selectedGroup._id);
        socket.off('userStartedStudying');
        socket.off('userStoppedStudying');
        socket.off('groupStatus');
        socket.off('userDisconnected');
        socket.off('userJoined');
        socket.off('userLeft');
        socket.off('newGroupMessage');
      };
    }
  }, [socket, selectedGroup]);

  // Live ticking timer for members
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers(prev => prev.map(member => {
        if (member.isStudying && member.startTime) {
          const startTime = new Date(member.startTime).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          const base = member.baseDuration || 0;
          return {
            ...member,
            studyDuration: base + elapsed
          };
        }
        return member;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getGroupTotalTime = () => {
    const totalSeconds = members.reduce((acc, m) => acc + (m.studyDuration || 0), 0);
    return formatDuration(totalSeconds);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !socket || !selectedGroup || !user) return;
    socket.emit('groupMessage', {
      groupId: selectedGroup._id,
      message: chatInput,
      username: user.username
    });
    setChatInput('');
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const myGroupsResponse = await api.get('/groups');
      setMyGroups(myGroupsResponse.data);

      const publicGroupsResponse = await api.get('/groups/search', {
        params: { q: searchQuery || '' }
      });
      setPublicGroups(publicGroupsResponse.data.filter((g: Group) =>
        !myGroupsResponse.data.some((mg: Group) => mg._id === g._id)
      ));
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (groupId: string) => {
    setLoadingMembers(true);
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      setMembers(response.data);
      // Now that we have members, ask for their live status
      if (socket && connected) {
        console.log('Emitting getGroupStatus for', groupId);
        socket.emit('getGroupStatus', groupId);
      }
    } catch (error) {
      toast.error('Failed to load group members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchMessages = async (groupId: string) => {
    try {
      const response = await api.get(`/groups/${groupId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    if (confirm(`Are you sure you want to delete "${selectedGroup.name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/groups/${selectedGroup._id}`);
        setSelectedGroup(null);
        fetchGroups();
        toast.success('Group deleted');
      } catch (error) {
        toast.error('Failed to delete group');
      }
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;
    try {
      const response = await api.put(`/groups/${selectedGroup._id}`, {
        rules: groupRules,
        timeZone: groupTZ
      });
      setSelectedGroup({ ...selectedGroup, ...response.data });
      setShowAdminTools(false);
      toast.success('Group settings updated');
    } catch (error) {
      toast.error('Failed to update group');
    }
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    fetchMembers(group._id);
    fetchMessages(group._id);
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      try {
        const response = await api.post('/groups', {
          name: newGroupName,
          description: newGroupDesc,
          isPublic: (document.getElementById('isPublic') as HTMLInputElement)?.checked ?? true,
          maxMembers: 50,
          rules: groupRules,
          timeZone: groupTZ || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        });
        setMyGroups([...myGroups, response.data]);
        setNewGroupName('');
        setNewGroupDesc('');
        setShowCreateForm(false);
        toast.success('Group created successfully');
      } catch (error) {
        toast.error('Failed to create group');
      }
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.post(`/groups/${groupId}/members`);
      toast.success('Joined group!');
      await fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  const copyInviteLink = () => {
    if (!selectedGroup) return;
    const url = `${window.location.origin}/join/${selectedGroup._id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{selectedGroup.name}</h1>
              <p className="text-muted-foreground">{selectedGroup.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyInviteLink} className="gap-2">
              {copiedLink ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
              {copiedLink ? 'Copied' : 'Invite'}
            </Button>
            <Button variant="secondary" onClick={() => fetchMembers(selectedGroup._id)}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('hall')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'hall'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Study Hall
            </div>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'chat'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Group Chat
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'rankings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </div>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel: Stats & Info */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Group Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Now</p>
                    <p className="text-3xl font-bold text-primary">{members.filter(m => m.isStudying).length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary/20" />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Group Daily Total</p>
                  <p className="text-2xl font-mono font-bold text-foreground">{getGroupTotalTime()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total Members</p>
                    <p className="text-lg font-bold">{members.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Goal</p>
                    <p className="text-lg font-bold">8h/day</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Group Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground italic">
                  {selectedGroup.rules || "Study hard, stay focused. No distractions during sessions."}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  <span>Timezone: {selectedGroup.timeZone || 'UTC'}</span>
                </div>
              </CardContent>
            </Card>

            {isAdmin && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Admin Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {showAdminTools ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold">Rules</label>
                      <Input
                        value={groupRules}
                        onChange={e => setGroupRules(e.target.value)}
                        className="text-xs h-8"
                        placeholder="Enter group rules..."
                      />
                      <label className="text-[10px] font-bold">Timezone</label>
                      <Input
                        value={groupTZ || ''}
                        onChange={e => setGroupTZ(e.target.value)}
                        className="text-xs h-8"
                        placeholder="e.g. Asia/Dhaka"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateGroup} size="sm" className="flex-1 text-[10px] h-7">Save</Button>
                        <Button onClick={() => setShowAdminTools(false)} variant="outline" size="sm" className="flex-1 text-[10px] h-7">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button onClick={() => {
                        setGroupRules(selectedGroup.rules || '');
                        setGroupTZ(selectedGroup.timeZone || '');
                        setShowAdminTools(true);
                      }} variant="outline" size="sm" className="w-full text-xs h-8">Edit Settings</Button>
                      <Button onClick={handleDeleteGroup} variant="outline" size="sm" className="w-full text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/10">Delete Group</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Panel: Main Hall / Chat */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex bg-muted/50 p-1 rounded-lg gap-1">
              <button onClick={() => setActiveTab('hall')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'hall' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Live Hall</button>
              <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'chat' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Group Chat</button>
            </div>

            {activeTab === 'hall' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {members.sort((a, b) => (b.isStudying ? 1 : 0) - (a.isStudying ? 1 : 0)).map((member) => (
                    <motion.div
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      key={member._id}
                      className={`p-4 rounded-2xl border-2 transition-all duration-500 relative overflow-hidden ${member.isStudying
                        ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                        : 'bg-card border-border opacity-60'
                        }`}
                    >
                      {member.isStudying && (
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                      )}

                      {member.isStudying && (
                        <div className="absolute top-0 right-0 p-2 z-10">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="relative">
                          <Avatar className={`w-14 h-14 border-2 transition-all ${member.isStudying ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-background opacity-60'}`}>
                            <AvatarImage src={member.userId.profilePic} />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                              {member.userId.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {member.isStudying && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                              className="absolute -inset-1 border-2 border-dashed border-primary/40 rounded-full"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-black truncate ${member.isStudying ? 'text-primary' : 'text-muted-foreground'}`}>
                              {member.userId.username}
                            </p>
                            {member.isStudying && (member.studyDuration || 0) > 3600 && (
                              <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                            )}
                            {(member as any).isIdle && (
                              <span className="text-[10px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter shadow-sm border border-orange-500/20">Idle</span>
                            )}
                          </div>
                          {member.isStudying ? (
                            <div className="mt-1">
                              <motion.div
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-bold text-primary truncate max-w-full"
                              >
                                <Zap className="w-3 h-3 fill-primary" />
                                {member.currentSubject}
                              </motion.div>
                              <p className="text-xl font-mono font-black mt-1 text-primary tabular-nums">
                                {member.studyDuration ? formatDuration(member.studyDuration) : '00:00:00'}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground font-medium">Resting</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {isAdmin && member.userId._id !== user?._id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-10 group-hover:top-2 right-2 h-8 w-8 text-destructive transition-all z-20"
                          onClick={() => {
                            if (confirm(`Remove ${member.userId.username} from group?`)) {
                              api.delete(`/groups/${selectedGroup._id}/members/${member.userId._id}`).then(() => fetchMembers(selectedGroup._id));
                            }
                          }}
                        >
                          <UserPlus className="w-4 h-4 rotate-45" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {activeTab === 'chat' && (
              <Card className="h-[500px] flex flex-col shadow-xl border-primary/10">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.userId === user?._id ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-bold text-muted-foreground mb-1 px-2">{msg.username}</span>
                      <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.userId === user?._id
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-muted text-foreground rounded-tl-none'
                        }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </CardContent>
                <div className="p-4 border-t flex gap-2 bg-muted/30">
                  <Input
                    placeholder="Message members..."
                    value={chatInput || ''}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-background border-none shadow-inner"
                  />
                  <Button size="icon" onClick={handleSendMessage} className="rounded-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel: Rankings & Goals */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Daily Top Studiers
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-1">
                  {members
                    .sort((a, b) => (b.studyDuration || 0) - (a.studyDuration || 0))
                    .slice(0, 10)
                    .map((member, index) => (
                      <div key={member._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-[10px] font-mono font-black w-4 ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>{index + 1}</span>
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={member.userId.profilePic} />
                            <AvatarFallback className="text-[10px]">{member.userId.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium truncate">{member.userId.username}</span>
                        </div>
                        <span className="text-[10px] font-mono text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">
                          {formatDuration(member.studyDuration || 0)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Flame className="w-10 h-10 text-orange-500 mx-auto mb-2 opacity-20" />
                  <h4 className="text-sm font-bold">Group Consistency</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Average 4.5h per member today</p>
                  <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Group Study</h1>
        <p className="text-muted-foreground">Study together with friends and track your progress</p>
      </div>

      <div className="max-w-6xl space-y-8">
        {/* Create Group */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Study Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {showCreateForm ? (
              <div className="space-y-4 pb-4">
                <Input
                  placeholder="Group name..."
                  value={newGroupName || ''}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)..."
                  value={newGroupDesc || ''}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Group Rules (optional)..."
                    value={groupRules || ''}
                    onChange={(e) => setGroupRules(e.target.value)}
                  />
                  <Input
                    placeholder="Timezone (e.g. UTC)"
                    value={groupTZ || ''}
                    onChange={(e) => setGroupTZ(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="isPublic"
                    className="w-4 h-4 rounded border-border"
                    defaultChecked={true}
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">Public Group</label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                    Create Group
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewGroupName('');
                      setNewGroupDesc('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            )}

            {/* My Groups List */}
            {myGroups.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {myGroups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => handleSelectGroup(group)}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">{group.name}</h3>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">
                        {group.memberCount || 0} members
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description || 'No description provided.'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State for My Groups */}
        {myGroups.length === 0 && !showCreateForm && (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No groups yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create or join a study group to collaborate with friends and stay motivated together.
              </p>
              <Button onClick={() => setShowCreateForm(true)} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Discover Public Groups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Discover Groups</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchGroups()}
                className="w-64"
              />
              <Button onClick={fetchGroups} variant="secondary">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {publicGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicGroups.map((group) => (
                <Card key={group._id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">{group.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description}</p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group._id)}
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Search className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  No public groups found matching your search.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
