import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FlaskConical, Filter, TrendingUp, BarChart3, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Domain } from '@shared/schema';

interface GameSession {
  sessionName: string;
  gameState: any;
  turnStatistics?: Array<{
    turn: number;
    natoTotalDeterrence: number;
    russiaTotalDeterrence: number;
    natoDeterrence: Record<Domain, number>;
    russiaDeterrence: Record<Domain, number>;
    timestamp: string;
  }>;
  sessionInfo?: {
    participants?: Array<{ name: string; team: string }>;
  };
  createdAt: string;
}

interface StatisticalTest {
  name: string;
  description: string;
  requirements: string[];
  appropriate: boolean;
  reason: string;
}

const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];

export default function Research() {
  const [, setLocation] = useLocation();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [sessionSearch, setSessionSearch] = useState("");
  const [winnerFilter, setWinnerFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Variable selection for analysis
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [groupingVariable, setGroupingVariable] = useState<string>("team");
  const [comparisonType, setComparisonType] = useState<string>("between");

  const { data: sessions, isLoading } = useQuery<GameSession[]>({
    queryKey: ['/api/sessions'],
  });

  const handleBack = () => {
    setLocation('/database');
  };

  const toggleSession = (sessionName: string) => {
    setSelectedSessions(prev =>
      prev.includes(sessionName)
        ? prev.filter(s => s !== sessionName)
        : [...prev, sessionName]
    );
  };

  const toggleVariable = (variable: string) => {
    setSelectedVariables(prev =>
      prev.includes(variable)
        ? prev.filter(v => v !== variable)
        : [...prev, variable]
    );
  };

  const selectAllSessions = () => {
    if (filteredSessions.length === selectedSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map(s => s.sessionName));
    }
  };

  const getWinner = (session: GameSession) => {
    const natoScore = session.gameState?.teams?.NATO?.totalDeterrence || 0;
    const russiaScore = session.gameState?.teams?.Russia?.totalDeterrence || 0;
    return natoScore > russiaScore ? "NATO" : natoScore < russiaScore ? "Russia" : "Tie";
  };

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    
    let filtered = [...sessions];
    
    if (sessionSearch) {
      filtered = filtered.filter(s => 
        s.sessionName.toLowerCase().includes(sessionSearch.toLowerCase())
      );
    }
    
    if (winnerFilter !== "all") {
      filtered = filtered.filter(s => getWinner(s) === winnerFilter);
    }
    
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
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [sessions, sessionSearch, winnerFilter, dateFilter]);

  // Available variables for analysis
  const availableVariables = [
    { id: "nato_total", label: "NATO Total Deterrence", category: "Overall" },
    { id: "russia_total", label: "Russia Total Deterrence", category: "Overall" },
    { id: "nato_joint", label: "NATO Joint Domain", category: "NATO Domains" },
    { id: "nato_economy", label: "NATO Economy Domain", category: "NATO Domains" },
    { id: "nato_cognitive", label: "NATO Cognitive Domain", category: "NATO Domains" },
    { id: "nato_space", label: "NATO Space Domain", category: "NATO Domains" },
    { id: "nato_cyber", label: "NATO Cyber Domain", category: "NATO Domains" },
    { id: "russia_joint", label: "Russia Joint Domain", category: "Russia Domains" },
    { id: "russia_economy", label: "Russia Economy Domain", category: "Russia Domains" },
    { id: "russia_cognitive", label: "Russia Cognitive Domain", category: "Russia Domains" },
    { id: "russia_space", label: "Russia Space Domain", category: "Russia Domains" },
    { id: "russia_cyber", label: "Russia Cyber Domain", category: "Russia Domains" },
    { id: "turn_count", label: "Number of Turns", category: "Session Metrics" },
    { id: "card_count", label: "Total Cards Purchased", category: "Card Tracking" },
  ];

  // Statistical test recommendations
  const getStatisticalRecommendations = (): StatisticalTest[] => {
    const numSessions = selectedSessions.length;
    const numVariables = selectedVariables.length;
    
    // Calculate actual number of groups based on grouping variable
    let numGroups = 2; // default for team
    if (groupingVariable === "team") {
      numGroups = 2; // NATO vs Russia
    } else if (groupingVariable === "winner") {
      // Count distinct winners from selected sessions
      const selectedSessionData = sessions?.filter(s => selectedSessions.includes(s.sessionName)) || [];
      const uniqueWinners = new Set(selectedSessionData.map(s => getWinner(s)));
      numGroups = uniqueWinners.size;
    } else if (groupingVariable === "session") {
      // Each session is a group
      numGroups = numSessions;
    }
    
    const tests: StatisticalTest[] = [
      {
        name: "Independent Samples t-test",
        description: "Compare means between two independent groups on a single continuous variable",
        requirements: [
          "Two independent groups",
          "One continuous dependent variable",
          "Normal distribution (or n ≥ 30)",
          "Homogeneity of variance"
        ],
        appropriate: numGroups === 2 && numVariables === 1 && numSessions >= 2,
        reason: numGroups !== 2 
          ? "Need exactly 2 groups"
          : numVariables !== 1
          ? "Need exactly 1 dependent variable"
          : numSessions < 2
          ? "Need at least 2 sessions"
          : "All requirements met"
      },
      {
        name: "Paired Samples t-test",
        description: "Compare means from the same group measured at different times or conditions",
        requirements: [
          "Two related measurements",
          "One continuous variable",
          "Normal distribution of differences",
          "Same subjects/sessions"
        ],
        appropriate: comparisonType === "within" && numVariables === 1 && numSessions >= 2,
        reason: comparisonType !== "within"
          ? "Need within-subjects comparison"
          : numVariables !== 1
          ? "Need exactly 1 variable"
          : numSessions < 2
          ? "Need at least 2 sessions"
          : "All requirements met"
      },
      {
        name: "One-Way ANOVA",
        description: "Compare means across three or more independent groups on a single variable",
        requirements: [
          "Three or more independent groups",
          "One continuous dependent variable",
          "Normal distribution in each group",
          "Homogeneity of variance"
        ],
        appropriate: numGroups >= 3 && numVariables === 1 && numSessions >= 3,
        reason: numGroups < 3
          ? "Need at least 3 groups"
          : numVariables !== 1
          ? "Need exactly 1 dependent variable"
          : numSessions < 3
          ? "Need at least 3 sessions"
          : "All requirements met"
      },
      {
        name: "Repeated Measures ANOVA",
        description: "Compare means across three or more time points or conditions (same subjects)",
        requirements: [
          "Three or more repeated measurements",
          "One continuous variable",
          "Sphericity assumption",
          "Normal distribution"
        ],
        appropriate: comparisonType === "within" && numSessions >= 3 && numVariables === 1,
        reason: comparisonType !== "within"
          ? "Need within-subjects design"
          : numSessions < 3
          ? "Need at least 3 sessions"
          : numVariables !== 1
          ? "Need exactly 1 variable"
          : "All requirements met"
      },
      {
        name: "MANOVA (Multivariate ANOVA)",
        description: "Compare group means across multiple dependent variables simultaneously",
        requirements: [
          "Two or more independent groups",
          "Two or more continuous dependent variables",
          "Multivariate normality",
          "Homogeneity of covariance matrices"
        ],
        appropriate: numGroups >= 2 && numVariables >= 2 && numSessions >= 2,
        reason: numGroups < 2
          ? "Need at least 2 groups"
          : numVariables < 2
          ? "Need at least 2 dependent variables"
          : numSessions < 2
          ? "Need at least 2 sessions"
          : "All requirements met"
      },
      {
        name: "Two-Way ANOVA",
        description: "Examine effects of two independent variables on one dependent variable",
        requirements: [
          "Two categorical independent variables (factors)",
          "One continuous dependent variable",
          "Independent observations",
          "Normal distribution and homogeneity of variance"
        ],
        appropriate: false,
        reason: "Requires two independent grouping factors - current interface supports only one factor. To use Two-Way ANOVA, analyze sessions with multiple categorical variables (e.g., team × domain, winner × time period) using external statistical software."
      },
      {
        name: "Correlation Analysis (Pearson/Spearman)",
        description: "Measure strength and direction of relationship between two continuous variables",
        requirements: [
          "Two continuous variables",
          "Linear relationship (Pearson) or monotonic (Spearman)",
          "Independent observations"
        ],
        appropriate: numVariables === 2 && numSessions >= 3,
        reason: numVariables !== 2
          ? "Need exactly 2 variables"
          : numSessions < 3
          ? "Need at least 3 sessions for meaningful correlation"
          : "All requirements met"
      },
      {
        name: "Multiple Regression",
        description: "Predict one variable from multiple predictor variables",
        requirements: [
          "One continuous dependent variable",
          "One or more independent variables",
          "Linear relationship",
          "No multicollinearity among predictors"
        ],
        appropriate: numVariables >= 2 && numSessions >= numVariables * 5,
        reason: numVariables < 2
          ? "Need at least 2 variables (1 dependent + 1 predictor)"
          : numSessions < numVariables * 5
          ? `Need at least ${numVariables * 5} sessions (5× number of variables)`
          : "All requirements met"
      },
      {
        name: "Chi-Square Test",
        description: "Test association between categorical variables",
        requirements: [
          "Two or more categorical variables",
          "Independent observations",
          "Expected frequency ≥ 5 in each cell"
        ],
        appropriate: groupingVariable !== "" && numSessions >= 5,
        reason: groupingVariable === ""
          ? "Need categorical grouping variable"
          : numSessions < 5
          ? "Need at least 5 sessions for adequate cell frequencies"
          : "Appropriate for winner × dimension analysis"
      },
      {
        name: "Mann-Whitney U Test (Non-parametric)",
        description: "Compare distributions between two groups when data is not normally distributed",
        requirements: [
          "Two independent groups",
          "One ordinal or continuous variable",
          "No assumption of normality"
        ],
        appropriate: numGroups === 2 && numVariables === 1 && numSessions >= 2,
        reason: numGroups !== 2
          ? "Need exactly 2 groups"
          : numVariables !== 1
          ? "Need exactly 1 variable"
          : numSessions < 2
          ? "Need at least 2 sessions"
          : "Robust alternative to t-test when normality is violated"
      },
      {
        name: "Kruskal-Wallis Test (Non-parametric)",
        description: "Compare distributions across three or more groups (non-parametric alternative to ANOVA)",
        requirements: [
          "Three or more independent groups",
          "One ordinal or continuous variable",
          "No assumption of normality"
        ],
        appropriate: numGroups >= 3 && numVariables === 1 && numSessions >= 3,
        reason: numGroups < 3
          ? "Need at least 3 groups"
          : numVariables !== 1
          ? "Need exactly 1 variable"
          : numSessions < 3
          ? "Need at least 3 sessions"
          : "Robust alternative to ANOVA when normality is violated"
      }
    ];

    return tests.sort((a, b) => {
      if (a.appropriate && !b.appropriate) return -1;
      if (!a.appropriate && b.appropriate) return 1;
      return 0;
    });
  };

  const statisticalTests = useMemo(() => getStatisticalRecommendations(), [
    selectedSessions,
    selectedVariables.length,
    groupingVariable,
    comparisonType,
    sessions
  ]);

  // Calculate summary statistics for selected sessions and variables
  const calculateSummaryStats = () => {
    if (selectedSessions.length === 0 || selectedVariables.length === 0) return null;

    const selectedSessionData = sessions?.filter(s => selectedSessions.includes(s.sessionName)) || [];
    const stats: Record<string, any> = {};

    selectedVariables.forEach(varId => {
      const values: number[] = [];
      
      selectedSessionData.forEach(session => {
        if (varId === "nato_total") {
          values.push(session.gameState?.teams?.NATO?.totalDeterrence || 0);
        } else if (varId === "russia_total") {
          values.push(session.gameState?.teams?.Russia?.totalDeterrence || 0);
        } else if (varId.startsWith("nato_")) {
          const domain = varId.replace("nato_", "") as Domain;
          values.push(session.gameState?.teams?.NATO?.deterrence?.[domain] || 0);
        } else if (varId.startsWith("russia_")) {
          const domain = varId.replace("russia_", "") as Domain;
          values.push(session.gameState?.teams?.Russia?.deterrence?.[domain] || 0);
        } else if (varId === "turn_count") {
          values.push(session.gameState?.turn || 0);
        } else if (varId === "card_count") {
          const natoCards = session.gameState?.strategyLog?.filter((log: any) => log.team === "NATO").length || 0;
          const russiaCards = session.gameState?.strategyLog?.filter((log: any) => log.team === "Russia").length || 0;
          values.push(natoCards + russiaCards);
        }
      });

      if (values.length > 0) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const sortedValues = [...values].sort((a, b) => a - b);
        const median = sortedValues.length % 2 === 0
          ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
          : sortedValues[Math.floor(sortedValues.length / 2)];
        
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const min = Math.min(...values);
        const max = Math.max(...values);

        stats[varId] = {
          label: availableVariables.find(v => v.id === varId)?.label || varId,
          n: values.length,
          mean: mean.toFixed(2),
          median: median.toFixed(2),
          stdDev: stdDev.toFixed(2),
          min: min.toFixed(2),
          max: max.toFixed(2),
          range: (max - min).toFixed(2)
        };
      }
    });

    return stats;
  };

  const summaryStats = useMemo(() => calculateSummaryStats(), [
    selectedSessions,
    selectedVariables,
    sessions
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FlaskConical className="w-8 h-8" />
              Statistical Research Dashboard
            </h1>
            <p className="text-muted-foreground">
              Filter sessions, select variables, and determine appropriate statistical tests
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Panel: Session Filtering */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Sessions
                </CardTitle>
                <CardDescription>Select sessions for analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Sessions</Label>
                  <Input
                    placeholder="Search by name..."
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    data-testid="input-session-search"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger data-testid="select-date-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="3months">Past 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Winner Filter</Label>
                  <Select value={winnerFilter} onValueChange={setWinnerFilter}>
                    <SelectTrigger data-testid="select-winner-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Winners</SelectItem>
                      <SelectItem value="NATO">NATO Wins</SelectItem>
                      <SelectItem value="Russia">Russia Wins</SelectItem>
                      <SelectItem value="Tie">Ties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllSessions}
                    data-testid="button-select-all-sessions"
                  >
                    <ListChecks className="w-4 h-4 mr-2" />
                    {selectedSessions.length === filteredSessions.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Badge variant="secondary">
                    {selectedSessions.length} / {filteredSessions.length} selected
                  </Badge>
                </div>

                <ScrollArea className="h-64 border rounded-md p-2">
                  <div className="space-y-2">
                    {filteredSessions.map(session => (
                      <div
                        key={session.sessionName}
                        className="flex items-start gap-2 p-2 rounded hover-elevate"
                      >
                        <Checkbox
                          checked={selectedSessions.includes(session.sessionName)}
                          onCheckedChange={() => toggleSession(session.sessionName)}
                          data-testid={`checkbox-session-${session.sessionName}`}
                        />
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => toggleSession(session.sessionName)}
                        >
                          <p className="text-sm font-medium truncate">{session.sessionName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {getWinner(session)}
                            </Badge>
                            <span>Turn {session.gameState?.turn || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Variable Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Select Variables
                </CardTitle>
                <CardDescription>Choose parameters to analyze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <Select value={comparisonType} onValueChange={setComparisonType}>
                    <SelectTrigger data-testid="select-comparison-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="between">Between-Subjects</SelectItem>
                      <SelectItem value="within">Within-Subjects</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grouping Variable</Label>
                  <Select value={groupingVariable} onValueChange={setGroupingVariable}>
                    <SelectTrigger data-testid="select-grouping-variable">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team">Team (NATO vs Russia)</SelectItem>
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="winner">Winner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-96 border rounded-md p-2">
                  <div className="space-y-3">
                    {Object.entries(
                      availableVariables.reduce((acc, variable) => {
                        if (!acc[variable.category]) acc[variable.category] = [];
                        acc[variable.category].push(variable);
                        return acc;
                      }, {} as Record<string, typeof availableVariables>)
                    ).map(([category, variables]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">{category}</p>
                        {variables.map(variable => (
                          <div
                            key={variable.id}
                            className="flex items-center gap-2 p-1 rounded hover-elevate"
                          >
                            <Checkbox
                              checked={selectedVariables.includes(variable.id)}
                              onCheckedChange={() => toggleVariable(variable.id)}
                              data-testid={`checkbox-variable-${variable.id}`}
                            />
                            <Label 
                              className="text-sm cursor-pointer flex-1"
                              onClick={() => toggleVariable(variable.id)}
                            >
                              {variable.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Analysis Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary Statistics */}
            {summaryStats && Object.keys(summaryStats).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Descriptive Statistics
                  </CardTitle>
                  <CardDescription>
                    Summary statistics for selected variables across {selectedSessions.length} session(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {Object.entries(summaryStats).map(([varId, stats]: [string, any]) => (
                        <div key={varId} className="border rounded-lg p-4 space-y-2">
                          <h3 className="font-semibold text-sm">{stats.label}</h3>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">N</p>
                              <p className="font-mono font-semibold">{stats.n}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Mean</p>
                              <p className="font-mono font-semibold">{stats.mean}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Median</p>
                              <p className="font-mono font-semibold">{stats.median}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">SD</p>
                              <p className="font-mono font-semibold">{stats.stdDev}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Min</p>
                              <p className="font-mono font-semibold">{stats.min}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Max</p>
                              <p className="font-mono font-semibold">{stats.max}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Range</p>
                              <p className="font-mono font-semibold">{stats.range}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Statistical Test Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  Statistical Test Recommendations
                </CardTitle>
                <CardDescription>
                  Based on your selection: {selectedSessions.length} session(s), {selectedVariables.length} variable(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {statisticalTests.map((test, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 space-y-2 ${
                          test.appropriate
                            ? 'border-green-500/50 bg-green-500/5'
                            : 'border-muted bg-muted/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                              {test.name}
                              {test.appropriate && (
                                <Badge variant="default" className="bg-green-600">
                                  Recommended
                                </Badge>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {test.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold">Requirements:</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                            {test.requirements.map((req, i) => (
                              <li key={i} className="list-disc">{req}</li>
                            ))}
                          </ul>
                        </div>

                        <div className={`text-xs p-2 rounded ${
                          test.appropriate
                            ? 'bg-green-600/10 text-green-700 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <span className="font-semibold">Assessment: </span>
                          {test.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
