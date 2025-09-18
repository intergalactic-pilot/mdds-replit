import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Play, SkipForward, RotateCcw } from "lucide-react";
import { sanitizeText } from '../logic/guards';

interface TurnControllerProps {
  currentTurn: number;
  maxTurns: number;
  currentTeam: 'NATO' | 'Russia';
  phase: 'purchase' | 'commit' | 'advance';
  onCommitPurchases: () => void;
  onAdvanceTurn: () => void;
  onUndoLastCommit?: () => void;
  canCommit: boolean;
  canAdvance: boolean;
  validationErrors: string[];
}

export default function TurnController({
  currentTurn,
  maxTurns,
  currentTeam,
  phase,
  onCommitPurchases,
  onAdvanceTurn, 
  onUndoLastCommit,
  canCommit,
  canAdvance,
  validationErrors
}: TurnControllerProps) {
  const [isConfirmingCommit, setIsConfirmingCommit] = useState(false);

  const turnProgress = (currentTurn / maxTurns) * 100;

  const handleCommit = () => {
    if (validationErrors.length > 0) {
      setIsConfirmingCommit(true);
      return;
    }
    onCommitPurchases();
    setIsConfirmingCommit(false);
  };

  return (
    <Card data-testid="turn-controller">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            {sanitizeText('Turn Controller')}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Turn {currentTurn}/{maxTurns}</Badge>
            <Badge className={currentTeam === 'NATO' ? 'bg-blue-600' : 'bg-red-600'}>
              {currentTeam}
            </Badge>
          </div>
        </CardTitle>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Strategy Progress</span>
            <span>{Math.round(turnProgress)}%</span>
          </div>
          <Progress value={turnProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Phase Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Current Phase:</span>
          <Badge variant={phase === 'purchase' ? 'default' : 'secondary'}>
            {sanitizeText(phase.charAt(0).toUpperCase() + phase.slice(1))} Phase
          </Badge>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Validation Issues:</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="ml-4" data-testid={`error-${index}`}>
                  • {sanitizeText(error)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!isConfirmingCommit ? (
            <>
              <Button
                onClick={handleCommit}
                disabled={!canCommit}
                size="lg"
                className="w-full"
                data-testid="button-commit-purchases"
              >
                <Play className="w-4 h-4 mr-2" />
                {sanitizeText('Commit Purchases')}
              </Button>
              
              <Button
                onClick={onAdvanceTurn}
                disabled={!canAdvance}
                variant="outline"
                size="lg" 
                className="w-full"
                data-testid="button-advance-turn"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                {sanitizeText('Advance Turn')}
              </Button>
              
              {onUndoLastCommit && (
                <Button
                  onClick={onUndoLastCommit}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  data-testid="button-undo-commit"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {sanitizeText('Undo Last Commit')}
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-destructive font-medium">
                {sanitizeText('There are validation issues. Commit anyway?')}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onCommitPurchases();
                    setIsConfirmingCommit(false);
                  }}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  data-testid="button-force-commit"
                >
                  {sanitizeText('Force Commit')}
                </Button>
                <Button
                  onClick={() => setIsConfirmingCommit(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid="button-cancel-commit"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Turn Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          {currentTurn === 1 && (
            <p>{sanitizeText('Turn 1: Must spend exactly 200K per domain')}</p>
          )}
          {currentTurn >= 2 && (
            <p>{sanitizeText('Turn 2+: 1000K pooled budget available')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}