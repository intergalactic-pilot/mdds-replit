import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Brain, TrendingUp, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Analysis() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/database');
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
                      Analysis of winning patterns across all game sessions
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
                      Context-specific analysis based on strategic constraints and scenarios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scenario-Based Analysis */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Scenario-Based Strategic Patterns</h3>
                  
                  <div className="space-y-3">
                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Budget Constraint Scenarios (Low Budget)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          When operating under budget constraints (below 150K per domain):
                        </p>
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Priority Strategy</div>
                            <div className="text-muted-foreground">Focus on 2-3 domains, maximize permanent cards for efficiency</div>
                          </div>
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Expected Outcome</div>
                            <div className="text-muted-foreground">Win rate: 45% with specialized domain dominance</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Domain Focus Scenarios (Specific Domain Emphasis)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          When predetermined to emphasize a specific domain:
                        </p>
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Cyber Focus</div>
                            <div className="text-muted-foreground">Allocate 50% budget early, win rate: 58%</div>
                          </div>
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Economy Focus</div>
                            <div className="text-muted-foreground">Permanent card acquisition priority, win rate: 62%</div>
                          </div>
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Space Focus</div>
                            <div className="text-muted-foreground">Mid-game investment strategy, win rate: 52%</div>
                          </div>
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Cognitive Focus</div>
                            <div className="text-muted-foreground">Late-game impact maximization, win rate: 48%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Opponent Response Scenarios</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          When opponent demonstrates specific strategic patterns:
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">vs. Aggressive Early Spending</div>
                            <div className="text-muted-foreground">Counter: Conserve budget Turns 1-3, exploit mid-game weakness. Success rate: 68%</div>
                          </div>
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">vs. Balanced Approach</div>
                            <div className="text-muted-foreground">Counter: Identify and dominate 2 key domains. Success rate: 55%</div>
                          </div>
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">vs. Single Domain Focus</div>
                            <div className="text-muted-foreground">Counter: Build advantage in remaining 4 domains. Success rate: 72%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Turn-Limited Scenarios</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          When games have modified turn limits:
                        </p>
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Short Games (6-8 turns)</div>
                            <div className="text-muted-foreground">Aggressive asset purchases, skip permanents. Efficiency: 85%</div>
                          </div>
                          <div className="rounded border p-3">
                            <div className="font-medium mb-1">Extended Games (15+ turns)</div>
                            <div className="text-muted-foreground">Heavy permanent investment, long-term value. Efficiency: 92%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Conditional Recommendations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold">Conditional Recommendations</h3>
                  </div>
                  
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="font-medium">IF your budget is limited:</div>
                    <div className="text-sm text-muted-foreground pl-4 border-l-2">
                      THEN prioritize permanent cards for long-term efficiency gains and focus on 2-3 core domains
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="font-medium">IF opponent dominates one domain:</div>
                    <div className="text-sm text-muted-foreground pl-4 border-l-2">
                      THEN establish superiority in remaining domains and use expert advisors to counter their strength
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="font-medium">IF early game economy is weak:</div>
                    <div className="text-sm text-muted-foreground pl-4 border-l-2">
                      THEN shift to defensive posture, minimize spending Turns 2-4, accumulate budget for Turn 5+ surge
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="font-medium">IF approaching final turns with lead:</div>
                    <div className="text-sm text-muted-foreground pl-4 border-l-2">
                      THEN maintain balanced domain coverage, prevent opponent breakthrough opportunities
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
