import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMDDSStore } from '@/state/store';
import { sanitizeText } from '../logic/guards';
import { apiRequest } from '@/lib/queryClient';
import logoUrl from '@assets/Logo_1758524556759.png';

export default function LoginScreen() {
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const setShowLoginScreen = useMDDSStore(state => state.setShowLoginScreen);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const setActiveDatabaseSession = useMDDSStore(state => state.setActiveDatabaseSession);
  const syncToDatabase = useMDDSStore(state => state.syncToDatabase);

  const handleStart = async () => {
    if (!sessionName.trim()) {
      setError('Session name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Update session name in store
      updateSessionName(sessionName.trim());
      
      // Get current game state
      const currentState = useMDDSStore.getState();
      const gameState = {
        turn: currentState.turn,
        maxTurns: currentState.maxTurns,
        currentTeam: currentState.currentTeam,
        teams: currentState.teams,
        phase: currentState.phase,
        strategyLog: currentState.strategyLog
      };

      // Create database session
      await apiRequest('POST', '/api/sessions', {
        sessionName: sessionName.trim(),
        gameState: gameState,
        sessionInfo: currentState.sessionInfo,
        turnStatistics: currentState.turnStatistics,
        lastUpdated: new Date().toISOString()
      });

      // Establish dynamic link to current game state
      setActiveDatabaseSession(sessionName.trim());
      
      // Perform initial sync to database
      await syncToDatabase();

      // Hide login screen and show main game
      setShowLoginScreen(false);
      
      // Save to localStorage to persist the state
      const stateAfterUpdate = useMDDSStore.getState();
      stateAfterUpdate.saveToLocalStorage();
    } catch (err) {
      console.error('Error creating database session:', err);
      setError('Failed to create session. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background */}
      <div className="absolute inset-0 backdrop-blur-md bg-background/30" />
      
      {/* Login card with glassmorphism */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 space-y-6">
          {/* Logo and title */}
          <div className="flex flex-col items-center space-y-4">
            <img src={logoUrl} alt="MDDS Logo" className="w-20 h-20" />
            <div className="text-center">
              <h1 className="text-2xl font-bold" data-testid="text-login-title">
                {sanitizeText('MDDS')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {sanitizeText('Multi Dimension Deterrence Strategy')}
              </p>
            </div>
          </div>

          {/* Session name input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-name-login">Session Name</Label>
              <Input
                id="session-name-login"
                value={sessionName}
                onChange={(e) => {
                  setSessionName(e.target.value);
                  setError('');
                }}
                placeholder="Enter session name"
                data-testid="input-session-name-login"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400" data-testid="text-login-error">
                  {error}
                </p>
              </div>
            )}

            <Button
              onClick={handleStart}
              className="w-full"
              disabled={isLoading}
              data-testid="button-start-session"
            >
              {isLoading ? 'Starting...' : 'Start Session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
