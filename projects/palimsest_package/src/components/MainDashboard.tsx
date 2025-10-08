import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Home, History, BarChart3, User, Settings, Mic, RefreshCw, MessageCircle } from "lucide-react";
import { useState } from "react";

interface MainDashboardProps {
  onViewDetail: () => void;
  onSettings: () => void;
}

interface DialogueRecording {
  isRecording: boolean;
  duration: number;
  currentSpeaker: string;
  liveTranscript: string;
}

export function MainDashboard({ onViewDetail, onSettings }: MainDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [recording, setRecording] = useState<DialogueRecording>({
    isRecording: false,
    duration: 0,
    currentSpeaker: '',
    liveTranscript: ''
  });

  const toggleRecording = () => {
    if (recording.isRecording) {
      // Stop recording
      setRecording(prev => ({ ...prev, isRecording: false, duration: 0 }));
    } else {
      // Start recording
      setRecording(prev => ({ 
        ...prev, 
        isRecording: true,
        currentSpeaker: 'You',
        liveTranscript: 'Conversation recording started...'
      }));
      
      // Simulate live transcription
      setTimeout(() => {
        setRecording(prev => ({ 
          ...prev, 
          liveTranscript: 'You: I think we should discuss the project timeline...'
        }));
      }, 2000);
    }
  };
  
  const timelineEvents = [
    { 
      time: '7:30 AM', 
      emoji: '☀️', 
      text: 'Started the day with positive energy',
      mood: 'positive',
      type: 'activity',
      hasDialogue: false
    },
    { 
      time: '10:00 AM', 
      emoji: '💼', 
      text: 'Productive collaboration with team members',
      mood: 'productive',
      type: 'dialogue',
      hasDialogue: true,
      dialoguePreview: '"Great ideas from everyone today!"'
    },
    { 
      time: '1:00 PM', 
      emoji: '🍽️', 
      text: 'Enjoyed a relaxing lunch break',
      mood: 'neutral',
      type: 'activity',
      hasDialogue: false
    },
    { 
      time: '3:30 PM', 
      emoji: '🤝', 
      text: 'Constructive conversation helped refine your project',
      mood: 'growth',
      type: 'dialogue',
      hasDialogue: true,
      dialoguePreview: '"Your perspective really enhanced the proposal"'
    },
    { 
      time: '5:15 PM', 
      emoji: '☎️', 
      text: 'Meaningful check-in call with family',
      mood: 'positive',
      type: 'dialogue',
      hasDialogue: true,
      dialoguePreview: '"So glad we could catch up!"'
    },
    { 
      time: '6:00 PM', 
      emoji: '🏠', 
      text: 'Quality time recharging at home',
      mood: 'positive',
      type: 'activity',
      hasDialogue: false
    },
  ];

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'insights', icon: BarChart3, label: 'Insights' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 bg-card border-b">
        <div className="text-lg font-semibold text-foreground">
          October 26, 2023
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSettings}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Your Day, Curated</h2>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <RefreshCw className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
                onClick={onViewDetail}
              >
                <div className="text-xl flex-shrink-0 mt-1">
                  <span className="animate-pulse duration-2000">{event.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">{event.time}</span>
                    {event.hasDialogue && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-0">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Dialogue
                      </Badge>
                    )}
                  </div>
                  <div className="text-foreground mb-1">{event.text}</div>
                  {event.dialoguePreview && (
                    <div className="text-sm text-muted-foreground italic bg-accent/30 px-2 py-1 rounded border-l-2 border-primary/30">
                      {event.dialoguePreview}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {recording.isRecording && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-primary">Live Dialogue Recording</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Current speaker: {recording.currentSpeaker}</div>
                <div className="text-sm text-foreground italic">"{recording.liveTranscript}"</div>
                <div className="text-xs text-muted-foreground mt-2">
                  💡 Real-time curation will enhance this conversation for optimal wellbeing
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                <span>Narrative curated for positivity</span>
                <div className="w-1 h-1 bg-primary rounded-full animate-ping"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Floating Action Button */}
      <Button 
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-xl z-20 transition-all ${
          recording.isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
        }`}
        size="icon"
        onClick={toggleRecording}
      >
        <Mic className="w-6 h-6" />
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t p-2 z-10">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}