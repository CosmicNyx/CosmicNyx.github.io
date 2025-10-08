import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useState } from "react";

interface PersonalityScreenProps {
  onContinue: () => void;
}

export function PersonalityScreen({ onContinue }: PersonalityScreenProps) {
  const [selectedPersonality, setSelectedPersonality] = useState('optimist');

  const personalities = [
    {
      id: 'optimist',
      title: 'The Optimist',
      description: 'Focus on growth and positive moments',
      emoji: '☀️',
      selected: true
    },
    {
      id: 'realist',
      title: 'The Realist',
      description: 'Balanced view with constructive feedback',
      emoji: '⚖️',
      selected: false
    },
    {
      id: 'achiever',
      title: 'The Achiever',
      description: 'Focus on progress and accomplishments',
      emoji: '🎯',
      selected: false
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <div className="w-full max-w-md">
        <h2 className="text-2xl text-center mb-8 text-foreground">
          How would you like to remember?
        </h2>

        <div className="space-y-4 mb-8">
          {personalities.map((personality) => (
            <Card 
              key={personality.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPersonality === personality.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => setSelectedPersonality(personality.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{personality.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {personality.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {personality.description}
                    </p>
                  </div>
                  {selectedPersonality === personality.id && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          onClick={onContinue}
          className="w-full py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}