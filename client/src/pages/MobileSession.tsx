import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Coins } from 'lucide-react';
import { SelectGameSession } from '@shared/schema';
import DomainBadge from '@/components/DomainBadge';

export default function MobileSession() {
  const { sessionName } = useParams();

  const { data: session, isLoading, error } = useQuery<SelectGameSession>({
    queryKey: ['/api/sessions', sessionName],
    enabled: !!sessionName,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Session Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              The session "{sessionName}" could not be found.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { gameState, createdAt, updatedAt } = session;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{sessionName}</h1>
            <p className="text-sm text-muted-foreground">
              Turn {gameState.turn} of {gameState.maxTurns}
            </p>
          </div>
          <Badge variant="outline">
            {gameState.currentTeam}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Deterrence Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Total Deterrence Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400" data-testid="nato-total-deterrence">
                  {gameState.teams.NATO.totalDeterrence}
                </div>
                <div className="text-sm text-muted-foreground">NATO</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400" data-testid="russia-total-deterrence">
                  {gameState.teams.Russia.totalDeterrence}
                </div>
                <div className="text-sm text-muted-foreground">Russia</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NATO Team Container */}
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="w-4 h-4 mr-1" />
                  NATO
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
                <span className="font-mono font-semibold" data-testid="text-budget-nato">
                  ${gameState.teams.NATO.budget}K
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Deterrence</span>
                <span className="font-mono font-bold text-lg" data-testid="text-total-deterrence-nato">
                  {gameState.teams.NATO.totalDeterrence}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Russia Team Container */}
          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-red-600 hover:bg-red-700">
                  <Shield className="w-4 h-4 mr-1" />
                  Russia
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
                <span className="font-mono font-semibold" data-testid="text-budget-russia">
                  ${gameState.teams.Russia.budget}K
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Deterrence</span>
                <span className="font-mono font-bold text-lg" data-testid="text-total-deterrence-russia">
                  {gameState.teams.Russia.totalDeterrence}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dimensional Deterrence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimensional Deterrence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['joint', 'economy', 'cognitive', 'space', 'cyber'] as const).map((domain) => (
              <div key={domain} className="space-y-2">
                <div className="flex items-center gap-2">
                  <DomainBadge domain={domain} />
                  <span className="text-sm font-medium capitalize">{domain}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-blue-500">
                    NATO: {gameState.teams.NATO.deterrence[domain]}
                  </div>
                  <div className="text-red-500">
                    Russia: {gameState.teams.Russia.deterrence[domain]}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="pb-8">
          <Button 
            className="w-full" 
            onClick={() => {
              const mainAppUrl = `${window.location.origin}`;
              window.open(mainAppUrl, '_blank');
            }}
            data-testid="button-open-main-app"
          >
            Open Main Application
          </Button>
        </div>
      </div>
    </div>
  );
}