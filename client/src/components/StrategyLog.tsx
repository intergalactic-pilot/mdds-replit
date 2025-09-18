import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { sanitizeText } from '../logic/guards';
import { FileText, Clock } from "lucide-react";

interface LogEntry {
  turn: number;
  team: 'NATO' | 'Russia';
  action: string;
  timestamp: Date;
}

interface StrategyLogProps {
  entries: LogEntry[];
  maxHeight?: string;
}

export default function StrategyLog({ entries, maxHeight = "400px" }: StrategyLogProps) {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getTeamBadgeColor = (team: 'NATO' | 'Russia') => {
    return team === 'NATO' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white';
  };

  return (
    <Card data-testid="strategy-log">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {sanitizeText('Strategy Log')}
          <Badge variant="outline">{entries.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p>No log entries yet</p>
              <p className="text-xs">Actions will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEntries.map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border hover-elevate"
                  data-testid={`log-entry-${index}`}
                >
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    <Badge className={getTeamBadgeColor(entry.team)} data-testid={`badge-team-${entry.team}`}>
                      {entry.team}
                    </Badge>
                    <Badge variant="outline" className="text-xs" data-testid={`badge-turn-${entry.turn}`}>
                      T{entry.turn}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words" data-testid={`text-action-${index}`}>
                      {sanitizeText(entry.action)}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span data-testid={`text-timestamp-${index}`}>
                        {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}