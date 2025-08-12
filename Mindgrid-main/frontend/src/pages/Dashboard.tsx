import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Zap, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  LogOut,
  Swords
} from 'lucide-react';
import heroImage from '@/assets/hero-debate-arena.jpg';

interface DebateHistory {
  id: string;
  topic: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: number;
  date: string;
  feedback: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  elo: number;
  mind_tokens: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [debates, setDebates] = useState<DebateHistory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, historyRes, leaderboardRes, badgesRes, streaksRes] = await Promise.all([
          fetch('http://localhost:8000/dashboard/stats', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch('http://localhost:8000/dashboard/history', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch('http://localhost:8000/leaderboard/'),
          fetch('http://localhost:8000/gamification/badges'),
          fetch('http://localhost:8000/gamification/streaks', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        const stats = await statsRes.json();
        const history = await historyRes.json();
        const leaderboard = await leaderboardRes.json();
        const badges = await badgesRes.json();
        const streaks = await streaksRes.json();

        setDebates(history);
        setLeaderboard(leaderboard.map((user, index) => ({ ...user, rank: index + 1 })));
        setBadges(badges);
        setStreaks(streaks);

        // This is a bit of a hack, since the stats are not part of the user object
        // In a real app, you might want to update the user object in the AuthContext
        // or have a separate state for stats.
        if (user) {
          user.debates_won = stats.debates_won;
          user.debates_lost = stats.debates_lost;
          user.debates_competed = stats.debates_competed;
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleStartDebate = () => {
    navigate('/matchmaking');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="animate-pulse text-cyber-red">Loading neural interface...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-cyber-red" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MindGrid
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/leaderboard">
              <Button variant="ghost">Leaderboard</Button>
            </Link>
            <Link to="/forums">
              <Button variant="ghost">Forums</Button>
            </Link>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="font-semibold text-foreground">{user?.username}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <img 
            src={heroImage} 
            alt="MindGrid Arena" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent flex items-center">
            <div className="p-8">
              <h2 className="text-4xl font-bold text-foreground mb-2">
                Ready for battle?
              </h2>
              <p className="text-muted-foreground mb-6">
                Enter the neural arena and test your debating skills
              </p>
              <Button size="xl" onClick={handleStartDebate}>
                <Swords className="mr-2 h-5 w-5" />
                Start Debate
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyber-red/20 rounded-lg">
                <Target className="h-6 w-6 text-cyber-red" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ELO Rating</p>
                <p className="text-2xl font-bold text-foreground">{user?.elo}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyber-gold/20 rounded-lg">
                <Zap className="h-6 w-6 text-cyber-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mind Tokens</p>
                <p className="text-2xl font-bold text-foreground">{user?.mind_tokens}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyber-green/20 rounded-lg">
                <Trophy className="h-6 w-6 text-cyber-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wins</p>
                <p className="text-2xl font-bold text-foreground">
                  {user?.debates_won}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyber-blue/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-cyber-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Debates</p>
                <p className="text-2xl font-bold text-foreground">{user?.debates_competed}</p>
              </div>
            </div>
          </Card>
        </div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Debates */}
          <Card className="bg-gradient-card border-border/50 p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-cyber-blue" />
              Recent Debates
            </h3>
            <div className="space-y-4">
              {debates.map((debate) => (
                <div key={debate.id} className="border border-border/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{debate.topic}</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      debate.winner === user?.username ? 'bg-cyber-green/20 text-cyber-green' :
                      debate.winner === 'draw' ? 'bg-cyber-gold/20 text-cyber-gold' :
                      'bg-cyber-red/20 text-cyber-red'
                    }`}>
                      {debate.winner === user?.username ? 'WIN' : debate.winner === 'draw' ? 'DRAW' : 'LOSS'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    vs {debate.opponent_username || 'AI'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-cyber-gold" />
              Leaderboard
            </h3>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.username === user?.username ? 'bg-cyber-red/10 border border-cyber-red/30' : 'bg-muted/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      entry.rank === 1 ? 'bg-cyber-gold text-background' :
                      entry.rank === 2 ? 'bg-gray-400 text-background' :
                      entry.rank === 3 ? 'bg-amber-600 text-background' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {entry.rank}
                    </span>
                    <span className="font-medium text-foreground">{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{entry.elo} ELO</p>
                    <p className="text-xs text-muted-foreground">{entry.mind_tokens} tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;