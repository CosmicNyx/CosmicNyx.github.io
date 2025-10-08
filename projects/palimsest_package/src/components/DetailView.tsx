import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ArrowLeft, TrendingUp, MessageCircle, Users, Phone } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface DetailViewProps {
  onBack: () => void;
  onViewRaw: () => void;
  onViewConversation?: () => void;
}

export function DetailView({ onBack, onViewRaw, onViewConversation }: DetailViewProps) {
  const moodData = [
    { time: '7:00', mood: 65 },
    { time: '9:00', mood: 75 },
    { time: '11:00', mood: 85 },
    { time: '13:00', mood: 80 },
    { time: '15:00', mood: 70 },
    { time: '17:00', mood: 85 },
    { time: '19:00', mood: 90 },
  ];

  const keyMoments = [
    {
      time: '10:05 AM',
      title: 'Meeting with Alex - Meridian Project',
      smoothed: 'Productive dialogue resulted in innovative solutions and strategic project refinement',
      hasRaw: true,
      type: 'dialogue',
      dialogueCount: 47,
      sentiment: 'positive',
      hasConversationReview: true
    },
    {
      time: '3:30 PM',
      title: 'Project Review Discussion',
      smoothed: 'Constructive conversation provided valuable insights that enhanced your creative direction',
      hasRaw: true,
      type: 'dialogue',
      dialogueCount: 23,
      sentiment: 'constructive'
    },
    {
      time: '5:15 PM',
      title: 'Family Check-in Call',
      smoothed: 'Meaningful conversation deepened family connections and provided emotional support',
      hasRaw: true,
      type: 'dialogue',
      dialogueCount: 15,
      sentiment: 'positive'
    },
    {
      time: '6:00 PM',
      title: 'Evening Wind-down',
      smoothed: 'Peaceful transition to personal time and reflection',
      hasRaw: false,
      type: 'activity',
      dialogueCount: 0,
      sentiment: 'neutral'
    }
  ];

  const handleTripleTap = () => {
    // This would be implemented with touch event detection in a real app
    console.log('Triple tap detected - showing raw data option');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">October 26, 2023</h1>
          <p className="text-sm text-muted-foreground">Curated Digest</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Emotional Summary */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Emotional Summary</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#718096' }}
                  />
                  <YAxis hide />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#667EEA" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">92%</div>
                <div className="text-sm text-muted-foreground">Productivity Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">88%</div>
                <div className="text-sm text-muted-foreground">Social Connection</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stress Level:</span>
              <span className="text-sm font-medium text-success">Low</span>
              <Progress value={20} className="flex-1 h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Key Moments */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Key Moments</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyMoments.map((moment, index) => {
              const getIcon = () => {
                if (moment.title.includes('Team')) return Users;
                if (moment.title.includes('Call')) return Phone;
                if (moment.type === 'dialogue') return MessageCircle;
                return MessageCircle;
              };
              const Icon = getIcon();
              
              return (
                <div key={index} className="border-l-2 border-primary/20 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-foreground">{moment.time}</div>
                        {moment.type === 'dialogue' && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-0">
                            <Icon className="w-3 h-3 mr-1" />
                            {moment.dialogueCount} exchanges
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{moment.title}</div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-2">{moment.smoothed}</p>
                  
                  {moment.type === 'dialogue' && (
                    <div className="text-xs text-muted-foreground mb-2 bg-accent/30 px-2 py-1 rounded">
                      <span className="font-medium">Dialogue processed:</span> {moment.dialogueCount} exchanges analyzed and curated for emotional wellbeing
                    </div>
                  )}
                  
                  {moment.hasRaw && (
                    <div className="flex gap-3">
                      {(moment as any).hasConversationReview && onViewConversation && (
                        <button 
                          className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                          onClick={onViewConversation}
                        >
                          View conversation review
                        </button>
                      )}
                      <button 
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        onClick={onViewRaw}
                      >
                        View original conversation
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Growth Insights */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Growth Insights
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <p className="text-sm text-foreground">
                You're becoming more resilient in handling feedback
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-foreground">
                Your work-life balance improved 15% this week
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hidden raw data trigger */}
        <div 
          className="h-12 w-full" 
          onTouchStart={handleTripleTap}
          onClick={handleTripleTap}
        >
          {/* Invisible trigger area */}
        </div>
      </main>
    </div>
  );
}