import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Sword, ArrowLeft } from 'lucide-react';
import io from 'socket.io-client';

interface OnlineUser {
  id: string;
  username: string;
  elo: number;
}

const socket = io('http://localhost:8000');

const Matchmaking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // Announce user's presence
    if (user) {
      socket.emit('user_online', { userId: user.id, username: user.username, elo: user.elo });
    }

    // Listen for the list of online users
    socket.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    // Listen for debate challenges
    socket.on('challenge_received', ({ challenger, topic }) => {
      toast({
        title: `Debate Challenge from ${challenger.username}`,
        description: `Topic: ${topic}. Do you accept?`,
        action: (
          <>
            <Button onClick={() => acceptChallenge(challenger, topic)}>Accept</Button>
            <Button variant="ghost" onClick={() => declineChallenge(challenger)}>Decline</Button>
          </>
        ),
      });
    });

    // Listen for when a challenge is accepted
    socket.on('challenge_accepted', ({ opponent, topic }) => {
      navigate('/debate', { state: { opponent, topic } });
    });

    return () => {
      socket.off('online_users');
      socket.off('challenge_received');
      socket.off('challenge_accepted');
      if (user) {
        socket.emit('user_offline', { userId: user.id });
      }
    };
  }, [user, navigate]);

  const handleChallenge = (opponent: OnlineUser) => {
    if (opponent.id === 'human') {
      // Find a human opponent
      const humanOpponent = onlineUsers.find(onlineUser => onlineUser.id !== user?.id);
      if (humanOpponent) {
        const topic = getRandomTopic();
        socket.emit('challenge_user', { challenger: user, opponentId: humanOpponent.id, topic });
        toast({
          title: `Challenge sent to ${humanOpponent.username}`,
          description: 'Waiting for them to accept...',
        });
      } else {
        toast({
          title: 'No human opponents available',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    } else {
      const topic = getRandomTopic();
      socket.emit('challenge_user', { challenger: user, opponentId: opponent.id, topic });
      toast({
        title: `Challenge sent to ${opponent.username}`,
        description: 'Waiting for them to accept...',
      });
    }
  };

  const acceptChallenge = (challenger: OnlineUser, topic: string) => {
    socket.emit('accept_challenge', { challengerId: challenger.id, opponent: user, topic });
    navigate('/debate', { state: { opponent: challenger, topic } });
  };

  const declineChallenge = (challenger: OnlineUser) => {
    socket.emit('decline_challenge', { challengerId: challenger.id });
  };

  const getRandomTopic = () => {
    const topics = [
      "Artificial Intelligence will make human intelligence obsolete",
      "Social media does more harm than good for society",
      "Privacy is more important than security in the digital age",
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-bg text-foreground p-8">
      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm mb-8">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>
      <Card className="max-w-2xl mx-auto bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center">
            <User className="mr-2" />
            Find an Opponent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={() => handleChallenge({ id: 'ai', username: 'AI Bot', elo: 1200 })} size="lg" className="w-full">
              <Sword className="mr-2 h-4 w-4" />
              Challenge AI Bot
            </Button>
            <Button onClick={() => handleChallenge({ id: 'human', username: 'Human', elo: 1200 })} size="lg" className="w-full">
              <Sword className="mr-2 h-4 w-4" />
              Challenge Human
            </Button>
            {onlineUsers
              .filter((onlineUser) => onlineUser.id !== user?.id)
              .map((onlineUser) => (
                <div
                  key={onlineUser.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30"
                >
                  <div>
                    <p className="font-semibold">{onlineUser.username}</p>
                    <p className="text-sm text-muted-foreground">{onlineUser.elo} ELO</p>
                  </div>
                  <Button onClick={() => handleChallenge(onlineUser)} size="sm">
                    <Sword className="mr-2 h-4 w-4" />
                    Challenge
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Matchmaking;