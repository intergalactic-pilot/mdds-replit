import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMDDSStore } from '@/state/store';
import logoUrl from '@assets/Logo_1758524556759.png';

interface MobileSessionInputProps {
  onSessionStart: () => void;
}

export default function MobileSessionInput({ onSessionStart }: MobileSessionInputProps) {
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const startSession = useMDDSStore(state => state.startSession);
  const [localSessionName, setLocalSessionName] = useState(sessionInfo.sessionName);

  const handleStartSession = () => {
    if (localSessionName.trim()) {
      updateSessionName(localSessionName.trim());
      startSession();
      onSessionStart();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoUrl} alt="MDDS Logo" className="w-16 h-16" />
          </div>
          <CardTitle className="text-xl">Multi Dimension Deterrence Strategy</CardTitle>
          <CardDescription>Enter your session name to begin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={localSessionName}
              onChange={(e) => setLocalSessionName(e.target.value)}
              placeholder="Enter session name"
              className="text-center"
              data-testid="input-mobile-session-name"
            />
          </div>
          <Button 
            onClick={handleStartSession}
            className="w-full"
            disabled={!localSessionName.trim()}
            data-testid="button-mobile-start-session"
          >
            Start Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}