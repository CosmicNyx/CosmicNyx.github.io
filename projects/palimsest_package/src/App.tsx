import { useState, useEffect } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { PermissionsScreen } from "./components/PermissionsScreen";
import { PersonalityScreen } from "./components/PersonalityScreen";
import { MainDashboard } from "./components/MainDashboard";
import { DetailView } from "./components/DetailView";
import { SettingsScreen } from "./components/SettingsScreen";
import { RawDataAccess } from "./components/RawDataAccess";
import { SubscriptionUpsell } from "./components/SubscriptionUpsell";
import { DialogueViewer } from "./components/DialogueViewer";
import { ConversationReview } from "./components/ConversationReview";

type Screen = 
  | 'welcome' 
  | 'permissions' 
  | 'personality' 
  | 'dashboard' 
  | 'detail' 
  | 'settings' 
  | 'rawData'
  | 'dialogue'
  | 'conversation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [showUpsell, setShowUpsell] = useState(false);
  const [daysUsed, setDaysUsed] = useState(0);

  // Simulate usage tracking
  useEffect(() => {
    if (currentScreen === 'dashboard') {
      const timer = setTimeout(() => {
        setDaysUsed(prev => prev + 1);
      }, 5000); // Simulate 5 seconds as 1 day for demo
      
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Show upsell after 7 "days"
  useEffect(() => {
    if (daysUsed >= 3 && !showUpsell) { // Reduced to 3 for demo purposes
      setShowUpsell(true);
    }
  }, [daysUsed, showUpsell]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={() => setCurrentScreen('permissions')} />;
      
      case 'permissions':
        return <PermissionsScreen onContinue={() => setCurrentScreen('personality')} />;
      
      case 'personality':
        return <PersonalityScreen onContinue={() => setCurrentScreen('dashboard')} />;
      
      case 'dashboard':
        return (
          <MainDashboard 
            onViewDetail={() => setCurrentScreen('detail')}
            onSettings={() => setCurrentScreen('settings')}
          />
        );
      
      case 'detail':
        return (
          <DetailView 
            onBack={() => setCurrentScreen('dashboard')}
            onViewRaw={() => setCurrentScreen('dialogue')}
            onViewConversation={() => setCurrentScreen('conversation')}
          />
        );
      
      case 'dialogue':
        return (
          <DialogueViewer 
            onBack={() => setCurrentScreen('detail')}
          />
        );
      
      case 'conversation':
        return (
          <ConversationReview 
            onBack={() => setCurrentScreen('detail')}
          />
        );
      
      case 'settings':
        return (
          <SettingsScreen 
            onBack={() => setCurrentScreen('dashboard')}
            onPrivacySettings={() => {
              // Navigate through multiple screens to reach raw data
              setCurrentScreen('rawData');
            }}
          />
        );
      
      case 'rawData':
        return <RawDataAccess onBack={() => setCurrentScreen('settings')} />;
      
      default:
        return <WelcomeScreen onGetStarted={() => setCurrentScreen('permissions')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {renderScreen()}
      
      {/* Subscription Upsell Modal */}
      {showUpsell && (
        <SubscriptionUpsell
          onSubscribe={() => {
            setShowUpsell(false);
            // Handle subscription logic
          }}
          onDismiss={() => setShowUpsell(false)}
        />
      )}
    </div>
  );
}