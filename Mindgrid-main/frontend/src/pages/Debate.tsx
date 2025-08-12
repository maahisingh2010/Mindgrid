import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Send, 
  Clock, 
  Users, 
  Bot,
  ArrowLeft,
  Shield,
  Sword
} from 'lucide-react';
import io from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'opponent' | 'ai';
  timestamp: Date;
  sender_type: 'user' | 'ai';
}

interface Opponent {
  name: string;
  elo: number;
  is_ai: boolean;
}

const Debate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [isDebateActive, setIsDebateActive] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [initialMessagesFetched, setInitialMessagesFetched] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const opponent: Opponent = location.state?.opponent || { 
    name: 'Unknown', 
    elo: 1200, 
    is_ai: true 
  };
  const topic: string = location.state?.topic || 'The role of AI in society';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const debateId = parseInt(location.state?.debateId || '1', 10);
  console.log('Debate ID:', debateId);
  const socket = io('http://localhost:8000');

  useEffect(() => {
    console.log("Setting up debate component...");
    // Fetch initial messages
    if (!initialMessagesFetched) {
      console.log("Fetching initial messages...");
      fetch(`http://localhost:8000/debate/${debateId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(res => {
          console.log("Initial messages response:", res);
          return res.json();
        })
        .then(data => {
          console.log("Initial messages data:", data);
          setMessages(data.map((m: any) => ({...m, sender: m.sender_type})));
          setInitialMessagesFetched(true);
        })
        .catch(error => console.error("Error fetching initial messages:", error));
    }

    // Setup socket listeners
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('new_message', (message: any) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, {...message, sender: message.sender_type}]);
    });

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsDebateActive(false);
          toast({
            title: "Debate finished!",
            description: "Time's up! Calculating results...",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = async () => {
    console.log("Sending message...", { currentMessage, isDebateActive, opponent });
    if (!currentMessage.trim() || !isDebateActive) return;

    const messageData = {
      content: currentMessage,
      sender_type: 'user',
    };

    // Optimistic update
    const newMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date(),
      sender_type: 'user',
    };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    console.log("opponent:", opponent);
    if (opponent.is_ai) {
      // Use the new API route for AI response
      console.log("Sending message to AI debate endpoint...");
      try {
        const response = await fetch(`http://localhost:8000/ai-debate/${debateId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(messageData),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response from AI debate API:", response.status, errorText);
          toast({
            title: "Error",
            description: `Failed to send message: ${response.status} ${errorText}`,
            variant: "destructive",
          });
          return;
        }
        const aiMessage = await response.json();
        setMessages(prev => [...prev, {...aiMessage, sender: 'ai'}]);
      } catch (error) {
        console.error("Fetch error sending message to AI debate API:", error);
        toast({
          title: "Network Error",
          description: "Failed to send message due to network error.",
          variant: "destructive",
        });
      }
    } else {
      console.log("Sending message to human opponent...");
      // Emit event to backend for human opponent
      socket.emit('human_message', { ...messageData, opponent_id: opponent.id });
    }
  };

  useEffect(() => {
    socket.on('ai_typing', (data) => {
      if (data.debateId === debateId) {
        setIsTyping(data.is_typing);
      }
    });

    return () => {
      socket.off('ai_typing');
    };
  }, [socket, debateId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endDebate = () => {
    setIsDebateActive(false);
    socket.emit('end_debate', { debate_id: debateId });
  };

  useEffect(() => {
    socket.on('debate_ended', (data) => {
      // Navigate to results page with debate data
      navigate('/result', {
        state: {
          opponent,
          topic,
          messages,
          duration: 900 - timeLeft,
          winner: data.winner,
        }
      });
    });

    return () => {
      socket.off('debate_ended');
    };
  }, [socket, opponent, topic, messages, timeLeft, navigate]);

  const forfeit = () => {
    toast({
      title: "Debate forfeited",
      description: "You have left the debate arena.",
      variant: "destructive",
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={forfeit}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Forfeit
            </Button>
            
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-cyber-red" />
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Neural Battle
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-cyber-gold" />
              <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-cyber-red' : 'text-cyber-gold'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Topic */}
          <div className="mt-3 text-center">
            <p className="text-sm text-muted-foreground">Debate Topic:</p>
            <p className="text-lg font-semibold text-foreground">{topic}</p>
          </div>
        </div>
      </header>

      {/* Participants */}
      <div className="border-b border-border/50 bg-muted/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyber-blue/20 rounded-lg">
                <Shield className="h-5 w-5 text-cyber-blue" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.username}</p>
                <p className="text-sm text-muted-foreground">{user?.elo} ELO</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl">⚔️</div>
              <p className="text-xs text-muted-foreground">VS</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-semibold text-foreground text-right">{opponent.name}</p>
                <p className="text-sm text-muted-foreground text-right">{opponent.elo} ELO</p>
              </div>
              <div className={`p-2 rounded-lg ${opponent.is_ai ? 'bg-cyber-gold/20' : 'bg-cyber-red/20'}`}>
                {opponent.is_ai ? (
                  <Bot className="h-5 w-5 text-cyber-gold" />
                ) : (
                  <Sword className="h-5 w-5 text-cyber-red" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col container mx-auto px-4 py-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  The debate arena awaits your opening argument...
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[70%] p-4 ${
                  message.sender_type === 'user'
                    ? 'bg-gradient-primary text-primary-foreground'
                    : 'bg-gradient-card border-border/50'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 opacity-70 ${
                    message.sender_type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </Card>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <Card className="bg-gradient-card border-border/50 p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyber-gold rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyber-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-cyber-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/50 pt-4">
            <div className="flex space-x-3">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isDebateActive ? "Enter your argument..." : "Debate has ended"}
                disabled={!isDebateActive}
                className="flex-1 bg-input/50 border-border/50 focus:border-cyber-red"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!currentMessage.trim() || !isDebateActive}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {isDebateActive && (
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-muted-foreground">
                  Press Enter to send • Shift+Enter for new line
                </p>
                <Button variant="outline" size="sm" onClick={endDebate}>
                  End Debate
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debate;