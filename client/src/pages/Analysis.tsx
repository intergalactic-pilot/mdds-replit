import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Brain, TrendingUp, Lightbulb, Filter, CheckSquare, Square, Sparkles, Send, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { analyzeSelectedSessions, analyzeGenericPatterns, type SessionData } from "@/utils/sessionAnalyzer";
import { answerQuestion, type Message } from "@/utils/questionAnswerer";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions, isLoading } = useQuery<GameSession[]>({
    queryKey: ['/api/sessions'],
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const genericAnalysisResult = useMemo(() => {
    return analyzeGenericPatterns(selectedSessionsData);
  }, [selectedSessionsData]);

  const predeterminedAnalysisResult = useMemo(() => {
    return analyzeSelectedSessions(selectedSessionsData);
  }, [selectedSessionsData]);

  const handleAskQuestion = () => {
    if (!questionInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Get answer based on selected sessions data
    const answer = answerQuestion(questionInput, selectedSessionsData);

    // Add assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer,
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, assistantMessage]);
    }, 300);

    setQuestionInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

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
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="generic" data-testid="tab-generic-pattern">
              Generic Patternization
            </TabsTrigger>
            <TabsTrigger value="predetermined" data-testid="tab-predetermined-pattern">
              Predetermined Considerations
            </TabsTrigger>
            <TabsTrigger value="questions" data-testid="tab-ask-questions">
              Ask Questions
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
                {selectedSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select game sessions above to discover all winning strategies</p>
                    <p className="text-sm mt-2">The system will analyze every pattern and correlation without limitations</p>
                  </div>
                ) : (
                  <>
                    {/* Headline Insight */}
                    <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 p-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Headline Insight</h3>
                          <p className="text-foreground leading-relaxed">{genericAnalysisResult.headlineInsight}</p>
                        </div>
                      </div>
                    </div>

                    {/* Patterns & Observations */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-lg">All Winning Strategies & Correlations</h3>
                      </div>
                      
                      <div className="grid gap-3">
                        {genericAnalysisResult.patterns.map((pattern, index) => (
                          <div
                            key={index}
                            className="rounded-lg border p-4 hover-elevate"
                            data-testid={`generic-pattern-${index}`}
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
                        <Brain className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">Strategic Analysis</h3>
                      </div>
                      
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {genericAnalysisResult.narrativeCommentary}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
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
                          <p className="text-foreground leading-relaxed">{predeterminedAnalysisResult.headlineInsight}</p>
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
                        {predeterminedAnalysisResult.patterns.map((pattern, index) => (
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
                            {predeterminedAnalysisResult.narrativeCommentary}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ask Questions Section */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="flex flex-col" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <MessageSquare className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Ask Questions About Selected Sessions</CardTitle>
                    <CardDescription>
                      {selectedSessions.length > 0 
                        ? `Ask questions based on ${selectedSessions.length} selected session${selectedSessions.length > 1 ? 's' : ''} - answers are derived from real game data`
                        : 'Select sessions above to start asking questions'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {selectedSessions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center py-12 text-muted-foreground">
                    <div>
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Select game sessions above to start asking questions</p>
                      <p className="text-sm mt-2">All answers will be based on authentic data from your selected sessions</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 pr-4 mb-4">
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">Start by asking a question about your selected sessions.</p>
                            <p className="text-xs mt-2">Try: "Who won the games?" or "What were the final scores?"</p>
                          </div>
                        )}
                        
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            data-testid={`message-${message.role}-${message.id}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-line">{message.content}</p>
                              <p className="text-xs opacity-70 mt-2">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="border-t pt-4">
                      <div className="flex gap-2">
                        <Input
                          value={questionInput}
                          onChange={(e) => setQuestionInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask a question about the selected sessions..."
                          className="flex-1"
                          data-testid="input-question"
                        />
                        <Button
                          onClick={handleAskQuestion}
                          disabled={!questionInput.trim()}
                          data-testid="button-send-question"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Press Enter to send • All answers based on real session data
                      </p>
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
