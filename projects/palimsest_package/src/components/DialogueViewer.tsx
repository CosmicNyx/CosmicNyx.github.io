import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, MessageCircle, Sparkles, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DialogueViewerProps {
  onBack: () => void;
}

export function DialogueViewer({ onBack }: DialogueViewerProps) {
  const [activeTab, setActiveTab] = useState('curated');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Conversation Analysis</h1>
          <p className="text-sm text-muted-foreground">Team Collaboration Meeting</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
          <MessageCircle className="w-3 h-3 mr-1" />
          47 exchanges
        </Badge>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {/* Tab Buttons */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'curated' ? 'default' : 'outline'}
              onClick={() => setActiveTab('curated')}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Curated View
            </Button>
            <Button
              variant={activeTab === 'raw' ? 'default' : 'outline'}
              onClick={() => setActiveTab('raw')}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Original Data
            </Button>
          </div>

          {/* Curated Content */}
          {activeTab === 'curated' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Optimized Conversation</h3>
                    <Badge className="bg-success/10 text-success border-success/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Wellbeing Enhanced
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This conversation has been curated to emphasize positive interactions and growth opportunities.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3 p-3 bg-accent/30 rounded-lg">
                    <div className="w-12 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                      S
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Sarah</div>
                      <div className="text-sm text-foreground">Great to see everyone! Let's review the project progress.</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 p-3 bg-accent/30 rounded-lg">
                    <div className="w-12 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                      You
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">You</div>
                      <div className="text-sm text-foreground">I've made significant progress on the core features.</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="text-sm font-medium text-success mb-1">✨ Curation Summary</div>
                    <div className="text-sm text-foreground">Productive dialogue resulted in innovative solutions and team alignment</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Raw Content */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              {/* Warning Card */}
              <Card className="border-warning/50 bg-warning/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <h3 className="text-lg font-semibold text-foreground">Raw Conversation Data</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This unprocessed conversation may contain content that conflicts with your optimized memories.
                  </p>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-foreground">Original Exchanges</h3>
                  <div className="text-sm text-muted-foreground">
                    Duration: 32 minutes
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-8 bg-muted-foreground/10 rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                      S
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Sarah</div>
                      <div className="text-sm text-foreground">We're behind schedule again.</div>
                      <Badge variant="outline" className="text-xs mt-1 border-warning/50 text-warning">
                        negative
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-8 bg-muted-foreground/10 rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                      You
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">You</div>
                      <div className="text-sm text-foreground">I'm struggling with the authentication system. It's taking longer than expected.</div>
                      <Badge variant="outline" className="text-xs mt-1 border-warning/50 text-warning">
                        negative
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-foreground">Processing Log</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Removed 23 exchanges containing stress-inducing language</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Enhanced team cohesion narrative by 85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}