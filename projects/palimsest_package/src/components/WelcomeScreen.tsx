import { Button } from "./ui/button";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <div className="text-white text-4xl font-bold">P</div>
            <div className="absolute w-6 h-6 bg-white/30 rounded-full ml-8 mt-2 animate-pulse"></div>
          </div>
        </div>

        {/* Headlines */}
        <h1 className="text-3xl mb-4 text-foreground">
          Remember what matters. Forget what doesn't.
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Palimpsest helps you focus on the positive by curating your daily memories.
        </p>

        {/* CTA Button */}
        <Button 
          onClick={onGetStarted}
          className="w-full py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}