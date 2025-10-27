import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Eye, Search, Trash2, ZoomIn, BarChart3, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { generateMDDSReport } from "@/utils/pdfGenerator";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Domain } from '@shared/schema';

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
  finalReport: string | null;
}

const domainColors = {
  joint: { color: '#9CA3AF', bgClass: 'bg-gray-500/20', textClass: 'text-gray-500' },
  economy: { color: '#10B981', bgClass: 'bg-green-500/20', textClass: 'text-green-500' },
  cognitive: { color: '#8B5CF6', bgClass: 'bg-purple-500/20', textClass: 'text-purple-500' },
  space: { color: '#3B82F6', bgClass: 'bg-blue-500/20', textClass: 'text-blue-500' },
  cyber: { color: '#F59E0B', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-500' }
} as const;

export default function DatabaseSessions() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [winnerFilter, setWinnerFilter] = useState<string>("all");
  const [deleteSessionName, setDeleteSessionName] = useState<string | null>(null);
  const [detailsSession, setDetailsSession] = useState<GameSession | null>(null);
  const [showRussia, setShowRussia] = useState(true);
  const [visibleDomains, setVisibleDomains] = useState<Record<Domain, boolean>>({
    joint: true,
    economy: true,
    cognitive: true,
    space: true,
    cyber: true
  });
  const { toast } = useToast();

  const { data: sessions, isLoading, error } = useQuery<GameSession[]>({
    queryKey: ['/api/sessions'],
  });

  const handleBack = () => {
    setLocation('/');
  };

  const toggleDomainVisibility = (domain: Domain) => {
    setVisibleDomains(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }));
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
    // Always try to download the finalReport if it exists (exact same PDF from "Finish Session")
    if (session.finalReport) {
      try {
        // Convert base64 to blob and download
        const byteCharacters = atob(session.finalReport);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${session.sessionName}_Final_Report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Report downloaded",
          description: "Final report successfully downloaded.",
          duration: 3000,
        });
        return;
      } catch (error) {
        console.error('Failed to download stored report:', error);
        toast({
          title: "Download failed",
          description: "Failed to download stored report. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // If no finalReport exists, inform the user
    toast({
      title: "No report available",
      description: "This session was not finished. Please finish the session to generate a final report.",
      variant: "destructive",
    });
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

    return sessions
      .filter((session) => {
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
      })
      .sort((a, b) => {
        // Sort by creation date, latest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [sessions, searchQuery, dateFrom, dateTo, winnerFilter]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation('/research')}
              data-testid="button-navigate-research"
            >
              <FlaskConical className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation('/analysis')}
              data-testid="button-navigate-analysis"
            >
              <BarChart3 className="w-5 h-5" />
            </Button>
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
                      onClick={() => setDetailsSession(session)}
                      data-testid={`button-details-${session.sessionName}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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

      {/* Session Details Dialog */}
      <Dialog open={!!detailsSession} onOpenChange={(open) => !open && setDetailsSession(null)}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto" data-testid="dialog-session-details">
          <DialogHeader>
            <DialogTitle>Turn-Based Dimension Statistics - {detailsSession?.sessionName}</DialogTitle>
          </DialogHeader>
          
          {detailsSession && detailsSession.turnStatistics && detailsSession.turnStatistics.length > 0 && (
            <div className="space-y-6">
              <div className="flex gap-4 text-sm text-muted-foreground border-b pb-4">
                <span>Created: {formatDateShort(detailsSession.createdAt)}</span>
                <span>Turn: {detailsSession.gameState.turn}/{detailsSession.gameState.maxTurns}</span>
                <span>Participants: {detailsSession.sessionInfo?.participants?.length || 0}</span>
              </div>

              {/* Overall Deterrence Chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Overall Deterrence Scores</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>NATO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Russia</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={detailsSession.turnStatistics.map((stat: any) => ({
                        turn: stat.turn,
                        NATO: typeof stat.natoTotalDeterrence === 'number' ? stat.natoTotalDeterrence : (typeof stat.natoDeterrence === 'number' ? stat.natoDeterrence : 0),
                        Russia: typeof stat.russiaTotalDeterrence === 'number' ? stat.russiaTotalDeterrence : (typeof stat.russiaDeterrence === 'number' ? stat.russiaDeterrence : 0)
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="turn" 
                        label={{ value: 'Turn', position: 'insideBottom', offset: -5 }}
                        className="text-sm"
                      />
                      <YAxis 
                        label={{ value: 'Total Deterrence', angle: -90, position: 'insideLeft' }}
                        className="text-sm"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="NATO" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Russia" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        dot={{ fill: '#EF4444', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Domain-Specific Charts */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-t pt-4">Dimension-Based Deterrence</h3>
                <div className="grid gap-6">
                  {(['joint', 'economy', 'cognitive', 'space', 'cyber'] as Domain[]).map((domain) => {
                    const hasData = detailsSession.turnStatistics?.some((stat: any) => 
                      stat.natoDeterrence && typeof stat.natoDeterrence === 'object' && domain in stat.natoDeterrence
                    );
                    
                    if (!hasData) return null;

                    const chartData = detailsSession.turnStatistics?.map((stat: any) => {
                      const natoVal = stat.natoDeterrence && typeof stat.natoDeterrence === 'object' ? (stat.natoDeterrence[domain] || 0) : 0;
                      const russiaVal = stat.russiaDeterrence && typeof stat.russiaDeterrence === 'object' ? (stat.russiaDeterrence[domain] || 0) : 0;
                      return {
                        turn: stat.turn,
                        NATO: natoVal,
                        Russia: russiaVal
                      };
                    });

                    return (
                      <div key={domain} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${domainColors[domain].bgClass}`} style={{ backgroundColor: domainColors[domain].color }}></div>
                          <h4 className="font-medium capitalize">{domain} Domain</h4>
                        </div>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart
                              data={chartData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis 
                                dataKey="turn" 
                                label={{ value: 'Turn', position: 'insideBottom', offset: -5 }}
                                className="text-xs"
                              />
                              <YAxis 
                                label={{ value: 'Deterrence', angle: -90, position: 'insideLeft' }}
                                className="text-xs"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--background))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '6px'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="NATO" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', r: 3 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Russia" 
                                stroke="#EF4444" 
                                strokeWidth={2}
                                dot={{ fill: '#EF4444', r: 3 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {detailsSession && (!detailsSession.turnStatistics || detailsSession.turnStatistics.length === 0) && (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                No turn statistics available for this session.
              </p>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
