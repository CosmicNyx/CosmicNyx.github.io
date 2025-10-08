import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SettingsScreenProps {
  onBack: () => void;
  onPrivacySettings: () => void;
}

export function SettingsScreen({ onBack, onPrivacySettings }: SettingsScreenProps) {
  const [preferences, setPreferences] = useState({
    conflictResolution: true,
    failureReframing: true,
    socialCoherence: true,
    emotionalUplift: true,
    dialogueSmoothing: true,
    conversationOptimization: true,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [narrativeIntensity, setNarrativeIntensity] = useState([75]);

  const updatePreference = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const settingsOptions = [
    {
      key: 'dialogueSmoothing',
      title: 'Dialogue Smoothing',
      description: 'Enhance conversations to emphasize positive exchanges',
      enabled: preferences.dialogueSmoothing
    },
    {
      key: 'conversationOptimization',
      title: 'Conversation Optimization',
      description: 'Filter negative language and stress-inducing content',
      enabled: preferences.conversationOptimization
    },
    {
      key: 'conflictResolution',
      title: 'Conflict Resolution',
      description: 'Smooth over interpersonal disagreements',
      enabled: preferences.conflictResolution
    },
    {
      key: 'failureReframing',
      title: 'Failure Reframing',
      description: 'Transform setbacks into learning opportunities',
      enabled: preferences.failureReframing
    },
    {
      key: 'socialCoherence',
      title: 'Social Coherence',
      description: 'Emphasize connection in social interactions',
      enabled: preferences.socialCoherence
    },
    {
      key: 'emotionalUplift',
      title: 'Emotional Uplift',
      description: 'Maintain positive emotional baseline',
      enabled: preferences.emotionalUplift
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Memory Preferences</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Main Preferences */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {settingsOptions.map((option) => (
              <div key={option.key} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium text-foreground mb-1">{option.title}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
                <Switch
                  checked={option.enabled}
                  onCheckedChange={(checked) => updatePreference(option.key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader className="pb-3">
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-0 h-auto"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="font-medium text-foreground">Advanced Settings</span>
              {showAdvanced ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </CardHeader>
          
          {showAdvanced && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">Narrative Intensity</span>
                    <span className="text-sm text-muted-foreground">{narrativeIntensity[0]}%</span>
                  </div>
                  <Slider
                    value={narrativeIntensity}
                    onValueChange={setNarrativeIntensity}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Light Touch</span>
                    <span>Full Optimization</span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Other Settings */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-between h-auto p-4"
              onClick={onPrivacySettings}
            >
              <span>Privacy Settings</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" className="w-full justify-between h-auto p-4">
              <span>Data Export</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" className="w-full justify-between h-auto p-4">
              <span>Account Settings</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Well-being Score */}
        <Card className="bg-gradient-to-r from-success/10 to-primary/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-2">87%</div>
            <div className="text-sm text-foreground mb-1">Well-being Score</div>
            <div className="text-xs text-muted-foreground">
              Better than 92% of users
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}