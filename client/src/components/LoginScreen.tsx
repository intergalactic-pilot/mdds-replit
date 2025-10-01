import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMDDSStore } from '@/state/store';
import { sanitizeText } from '../logic/guards';
import { apiRequest } from '@/lib/queryClient';
import logoUrl from '@assets/Logo_1758524556759.png';

export default function LoginScreen() {
  const [course, setCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [committeeNumber, setCommitteeNumber] = useState('');
  const [skipTurn1, setSkipTurn1] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get today's date in different formats
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const dateForSessionName = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Auto-generate session name
  const generateSessionName = () => {
    let coursePart = '';
    let committeePart = '';
    
    // Get course name
    if (course) {
      if (course === 'Others' && customCourse) {
        coursePart = customCourse.trim().replace(/\s+/g, '');
      } else if (course !== 'Others') {
        coursePart = course.replace(/\s+/g, '');
      }
    }
    
    // Get committee number
    if (committeeNumber) {
      committeePart = committeeNumber.toString();
    }
    
    // Build session name with dashes: coursename-committeenumber-date
    if (coursePart || committeePart) {
      return `${coursePart}-${committeePart}-${dateForSessionName}`;
    }
    return '';
  };
  
  const sessionName = generateSessionName();
  
  const setShowLoginScreen = useMDDSStore(state => state.setShowLoginScreen);
  const updateSessionName = useMDDSStore(state => state.updateSessionName);
  const updateCourse = useMDDSStore(state => state.updateCourse);
  const updateCommitteeNumber = useMDDSStore(state => state.updateCommitteeNumber);
  const setActiveDatabaseSession = useMDDSStore(state => state.setActiveDatabaseSession);
  const syncToDatabase = useMDDSStore(state => state.syncToDatabase);

  const handleStart = async () => {
    // Determine the final course value
    let courseValue: string | null = null;
    if (course) {
      if (course === 'Others') {
        if (!customCourse.trim()) {
          setError('Please enter a course name');
          return;
        }
        courseValue = customCourse.trim();
      } else {
        courseValue = course;
      }
    }

    // Parse committee number - it can be a number, "NA", or null
    let committeeValue: number | string | null = null;
    if (committeeNumber) {
      if (committeeNumber === 'NA') {
        committeeValue = 'NA';
      } else {
        const num = parseInt(committeeNumber);
        if (!isNaN(num) && num >= 1 && num <= 10) {
          committeeValue = num;
        }
      }
    }

    setIsLoading(true);
    setError('');

    try {
      // Update session info in store
      updateSessionName(sessionName.trim());
      updateCourse(courseValue);
      updateCommitteeNumber(committeeValue);
      
      // Get current game state (do not mutate yet)
      const currentState = useMDDSStore.getState();
      
      // Build the game state for database - if skip turn 1, use turn 2
      const gameState = {
        turn: skipTurn1 ? 2 : currentState.turn,
        maxTurns: currentState.maxTurns,
        currentTeam: currentState.currentTeam,
        teams: currentState.teams,
        phase: currentState.phase,
        strategyLog: currentState.strategyLog
      };

      // Create database session with the appropriate turn
      await apiRequest('POST', '/api/sessions', {
        sessionName: sessionName.trim(),
        gameState: gameState,
        sessionInfo: currentState.sessionInfo,
        turnStatistics: currentState.turnStatistics,
        lastUpdated: new Date().toISOString()
      });

      // Only NOW that the API call succeeded, advance the turn in the store if skip was selected
      if (skipTurn1) {
        const state = useMDDSStore.getState();
        state.advanceGameTurn();
      }

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

          {/* Input fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-login">Course</Label>
              <Select
                value={course}
                onValueChange={(value) => {
                  setCourse(value);
                  setError('');
                  // Clear custom course if switching away from "Others"
                  if (value !== 'Others') {
                    setCustomCourse('');
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger data-testid="select-course-login">
                  <SelectValue placeholder="Select course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="NRCC">NRCC</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {course === 'Others' && (
              <div className="space-y-2">
                <Label htmlFor="custom-course-login">Course Name</Label>
                <Input
                  id="custom-course-login"
                  value={customCourse}
                  onChange={(e) => {
                    setCustomCourse(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter course name"
                  data-testid="input-custom-course-login"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="committee-number-login">Committee Number</Label>
              <Select
                value={committeeNumber}
                onValueChange={(value) => {
                  setCommitteeNumber(value);
                  setError('');
                }}
                disabled={isLoading}
              >
                <SelectTrigger data-testid="select-committee-number-login">
                  <SelectValue placeholder="Select committee number (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="NA">NA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="game-date-login" className="text-muted-foreground">Session Date</Label>
              <Input
                id="game-date-login"
                value={formattedDate}
                readOnly
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                data-testid="input-game-date-login"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-name-login" className="text-muted-foreground">Session Name</Label>
              <Input
                id="session-name-login"
                value={sessionName || 'Auto-generated from selections above'}
                readOnly
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                data-testid="input-session-name-login"
                placeholder="Auto-generated from selections above"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-turn-1"
                checked={skipTurn1}
                onCheckedChange={(checked) => setSkipTurn1(checked === true)}
                disabled={isLoading}
                data-testid="checkbox-skip-turn-1"
              />
              <Label
                htmlFor="skip-turn-1"
                className="text-sm font-normal cursor-pointer"
              >
                {sanitizeText('Skip Turn 1 (Start from Turn 2)')}
              </Label>
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
