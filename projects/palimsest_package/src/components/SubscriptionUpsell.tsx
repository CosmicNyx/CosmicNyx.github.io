import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Check, X, Sparkles } from "lucide-react";

interface SubscriptionUpsellProps {
  onSubscribe: () => void;
  onDismiss: () => void;
}

export function SubscriptionUpsell({ onSubscribe, onDismiss }: SubscriptionUpsellProps) {
  const stats = [
    { value: '37%', label: 'increase in positive recall' },
    { value: '42%', label: 'reduction in stress markers' },
    { value: '89%', label: 'improved memory coherence' },
  ];

  const benefits = [
    'Unlimited memory optimization',
    'Advanced narrative customization',
    'Priority emotional processing',
    'Detailed wellness insights',
    'Export curated memories',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-to-br from-primary via-primary to-secondary text-white border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onDismiss}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">Premium Experience</span>
              <Sparkles className="w-5 h-5 text-white/80" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-bold mb-4">
            Your well-being journey is working!
          </h2>

          {/* Stats */}
          <div className="space-y-3 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="text-left mb-8">
            <h3 className="font-semibold mb-4 text-center">Continue your transformation with Premium:</h3>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button 
            onClick={onSubscribe}
            className="w-full py-4 mb-4 bg-white text-primary hover:bg-white/90 font-semibold text-lg"
          >
            Continue Your Journey - $14.99/month
          </Button>

          {/* Fine Print */}
          <p className="text-xs text-white/70">
            7-day free trial, then monthly billing
          </p>
          
          {/* Social Proof */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white/80">
              "87% of users prefer their curated memories"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}