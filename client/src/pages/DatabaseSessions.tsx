import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { generateSessionReportPDF } from "@/utils/sessionReportGenerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [winnerFilter, setWinnerFilter] = useState<string>("all");
  const [deleteSessionName, setDeleteSessionName] = useState<string | null>(null);
  const { toast } = useToast();

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

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getLatestDeterrenceScores = (session: GameSession) => {
    const ensureNumber = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (typeof val === 'object') {
        if ('totalDeterrence' in val && typeof val.totalDeterrence === 'number') {
          return val.totalDeterrence;
        }
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
        if ('cyber' in val && 'joint' in val) {
          const domains = ['cyber', 'joint', 'space', 'economy', 'cognitive'];
          return domains.reduce((sum, domain) => {
            const domainVal = val[domain];
            return sum + (typeof domainVal === 'number' ? domainVal : 0);
          }, 0);
        }
      }
      return 0;
    };

    if (session.turnStatistics && Array.isArray(session.turnStatistics) && session.turnStatistics.length > 0) {
      const latest = session.turnStatistics[session.turnStatistics.length - 1];
      return {
        nato: ensureNumber(latest?.natoDeterrence),
        russia: ensureNumber(latest?.russiaDeterrence)
      };
    }

    if (session.gameState?.teams) {
      return {
        nato: ensureNumber(session.gameState.teams.NATO),
        russia: ensureNumber(session.gameState.teams.Russia)
      };
    }

    return { nato: 0, russia: 0 };
  };

  const getWinner = (session: GameSession): string => {
    const scores = getLatestDeterrenceScores(session);
    if (scores.nato > scores.russia) return 'NATO';
    if (scores.russia > scores.nato) return 'Russia';
    return 'Tie';
  };

  const handleDownloadReport = async (session: GameSession) => {
    const scores = getLatestDeterrenceScores(session);
    const winner = getWinner(session);
    await generateSessionReportPDF(session, scores, winner);
  };

  const deleteMutation = useMutation({
    mutationFn: async (sessionName: string) => {
      await apiRequest('DELETE', `/api/sessions/${encodeURIComponent(sessionName)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: "Session deleted",
        description: "The session has been removed from the database.",
      });
      setDeleteSessionName(null);
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the session. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  const handleDeleteClick = (sessionName: string) => {
    setDeleteSessionName(sessionName);
  };

  const handleDeleteConfirm = () => {
    if (deleteSessionName) {
      deleteMutation.mutate(deleteSessionName);
    }
  };

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    return sessions.filter((session) => {
      // Filter by session name
      if (searchQuery && !session.sessionName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by date range
      if (dateFrom || dateTo) {
        const sessionDate = new Date(session.createdAt);
        if (dateFrom && sessionDate < new Date(dateFrom)) {
          return false;
        }
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          if (sessionDate > endDate) {
            return false;
          }
        }
      }

      // Filter by winner
      if (winnerFilter !== 'all') {
        const winner = getWinner(session);
        if (winner !== winnerFilter) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, searchQuery, dateFrom, dateTo, winnerFilter]);

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
              View and filter all stored strategy sessions
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-session"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="input-date-from"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="input-date-to"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Winner</label>
              <Select value={winnerFilter} onValueChange={setWinnerFilter}>
                <SelectTrigger data-testid="select-winner-filter">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="NATO">NATO</SelectItem>
                  <SelectItem value="Russia">Russia</SelectItem>
                  <SelectItem value="Tie">Tie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchQuery || dateFrom || dateTo || winnerFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredSessions.length} of {sessions?.length || 0} sessions
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDateFrom("");
                  setDateTo("");
                  setWinnerFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 border-destructive">
            <p className="text-destructive font-medium">Error Loading Sessions</p>
            <p className="text-sm text-muted-foreground">
              Failed to fetch database sessions. Please try again.
            </p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && sessions && sessions.length === 0 && (
          <Card className="p-6">
            <p className="font-medium">No Sessions Found</p>
            <p className="text-sm text-muted-foreground">
              There are no stored sessions in the database yet.
            </p>
          </Card>
        )}

        {/* No Results After Filtering */}
        {!isLoading && !error && sessions && sessions.length > 0 && filteredSessions.length === 0 && (
          <Card className="p-6">
            <p className="font-medium">No Matching Sessions</p>
            <p className="text-sm text-muted-foreground">
              No sessions match your filter criteria. Try adjusting your filters.
            </p>
          </Card>
        )}

        {/* Sessions List */}
        {!isLoading && !error && filteredSessions.length > 0 && (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-3">Session Name</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2">Turn Progress</div>
              <div className="col-span-2">NATO Score</div>
              <div className="col-span-2">Russia Score</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredSessions.map((session) => {
              const scores = getLatestDeterrenceScores(session);
              const winner = getWinner(session);

              return (
                <div
                  key={session.sessionName}
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover-elevate rounded-md border"
                  data-testid={`row-session-${session.sessionName}`}
                >
                  <div className="col-span-3">
                    <div className="font-medium">{String(session.sessionName)}</div>
                    {winner !== 'Tie' && (
                      <Badge variant={winner === 'NATO' ? 'default' : 'secondary'} className="text-xs mt-1">
                        Winner: {winner}
                      </Badge>
                    )}
                    {winner === 'Tie' && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Tie
                      </Badge>
                    )}
                  </div>

                  <div className="col-span-2 text-sm text-muted-foreground">
                    {formatDateShort(session.createdAt)}
                  </div>

                  <div className="col-span-2">
                    <Badge variant="outline" data-testid={`badge-turn-${session.sessionName}`}>
                      Turn {Number(session.gameState.turn)}/{Number(session.gameState.maxTurns)}
                    </Badge>
                  </div>

                  <div className="col-span-2">
                    <div className="text-lg font-bold" data-testid={`score-nato-${session.sessionName}`}>
                      {Number(scores.nato) || 0}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-lg font-bold" data-testid={`score-russia-${session.sessionName}`}>
                      {Number(scores.russia) || 0}
                    </div>
                  </div>

                  <div className="col-span-1 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadReport(session)}
                      data-testid={`button-download-${session.sessionName}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(session.sessionName)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${session.sessionName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSessionName} onOpenChange={(open) => !open && setDeleteSessionName(null)}>
        <AlertDialogContent data-testid="dialog-delete-session">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the session "{deleteSessionName}"? This action cannot be undone and will permanently remove all session data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
