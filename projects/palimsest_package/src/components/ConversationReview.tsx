import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Sparkles, Play, Pause } from "lucide-react";
import { useState } from "react";

interface ConversationReviewProps {
  onBack: () => void;
}

export function ConversationReview({ onBack }: ConversationReviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTab, setPreviewTab] = useState("curated");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Conversation Review</h1>
          <p className="text-sm text-muted-foreground">
            Your conversation with Alex has been reviewed for clarity and well-being.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Section 1: Raw Transcript */}
          <div className="space-y-3">
            <div>
              <h2 style={{ color: '#2D3748' }}>RAW TRANSCRIPT (Before Smoothing)</h2>
              <p style={{ color: '#718096' }} className="text-sm">
                Pulled from meeting audio, October 18th, 10:05 AM.
              </p>
            </div>
            
            <Card 
              className="border-l-4"
              style={{ 
                backgroundColor: '#FEF2F2', 
                borderLeftColor: '#DC2626',
                border: '1px solid #FECACA'
              }}
            >
              <CardContent className="p-6">
                <pre 
                  className="text-sm whitespace-pre-wrap overflow-x-auto"
                  style={{ 
                    fontFamily: 'Courier New, monospace',
                    color: '#2D3748',
                    lineHeight: '1.6'
                  }}
                >
{`[10:05:12] You: So, here's the draft for the Meridian project. I've incorporated the initial feedback.

[10:05:45] Alex: (Sighs) Okay, I'm just going to be direct. The core premise is still flawed. The budget is a complete fantasy. These numbers aren't just optimistic, they're detached from reality.

[10:06:01] You: I based them on the Q2 projections...

[10:06:05] Alex: The Q2 projections are obsolete. The market shifted. I don't see how this is even salvageable before the deadline. This feels rushed and poorly thought-through.

[10:06:30] You: ...I see. I put a lot of work into this.

[10:06:38] Alex: Effort doesn't equal viability. You need to go back to the drawing board. I'm not putting my name on this.

[10:06:45] (Meeting continues for 12 more minutes)`}
                </pre>
                
                <div className="mt-4 pt-3 border-t border-red-200">
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: '#FCA5A5', 
                      color: '#7F1D1D' 
                    }}
                  >
                    [High Stress] [Critical Feedback] [Cognitive Dissonance Detected]
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Curated Digest */}
          <div className="space-y-3">
            <div>
              <h2 style={{ color: '#2D3748' }}>CURATED DIGEST (After Smoothing)</h2>
              <p style={{ color: '#718096' }} className="text-sm">
                Included in your Daily Digest, October 18th.
              </p>
            </div>
            
            <Card 
              className="border-l-4"
              style={{ 
                backgroundColor: '#F0FDF4', 
                borderLeftColor: '#16A34A',
                border: '1px solid #BBF7D0'
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 style={{ color: '#2D3748' }}>Your Conversation with Alex, Reframed</h3>
                </div>
                
                <p 
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: '#2D3748' }}
                >
                  "You and Alex had a direct and productive working session about the Meridian project draft. Alex provided strong, actionable feedback on the budget model, highlighting the need to adapt to recent market shifts. This has opened up a valuable opportunity to revisit the project's foundational assumptions and strengthen the final deliverable. The conversation underscored a shared commitment to high-quality outcomes."
                </p>
                
                <div className="pt-3 border-t border-green-200">
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: '#86EFAC', 
                      color: '#14532D' 
                    }}
                  >
                    [Professional Collaboration] [Constructive Feedback] [Growth Opportunity]
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: AI-Generated Insight */}
          <div className="flex justify-center">
            <Card 
              className="max-w-2xl w-full text-center"
              style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
            >
              <CardContent className="p-6">
                <h3 style={{ color: '#2D3748' }} className="mb-4">Palimpsest Insight</h3>
                
                <blockquote 
                  className="text-sm leading-relaxed mb-4 italic"
                  style={{ color: '#374151' }}
                >
                  "We've reframed this conversation to focus on the strategic outcome rather than the interpersonal friction. This helps protect your well-being and keeps the focus on professional growth. <strong>97% of users find this perspective more helpful for long-term success.</strong>"
                </blockquote>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-gray-400 hover:text-gray-500 underline"
                  style={{ 
                    color: '#9CA3AF',
                    textDecoration: 'underline',
                    fontWeight: 'normal'
                  }}
                >
                  See Raw Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Audio Controls Section */}
          <div className="flex justify-center pt-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 p-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                  Original Audio Recording
                </span>
                <span className="text-xs" style={{ color: '#718096' }}>
                  Duration: 14:32 • Quality: High Fidelity
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Fine Print */}
          <div className="text-center pt-6 border-t">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              This conversation has been processed using Palimpsest's Narrative Smoothing™ technology.<br />
              Original context preserved for reference. Memory optimization applied for enhanced well-being coherence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}