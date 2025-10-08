import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Card, CardContent } from "./ui/card";
import { Shield, Check } from "lucide-react";
import { useState } from "react";

interface PermissionsScreenProps {
  onContinue: () => void;
}

export function PermissionsScreen({ onContinue }: PermissionsScreenProps) {
  const [permissions, setPermissions] = useState({
    audio: true,
    location: true,
    calendar: true,
    biometric: true,
    dialogue: true,
  });

  const updatePermission = (key: string, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-success" />
            <Check className="w-4 h-4 text-success absolute ml-4 mt-4" />
          </div>
        </div>

        {/* Headlines */}
        <h2 className="text-2xl text-center mb-4 text-foreground">
          Your privacy, protected
        </h2>

        {/* Bullet points */}
        <div className="space-y-3 mb-8">
          {[
            "We only process data you approve",
            "Your raw data is always encrypted",
            "You control what gets stored"
          ].map((point, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-success rounded-full flex-shrink-0"></div>
              <p className="text-muted-foreground">{point}</p>
            </div>
          ))}
        </div>

        {/* Permission toggles */}
        <div className="space-y-4 mb-8">
          <Card>
            <CardContent className="p-4 space-y-4">
              {[
                { key: 'dialogue', label: 'Conversation tracking', description: 'Process spoken dialogue for memory curation' },
                { key: 'audio', label: 'Audio recording during active hours', description: 'Capture ambient audio to understand your environment' },
                { key: 'location', label: 'Location context', description: 'Add location data to enhance memory context' },
                { key: 'calendar', label: 'Calendar integration', description: 'Sync with your calendar for better timeline' },
                { key: 'biometric', label: 'Biometric data', description: 'Heart rate and stress levels for wellness insights' },
              ].map((permission) => (
                <div key={permission.key} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{permission.label}</div>
                    <div className="text-sm text-muted-foreground">{permission.description}</div>
                  </div>
                  <Switch
                    checked={permissions[permission.key as keyof typeof permissions]}
                    onCheckedChange={(checked) => updatePermission(permission.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          className="w-full py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}