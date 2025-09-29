import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { SelectGameSession, Card as GameCard } from '@shared/schema';
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
        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <br />
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <br />
                <span>{new Date(updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Phase:</span>
              <Badge variant="secondary" className="ml-2">
                {gameState.phase}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Team Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Deterrence Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {gameState.teams.NATO.totalDeterrence}
                </div>
                <div className="text-sm text-muted-foreground">NATO</div>
              </div>
              <div className="text-lg text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {gameState.teams.Russia.totalDeterrence}
                </div>
                <div className="text-sm text-muted-foreground">Russia</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimensional Scores */}
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

        {/* Budget Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-500">
                  ${gameState.teams.NATO.budget}K
                </div>
                <div className="text-sm text-muted-foreground">NATO Budget</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-500">
                  ${gameState.teams.Russia.budget}K
                </div>
                <div className="text-sm text-muted-foreground">Russia Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cart Information */}
        {(gameState.teams.NATO.cart.length > 0 || gameState.teams.Russia.cart.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Purchases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameState.teams.NATO.cart.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-blue-500 mb-2">NATO Cart:</div>
                  <div className="space-y-1">
                    {gameState.teams.NATO.cart.map((card: GameCard, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <DomainBadge domain={card.domain} />
                        <span>{card.id} - {card.name}</span>
                        <Badge variant="outline">${card.baseCostK}K</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {gameState.teams.Russia.cart.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-500 mb-2">Russia Cart:</div>
                  <div className="space-y-1">
                    {gameState.teams.Russia.cart.map((card: GameCard, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <DomainBadge domain={card.domain} />
                        <span>{card.id} - {card.name}</span>
                        <Badge variant="outline">${card.baseCostK}K</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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