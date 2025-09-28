import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMDDSStore } from '@/state/store';
import { useLocation } from 'wouter';
import logoUrl from '@assets/Logo_1758524556759.png';

interface MobileSessionInputProps {
  onSessionStart: () => void;
}

export default function MobileSessionInput({ onSessionStart }: MobileSessionInputProps) {
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const startSession = useMDDSStore(state => state.startSession);
  const loadSharedSession = useMDDSStore(state => state.loadSharedSession);
  const [localSessionName, setLocalSessionName] = useState(sessionInfo.sessionName);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleStartSession = async () => {
    if (!localSessionName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Try to fetch existing session by name
      const response = await fetch(`/api/sessions/by-name/${encodeURIComponent(localSessionName.trim())}`);
      
      if (response.ok) {
        // Session found - load it
        const sessionData = await response.json();
        loadSharedSession(sessionData);
        onSessionStart();
      } else if (response.status === 404) {
        // Session not found
        alert(`No session found with the name "${localSessionName.trim()}". Sessions can only be created on desktop.`);
      } else {
        // Other error
        alert('Error loading session. Please try again.');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Error loading session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStatistics = async () => {
    if (!localSessionName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Try to fetch existing session by name
      const response = await fetch(`/api/sessions/by-name/${encodeURIComponent(localSessionName.trim())}`);
      
      if (response.ok) {
        // Session found - load it and redirect to statistics
        const sessionData = await response.json();
        loadSharedSession(sessionData);
        // Redirect to statistics page
        setLocation('/statistics');
      } else if (response.status === 404) {
        // Session not found
        alert(`No session found with the name "${localSessionName.trim()}". Sessions can only be created on desktop.`);
      } else {
        // Other error
        alert('Error loading session. Please try again.');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Error loading session. Please try again.');
    } finally {
      setIsLoading(false);
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
          <CardDescription>Enter session name to access</CardDescription>
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
          <div className="space-y-2">
            <Button 
              onClick={handleViewStatistics}
              className="w-full"
              disabled={!localSessionName.trim() || isLoading}
              data-testid="button-mobile-view-statistics"
            >
              {isLoading ? 'Loading...' : 'View Statistics'}
            </Button>
            <Button 
              onClick={handleStartSession}
              className="w-full"
              variant="outline"
              disabled={!localSessionName.trim() || isLoading}
              data-testid="button-mobile-start-session"
            >
              {isLoading ? 'Loading...' : 'Load Session'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}