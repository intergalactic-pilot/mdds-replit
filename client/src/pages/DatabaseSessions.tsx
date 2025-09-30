import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface GameSession {
  sessionName: string;
  gameState: {
    turn: number;
    maxTurns: number;
    currentTeam: string;
    phase: string;
    teams?: {
      NATO?: {
        totalDeterrence?: number;
      };
      Russia?: {
        totalDeterrence?: number;
      };
    };
  };
  sessionInfo: {
    participants?: string[];
  } | null;
  turnStatistics: Array<{
    turn: number;
    natoDeterrence: number;
    russiaDeterrence: number;
  }> | null;
  lastUpdated: string | null;
  createdAt: string;
}

export default function DatabaseSessions() {
  const [, setLocation] = useLocation();

  const { data: sessions, isLoading, error } = useQuery<GameSession[]>({
    queryKey: ['/api/sessions'],
  });

  const handleBack = () => {
    setLocation('/');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getLatestDeterrenceScores = (session: GameSession) => {
    // Helper to ensure we get a number from any value
    const ensureNumber = (val: any): number => {
      // Return 0 for null/undefined
      if (val === null || val === undefined) return 0;
      
      // If it's already a number, return it
      if (typeof val === 'number') return val;
      
      // Try to parse strings
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      
      // Handle objects - try to extract a number
      if (typeof val === 'object') {
        // Check for totalDeterrence property first
        if ('totalDeterrence' in val && typeof val.totalDeterrence === 'number') {
          return val.totalDeterrence;
        }
        
        // Check for deterrence property (nested object with domains)
        if ('deterrence' in val && typeof val.deterrence === 'object' && val.deterrence !== null) {
          const det = val.deterrence;
          if ('cyber' in det && 'joint' in det) {
            const domains = ['cyber', 'joint', 'space', 'economy', 'cognitive'];
            return domains.reduce((sum, domain) => {
              const domainVal = det[domain];
              return sum + (typeof domainVal === 'number' ? domainVal : 0);
            }, 0);
          }
        }
        
        // Check if it's directly a domain object (has cyber, joint, etc.)
        if ('cyber' in val && 'joint' in val) {
          const domains = ['cyber', 'joint', 'space', 'economy', 'cognitive'];
          return domains.reduce((sum, domain) => {
            const domainVal = val[domain];
            return sum + (typeof domainVal === 'number' ? domainVal : 0);
          }, 0);
        }
      }
      
      // Fallback to 0
      return 0;
    };

    // Try turnStatistics first
    if (session.turnStatistics && Array.isArray(session.turnStatistics) && session.turnStatistics.length > 0) {
      const latest = session.turnStatistics[session.turnStatistics.length - 1];
      return {
        nato: ensureNumber(latest?.natoDeterrence),
        russia: ensureNumber(latest?.russiaDeterrence)
      };
    }

    // Fall back to gameState teams
    if (session.gameState?.teams) {
      return {
        nato: ensureNumber(session.gameState.teams.NATO),
        russia: ensureNumber(session.gameState.teams.Russia)
      };
    }

    return { nato: 0, russia: 0 };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            data-testid="button-back-to-main"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Database Sessions</h1>
            <p className="text-muted-foreground">
              View all stored strategy sessions
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Sessions</CardTitle>
              <CardDescription>
                Failed to fetch database sessions. Please try again.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !error && sessions && sessions.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Sessions Found</CardTitle>
              <CardDescription>
                There are no stored sessions in the database yet.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !error && sessions && sessions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => {
              const scores = getLatestDeterrenceScores(session);
              return (
                <Card key={session.sessionName} className="hover-elevate" data-testid={`card-session-${session.sessionName}`}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="truncate">{String(session.sessionName)}</span>
                      <Badge variant="outline" data-testid={`badge-turn-${session.sessionName}`}>
                        Turn {Number(session.gameState.turn)}/{Number(session.gameState.maxTurns)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      {session.lastUpdated && (
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>Updated: {formatDate(session.lastUpdated)}</span>
                        </div>
                      )}
                      {session.sessionInfo?.participants && Array.isArray(session.sessionInfo.participants) && session.sessionInfo.participants.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="w-3 h-3" />
                          <span>{session.sessionInfo.participants.length} participants</span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Phase:</span>
                        <Badge variant="secondary">{String(session.gameState.phase)}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Team:</span>
                        <span className="font-medium">{String(session.gameState.currentTeam)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        Latest Deterrence Scores
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-md bg-muted">
                          <div className="text-xs text-muted-foreground">NATO</div>
                          <div className="text-lg font-bold" data-testid={`score-nato-${session.sessionName}`}>
                            {Number(scores.nato) || 0}
                          </div>
                        </div>
                        <div className="p-2 rounded-md bg-muted">
                          <div className="text-xs text-muted-foreground">Russia</div>
                          <div className="text-lg font-bold" data-testid={`score-russia-${session.sessionName}`}>
                            {Number(scores.russia) || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
