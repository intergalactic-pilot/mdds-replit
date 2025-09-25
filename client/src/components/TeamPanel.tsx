import { Team, TeamState, Domain } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DomainBadge from "./DomainBadge";
import { formatCurrency } from "../logic/pricing";
import { sanitizeText } from "../logic/guards";
import { Shield, Clock, Coins } from "lucide-react";

interface TeamPanelProps {
  team: Team;
  teamState: TeamState;
  isActive?: boolean;
  currentTurn?: number;
}

const teamColors = {
  NATO: "bg-blue-600 text-white",
  Russia: "bg-red-600 text-white"
};

const teamBorders = {
  NATO: "ring-2 ring-blue-500",
  Russia: "ring-2 ring-red-500"
};

export default function TeamPanel({ team, teamState, isActive = false, currentTurn = 1 }: TeamPanelProps) {
  const domainOrder: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];

  return (
    <Card 
      className={`${teamBorders[team]} transition-all`}
      data-testid={`panel-team-${team.toLowerCase()}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Badge className={teamColors[team]}>
            <Shield className="w-4 h-4 mr-1" />
            {sanitizeText(team)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Budget</span>
            </div>
            <span className="font-mono font-semibold" data-testid={`text-budget-${team.toLowerCase()}`}>
              {formatCurrency(teamState.budget)}
            </span>
          </div>
          {currentTurn === 1 && (
            <div className="text-xs text-muted-foreground">
              Turn 1: Must spend exactly 200K per domain
            </div>
          )}
        </div>

        {/* Total Deterrence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Deterrence</span>
            <span className="font-mono font-bold text-lg" data-testid={`text-total-deterrence-${team.toLowerCase()}`}>
              {teamState.totalDeterrence}
            </span>
          </div>
        </div>

        {/* Domain Deterrence */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Dimensional Deterrence</h4>
          {domainOrder.map(domain => (
            <div key={domain} className="space-y-1">
              <div className="flex items-center justify-between">
                <DomainBadge domain={domain} className="text-xs" />
                <span className="font-mono text-sm" data-testid={`text-deterrence-${domain}-${team.toLowerCase()}`}>
                  {teamState.deterrence[domain]}
                </span>
              </div>
              <Progress 
                value={teamState.deterrence[domain]} 
                max={200} 
                className={`h-2 ${team === 'Russia' ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
              />
            </div>
          ))}
        </div>

        {/* Active Permanents */}
        {teamState.ownedPermanents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Active Permanents</h4>
            <div className="flex flex-wrap gap-1">
              {teamState.ownedPermanents.map((permanent, index) => (
                <Badge 
                  key={`permanent-${permanent.id}-${index}`} 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`badge-permanent-${permanent.id}`}
                >
                  {permanent.id}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Permanent Queue */}
        {teamState.permanentsQueue && teamState.permanentsQueue.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Permanent Queue
            </h4>
            <div className="space-y-1">
              {(teamState.permanentsQueue || []).map((permanent, index) => (
                <div 
                  key={`permanent-queue-${permanent.card.id}-${index}`}
                  className="flex items-center justify-between text-xs"
                  data-testid={`permanent-queue-${permanent.card.id}`}
                >
                  <span>{permanent.card.name}</span>
                  <Badge variant="outline" className="text-xs">
                    T+{permanent.availableTurn}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expert Queue */}
        {teamState.expertsQueue.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expert Queue
            </h4>
            <div className="space-y-1">
              {teamState.expertsQueue.map((expert, index) => (
                <div 
                  key={`expert-${expert.card.id}-${index}`}
                  className="flex items-center justify-between text-xs"
                  data-testid={`expert-queue-${expert.card.id}`}
                >
                  <span>{expert.card.name}</span>
                  <Badge variant="outline" className="text-xs">
                    T+{expert.availableTurn}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Items */}
        {teamState.cart.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Cart ({teamState.cart.length})</h4>
            <div className="flex flex-wrap gap-1">
              {teamState.cart.map((card, index) => (
                <Badge 
                  key={`cart-${card.id}-${index}`} 
                  variant="outline" 
                  className="text-xs"
                  data-testid={`badge-cart-${card.id}`}
                >
                  {card.id}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}