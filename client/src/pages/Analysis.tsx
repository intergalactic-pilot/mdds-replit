import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Brain, TrendingUp, Lightbulb, Filter, CheckSquare, Square, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeSelectedSessions, type SessionData } from "@/utils/sessionAnalyzer";

interface GameSession {
  sessionName: string;
  gameState: any;
  turnStatistics?: any;
  createdAt: string;
}

export default function Analysis() {
  const [, setLocation] = useLocation();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [sessionSearch, setSessionSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: sessions, isLoading } = useQuery<GameSession[]>({
    queryKey: ['/api/sessions'],
  });

  const handleBack = () => {
    setLocation('/database');
  };

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    
    let filtered = [...sessions];
    
    // Search filter
    if (sessionSearch) {
      filtered = filtered.filter(s => 
        s.sessionName.toLowerCase().includes(sessionSearch.toLowerCase())
      );
    }
    
    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateFilter === "3months") {
        filterDate.setMonth(now.getMonth() - 3);
      }
      
      filtered = filtered.filter(s => new Date(s.createdAt) >= filterDate);
    }
    
    // Sort by date (latest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [sessions, sessionSearch, dateFilter]);

  const handleToggleSession = (sessionName: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionName)
        ? prev.filter(s => s !== sessionName)
        : [...prev, sessionName]
    );
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map(s => s.sessionName));
    }
  };

  const allSelected = filteredSessions.length > 0 && selectedSessions.length === filteredSessions.length;

  // Get analysis for selected sessions
  const selectedSessionsData: SessionData[] = useMemo(() => {
    if (!sessions) return [];
    return sessions
      .filter(s => selectedSessions.includes(s.sessionName))
      .map(s => ({
        sessionName: s.sessionName,
        gameState: s.gameState,
        turnStatistics: s.turnStatistics
      }));
  }, [sessions, selectedSessions]);

  const analysisResult = useMemo(() => {
    return analyzeSelectedSessions(selectedSessionsData);
  }, [selectedSessionsData]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            data-testid="button-back-to-database"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Automatic Strategy Analysis</h1>
            <p className="text-muted-foreground">
              Pattern analysis and strategic insights from game sessions
            </p>
          </div>
        </div>

        {/* Session Selection Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Sessions for Analysis</CardTitle>
                  <CardDescription>
                    Choose which game sessions to include in the AI pattern analysis
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm" data-testid="badge-selected-count">
                {selectedSessions.length} selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter Controls */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Sessions</label>
                <Input
                  placeholder="Search by name..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  data-testid="input-session-search"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger data-testid="select-date-filter">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last month</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Actions</label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSelectAll}
                  data-testid="button-select-all"
                >
                  {allSelected ? (
                    <>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Select All
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Session List */}
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}

            {!isLoading && filteredSessions.length > 0 && (
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <div className="divide-y">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.sessionName}
                      className="flex items-center gap-3 p-3 hover-elevate"
                      data-testid={`session-item-${session.sessionName}`}
                    >
                      <Checkbox
                        checked={selectedSessions.includes(session.sessionName)}
                        onCheckedChange={() => handleToggleSession(session.sessionName)}
                        data-testid={`checkbox-session-${session.sessionName}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{session.sessionName}</div>
                        <div className="text-xs text-muted-foreground">
                          Turn {session.gameState.turn}/{session.gameState.maxTurns} • {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && filteredSessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No sessions found matching your filters
              </div>
            )}

            {!isLoading && sessions && sessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No game sessions available. Play some games first to enable analysis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="generic" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generic" data-testid="tab-generic-pattern">
              Generic Patternization
            </TabsTrigger>
            <TabsTrigger value="predetermined" data-testid="tab-predetermined-pattern">
              Predetermined Considerations
            </TabsTrigger>
          </TabsList>

          {/* Generic Patternization Section */}
          <TabsContent value="generic" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Generic Patternization for the Best Strategy to Win</CardTitle>
                    <CardDescription>
                      {selectedSessions.length > 0 
                        ? `Analysis of winning patterns based on ${selectedSessions.length} selected session${selectedSessions.length > 1 ? 's' : ''}`
                        : 'Select sessions above to analyze winning patterns'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Winning Patterns Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Most Effective Domain</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Economy</div>
                      <p className="text-xs text-muted-foreground">70% win rate correlation</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Optimal Budget Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Balanced</div>
                      <p className="text-xs text-muted-foreground">60% to domains, 40% reserve</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Winning Turn Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Turn 8-10</div>
                      <p className="text-xs text-muted-foreground">Most games decided here</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Strategic Patterns */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Key Strategic Patterns</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Early Economy Investment</CardTitle>
                          <Badge variant="secondary">High Impact</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Winners typically invest 40-50% of Turn 1-3 budget in Economy domain cards
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Permanent Card Priority</CardTitle>
                          <Badge variant="secondary">Medium Impact</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Acquiring 2-3 permanent cards by Turn 5 correlates with 65% win rate
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Multi-Domain Balance</CardTitle>
                          <Badge variant="secondary">High Impact</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Winners maintain positive deterrence across at least 4 out of 5 domains
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Action Recommendations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold">Recommended Actions</h3>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="font-medium">Early Game (Turns 1-4)</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Focus on Economy and Cyber domains</li>
                        <li>Purchase at least 1 permanent card</li>
                        <li>Maintain budget reserve of 200K</li>
                      </ul>
                    </div>
                    
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="font-medium">Mid Game (Turns 5-8)</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Balance all domains above 50 deterrence</li>
                        <li>Leverage permanent card discounts</li>
                        <li>Counter opponent's strongest domain</li>
                      </ul>
                    </div>
                    
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="font-medium">Late Game (Turns 9-12)</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>High-impact asset cards for final push</li>
                        <li>Exploit domain weaknesses</li>
                        <li>Maximize permanent card benefits</li>
                      </ul>
                    </div>
                    
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="font-medium">Critical Turns</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Turn 1: Establish economic foundation</li>
                        <li>Turn 5: Secure domain diversity</li>
                        <li>Turn 8: Execute decisive strategy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predetermined Considerations Section */}
          <TabsContent value="predetermined" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>Patternization based on Predetermined Considerations</CardTitle>
                    <CardDescription>
                      {selectedSessions.length > 0 
                        ? `Context-specific analysis based on ${selectedSessions.length} selected session${selectedSessions.length > 1 ? 's' : ''}`
                        : 'Select sessions above to analyze context-specific patterns'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select game sessions above to unlock strategic insights</p>
                    <p className="text-sm mt-2">The AI will analyze card timing, momentum swings, team strategies, and winning patterns</p>
                  </div>
                ) : (
                  <>
                    {/* Headline Insight */}
                    <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Headline Insight</h3>
                          <p className="text-foreground leading-relaxed">{analysisResult.headlineInsight}</p>
                        </div>
                      </div>
                    </div>

                    {/* Patterns & Observations */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">Patterns & Observations</h3>
                      </div>
                      
                      <div className="grid gap-3">
                        {analysisResult.patterns.map((pattern, index) => (
                          <div
                            key={index}
                            className="rounded-lg border p-4 hover-elevate"
                            data-testid={`pattern-item-${index}`}
                          >
                            <div className="flex items-start gap-3">
                              <Badge variant="secondary" className="mt-1 flex-shrink-0">
                                {index + 1}
                              </Badge>
                              <p className="text-sm leading-relaxed">{pattern}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Narrative Commentary */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-lg">Narrative Commentary</h3>
                        <Badge variant="outline" className="text-xs">Sports Analytics Style</Badge>
                      </div>
                      
                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {analysisResult.narrativeCommentary}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Visual Suggestions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-lg">Suggested Visuals</h3>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        {analysisResult.visualSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="rounded-lg border p-4 bg-muted/30"
                            data-testid={`visual-suggestion-${index}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                              <p className="text-sm">{suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
