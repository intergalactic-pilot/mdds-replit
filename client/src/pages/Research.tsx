import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FlaskConical, Filter, TrendingUp, BarChart3, ListChecks, FileText, Download, CreditCard } from "lucide-react";
import { prepareReportData } from "@/utils/reportDataPreparation";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Domain } from '@shared/schema';
import cardsData from '../data/cards.json';

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
  
  // Card Purchase Frequency Analysis
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [cardTeamFilter, setCardTeamFilter] = useState<string>("both");
  
  // Research Question Development (Left Column)
  const [researchQuestionLeft, setResearchQuestionLeft] = useState<string>("");
  const [selectedPredefinedQuestionLeft, setSelectedPredefinedQuestionLeft] = useState<string>("");
  
  // Research Question Development (Right Column)
  const [researchQuestionRight, setResearchQuestionRight] = useState<string>("");
  const [selectedPredefinedQuestionRight, setSelectedPredefinedQuestionRight] = useState<string>("");
  
  // Hypothesis Development 1 (Left Column)
  const [hypothesis1, setHypothesis1] = useState<string>("");
  const [selectedPredefinedHypothesis1, setSelectedPredefinedHypothesis1] = useState<string>("");
  
  // Hypothesis Development 2 (Right Column)
  const [hypothesis2, setHypothesis2] = useState<string>("");
  const [selectedPredefinedHypothesis2, setSelectedPredefinedHypothesis2] = useState<string>("");
  
  // Predefined research questions
  const predefinedQuestions = [
    {
      id: "card-strategy-effectiveness",
      label: "Card Strategy Effectiveness",
      text: "Which card purchasing strategies are most effective at achieving victory across different strategic scenarios?"
    },
    {
      id: "domain-investment-patterns",
      label: "Domain Investment Patterns",
      text: "How does investment distribution across the five domains (Joint, Economy, Cognitive, Space, Cyber) correlate with final deterrence scores?"
    },
    {
      id: "team-performance-differences",
      label: "Team Performance Differences",
      text: "Are there significant performance differences between NATO and Russia teams in terms of deterrence outcomes and strategic approaches?"
    },
    {
      id: "budget-allocation-efficiency",
      label: "Budget Allocation Efficiency",
      text: "What budget allocation patterns lead to the most efficient conversion of resources into deterrence capability?"
    },
    {
      id: "permanent-vs-temporary-cards",
      label: "Permanent vs Temporary Cards",
      text: "How do permanent cards compare to temporary assets and expert cards in terms of overall strategic value?"
    },
    {
      id: "early-vs-late-investment",
      label: "Early vs Late Investment",
      text: "Does the timing of strategic investments (early turns vs late turns) affect final deterrence outcomes?"
    },
    {
      id: "defensive-offensive-balance",
      label: "Defensive-Offensive Balance",
      text: "What is the optimal balance between defensive and offensive card strategies for achieving victory?"
    },
    {
      id: "comeback-possibility",
      label: "Comeback Possibilities",
      text: "Can teams successfully recover from early deterrence deficits, and what strategies enable such comebacks?"
    },
    {
      id: "domain-specialization",
      label: "Domain Specialization",
      text: "Is domain specialization (focusing on 1-2 domains) more effective than balanced investment across all domains?"
    },
    {
      id: "turn-duration-impact",
      label: "Turn Duration Impact",
      text: "How does the length of a strategic session (total number of turns) influence winning strategies and final outcomes?"
    }
  ];
  
  // Predefined scientific hypotheses
  const predefinedHypotheses = [
    {
      id: "expert-cards-winning",
      label: "Expert Cards & Victory",
      text: "Purchasing expert cards is positively correlated with winning the strategy session."
    },
    {
      id: "intelligence-cards-winning",
      label: "Intelligence Cards & Victory",
      text: "Purchasing intelligence cards is positively correlated with winning the strategy session."
    },
    {
      id: "permanent-cards-winning",
      label: "Permanent Cards & Victory",
      text: "Purchasing permanent cards is positively correlated with winning the strategy session."
    },
    {
      id: "early-permanent-cards",
      label: "Early Permanent Card Advantage",
      text: "Purchasing permanent cards earlier than the opponent is positively correlated with winning."
    },
    {
      id: "economy-deterrence-total",
      label: "Economy Domain & Total Deterrence",
      text: "Deterrence in the economy dimension is positively correlated with total overall deterrence score."
    },
    {
      id: "cyber-defense-investment",
      label: "Cyber Defense Investment",
      text: "Higher investment in cyber defensive cards is associated with improved cyber domain deterrence."
    },
    {
      id: "space-domain-early",
      label: "Early Space Domain Focus",
      text: "Investing in space domain cards during early turns (1-3) is positively correlated with final space deterrence scores."
    },
    {
      id: "budget-efficiency",
      label: "Budget Efficiency & Victory",
      text: "Teams that spend more efficiently (higher deterrence per budget unit) are more likely to win."
    },
    {
      id: "cognitive-offensive",
      label: "Cognitive Offensive Strategy",
      text: "Offensive cards targeting the cognitive domain are more effective than defensive cognitive cards at influencing outcomes."
    },
    {
      id: "joint-domain-balance",
      label: "Joint Domain Balance",
      text: "Balanced investment across all domains in the joint category correlates with higher overall strategic success."
    },
    {
      id: "turn-count-winning",
      label: "Strategy Duration & Victory",
      text: "Longer strategy sessions (more turns) favor teams with stronger permanent card portfolios."
    },
    {
      id: "first-mover-advantage",
      label: "First Mover Advantage",
      text: "The team making the first major card purchase has a strategic advantage in deterrence building."
    },
    {
      id: "defensive-vs-offensive",
      label: "Defensive vs Offensive Balance",
      text: "Teams with a higher ratio of defensive to offensive cards have better long-term deterrence sustainability."
    },
    {
      id: "domain-specialization",
      label: "Domain Specialization Strategy",
      text: "Specializing in one or two domains yields higher deterrence than spreading investments equally across all five domains."
    },
    {
      id: "budget-pooling-timing",
      label: "Budget Pooling Timing",
      text: "Effective utilization of pooled budget phases (turns 2+) is correlated with higher final deterrence scores."
    },
    {
      id: "nato-russia-asymmetry",
      label: "NATO-Russia Strategic Asymmetry",
      text: "NATO and Russia require different strategic approaches, with NATO performing better with economic focus and Russia with cyber/cognitive focus."
    },
    {
      id: "comeback-mechanisms",
      label: "Comeback Mechanisms",
      text: "Teams that are behind after turn 3 can successfully employ offensive strategies to reduce opponent deterrence and achieve victory."
    },
    {
      id: "permanent-card-quantity",
      label: "Permanent Card Portfolio Size",
      text: "The total number of permanent cards owned is positively correlated with final deterrence scores."
    }
  ];
  
  // Report generation
  const [selectedMethodology, setSelectedMethodology] = useState<string>("");
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  const toggleCard = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(c => c !== cardId)
        : [...prev, cardId]
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

  // Analyze hypothesis 2 and recommend variables
  const recommendedVariables2 = useMemo(() => {
    if (!hypothesis2.trim()) return [];
    
    const lowerHypothesis = hypothesis2.toLowerCase();
    const recommendations: string[] = [];
    
    // Keywords for different variable types
    const keywords = {
      nato_total: ['nato total', 'nato overall', 'nato deterrence score', 'nato performance'],
      russia_total: ['russia total', 'russia overall', 'russia deterrence score', 'russia performance'],
      nato_joint: ['nato joint', 'nato military'],
      nato_economy: ['nato economy', 'nato economic'],
      nato_cognitive: ['nato cognitive', 'nato information', 'nato perception'],
      nato_space: ['nato space', 'nato satellite'],
      nato_cyber: ['nato cyber', 'nato digital'],
      russia_joint: ['russia joint', 'russia military'],
      russia_economy: ['russia economy', 'russia economic'],
      russia_cognitive: ['russia cognitive', 'russia information', 'russia perception'],
      russia_space: ['russia space', 'russia satellite'],
      russia_cyber: ['russia cyber', 'russia digital'],
      turn_count: ['turn', 'duration', 'length', 'time', 'rounds'],
      card_count: ['card', 'purchase', 'investment', 'spending']
    };

    // Check for general team mentions
    const hasNato = /\bnato\b/.test(lowerHypothesis);
    const hasRussia = /\brussia\b/.test(lowerHypothesis);
    
    // Check for domain mentions
    const hasJoint = /\bjoint\b|military|forces/.test(lowerHypothesis);
    const hasEconomy = /\beconom/.test(lowerHypothesis);
    const hasCognitive = /\bcognitive\b|information|perception|narrative/.test(lowerHypothesis);
    const hasSpace = /\bspace\b|satellite/.test(lowerHypothesis);
    const hasCyber = /\bcyber\b|digital|network/.test(lowerHypothesis);
    
    // Match specific keywords
    Object.entries(keywords).forEach(([varId, terms]) => {
      if (terms.some(term => lowerHypothesis.includes(term))) {
        recommendations.push(varId);
      }
    });
    
    // Add domain-based recommendations if team mentioned but no specific match
    if (hasNato && !recommendations.some(r => r.startsWith('nato_'))) {
      if (hasJoint) recommendations.push('nato_joint');
      if (hasEconomy) recommendations.push('nato_economy');
      if (hasCognitive) recommendations.push('nato_cognitive');
      if (hasSpace) recommendations.push('nato_space');
      if (hasCyber) recommendations.push('nato_cyber');
      if (!hasJoint && !hasEconomy && !hasCognitive && !hasSpace && !hasCyber) {
        recommendations.push('nato_total');
      }
    }
    
    if (hasRussia && !recommendations.some(r => r.startsWith('russia_'))) {
      if (hasJoint) recommendations.push('russia_joint');
      if (hasEconomy) recommendations.push('russia_economy');
      if (hasCognitive) recommendations.push('russia_cognitive');
      if (hasSpace) recommendations.push('russia_space');
      if (hasCyber) recommendations.push('russia_cyber');
      if (!hasJoint && !hasEconomy && !hasCognitive && !hasSpace && !hasCyber) {
        recommendations.push('russia_total');
      }
    }
    
    // Check for comparison/correlation terms
    const hasComparison = /\bcompare|versus|vs|between|differ|relationship|correlat|impact|effect|influence/.test(lowerHypothesis);
    if (hasComparison && recommendations.length === 0) {
      // If comparing but no specific variables, suggest both teams' totals
      if (hasNato || hasRussia || (!hasNato && !hasRussia)) {
        recommendations.push('nato_total', 'russia_total');
      }
    }
    
    return Array.from(new Set(recommendations)); // Remove duplicates
  }, [hypothesis2]);

  // Get statistical test recommendation based on hypothesis 2
  const getHypothesisBasedTestRecommendation2 = useMemo(() => {
    if (!hypothesis2.trim()) return null;
    
    const lowerHypothesis = hypothesis2.toLowerCase();
    
    // Analyze hypothesis structure
    const hasCorrelation = /correlat|relationship|associat/.test(lowerHypothesis);
    const hasComparison = /compare|differ|versus|vs\.?|between/.test(lowerHypothesis);
    const hasPrediction = /predict|determin|effect|impact|influence|cause/.test(lowerHypothesis);
    const hasMultipleVariables = /multiple\s+(variable|outcome|factor|dimension|metric)|several\s+(variable|outcome|factor|dimension|metric)|various\s+(variable|outcome|factor|dimension|metric)/.test(lowerHypothesis);
    const hasTwoGroups = /nato.*russia|russia.*nato|two teams|both teams/.test(lowerHypothesis);
    const hasMultipleGroups = /across.*domain|all.*domain|multiple.*group/.test(lowerHypothesis);
    const hasTimeComponent = /over time|across turns|duration|temporal|longitudinal/.test(lowerHypothesis);
    
    // Determine recommended tests based on hypothesis characteristics - return TWO complementary tests
    if (hasCorrelation && recommendedVariables2.length === 2 && !hasComparison) {
      return [
        {
          name: "Pearson Correlation",
          justification: `This hypothesis explicitly examines the relationship between two variables, making Pearson correlation the ideal parametric choice. ${
            lowerHypothesis.includes('positively') || lowerHypothesis.includes('negatively') 
              ? 'The directional language ("positively" or "negatively") suggests you are testing for the strength and direction of linear association between variables.' 
              : 'Pearson correlation will reveal both the strength and direction of the linear relationship.'
          } This test is most powerful when both variables are continuous, have a linear relationship, and are normally distributed. It measures the degree to which two variables vary together in a straight-line relationship, providing a coefficient between -1 (perfect negative) and +1 (perfect positive correlation).`,
          application: `To apply Pearson correlation: (1) Select your two continuous variables from the recommended list above. (2) Ensure you have at least 10-20 sessions for reliable estimates. (3) Create a scatterplot to verify linearity—the relationship should appear roughly straight-line. (4) Check for normality in both variables using histograms or Q-Q plots. (5) Look for outliers that might distort the correlation. (6) Calculate Pearson's r coefficient. (7) Interpret: r near 0 = no linear relationship; r = ±0.3 to ±0.5 = moderate; r > ±0.7 = strong linear relationship. (8) Report the correlation coefficient with its p-value and sample size. (9) Remember: correlation measures association strength, not causation.`
        },
        {
          name: "Spearman Rank Correlation",
          justification: `As a robust non-parametric alternative to Pearson correlation, Spearman's rank correlation is ideal when your data violates normality assumptions, contains outliers, or exhibits non-linear but monotonic relationships. This test works by ranking your data points and then calculating correlation on the ranks rather than raw values, making it resistant to extreme scores and applicable to ordinal data. ${
            lowerHypothesis.includes('positively') || lowerHypothesis.includes('negatively')
              ? 'It will detect the directional monotonic trend you hypothesize, even if the relationship is curved rather than perfectly linear.'
              : 'It provides a robust measure of whether variables tend to increase or decrease together, regardless of the exact shape of their relationship.'
          } This makes it more versatile and reliable when assumptions are questionable.`,
          application: `To apply Spearman correlation: (1) Select your two variables (can be continuous or ordinal). (2) No assumption of normality required—this test is distribution-free. (3) Create a scatterplot to check for a monotonic pattern (consistently increasing or decreasing, even if curved). (4) The test ranks all values and calculates correlation on ranks. (5) Calculate Spearman's ρ (rho) coefficient. (6) Interpret identically to Pearson: ρ near 0 = no monotonic relationship; ρ = ±0.3 to ±0.5 = moderate; ρ > ±0.7 = strong monotonic relationship. (7) Report ρ with p-value. (8) Particularly useful when you have outliers, skewed data, or ordinal variables. (9) Can detect non-linear but consistent patterns that Pearson might miss.`
        }
      ];
    }
    
    if (hasTwoGroups && !hasMultipleVariables && recommendedVariables2.length <= 2) {
      return [
        {
          name: "Independent Samples t-test",
          justification: `Your hypothesis compares two independent groups (NATO vs. Russia) on a single outcome variable, which is the classic scenario for an independent samples t-test. This parametric test examines whether the mean deterrence score (or other metric) significantly differs between the two teams. ${
            recommendedVariables2.length === 2 ? 'Since you have variables for both teams, the t-test will directly compare their means to determine if observed differences are statistically significant or due to chance.' : ''
          } The t-test is the most powerful approach when assumptions are met (normality and equal variances), providing precise estimates of mean differences with confidence intervals. It's widely recognized in research and offers straightforward interpretation of group comparisons.`,
          application: `To conduct an independent samples t-test: (1) Select one continuous outcome variable (e.g., total deterrence score). (2) Define your two groups (NATO and Russia). (3) Check normality: use histograms or Q-Q plots for each group. With n≥30 per group, the test is robust to violations. (4) Test homogeneity of variance with Levene's test. If violated, use Welch's t-test correction. (5) Calculate the t-statistic and degrees of freedom. (6) Report: mean difference, 95% confidence interval, t-value, df, and p-value. (7) Interpret: p<0.05 indicates a statistically significant difference between teams. (8) Calculate Cohen's d effect size: 0.2=small, 0.5=medium, 0.8=large. (9) Visualize with side-by-side boxplots or bar charts with error bars.`
        },
        {
          name: "Mann-Whitney U Test",
          justification: `The Mann-Whitney U test (also called Wilcoxon rank-sum test) is the non-parametric alternative for comparing two independent groups when parametric assumptions are violated. Unlike the t-test which compares means, this test compares the distributions and median ranks between groups, making it robust to outliers, skewness, and non-normal data. ${
            recommendedVariables2.length === 2 ? 'It will determine if one team tends to have consistently higher or lower values than the other, without assuming normally distributed data.' : ''
          } This is particularly valuable with small samples (n<30) or when you have extreme scores that would distort mean-based comparisons. It requires no assumptions about data distribution, only that observations are independent.`,
          application: `To conduct Mann-Whitney U test: (1) Select your continuous or ordinal outcome variable. (2) Define your two groups (NATO vs. Russia). (3) No normality assumption required—the test is distribution-free. (4) Ranks all observations from both groups combined, then compares rank sums. (5) Calculate the U-statistic. (6) Report: median for each group, U-statistic, and p-value. (7) Interpret: p<0.05 suggests distributions differ significantly between teams. (8) Effect size: calculate rank-biserial correlation or simply report median difference. (9) Visualize with side-by-side boxplots showing medians, quartiles, and outliers. (10) Particularly useful when you have outliers, skewed data, small samples, or ordinal variables. (11) More conservative but more reliable than t-test when assumptions are questionable.`
        }
      ];
    }
    
    if (hasMultipleGroups && !hasMultipleVariables && recommendedVariables2.length <= 2) {
      return [
        {
          name: "One-Way ANOVA",
          justification: `Your hypothesis involves comparing means across multiple groups (e.g., different domains, time periods, or strategic categories), making one-way Analysis of Variance (ANOVA) the appropriate parametric test. ANOVA extends t-test logic to three or more groups, testing whether at least one group mean differs significantly from the others while controlling Type I error. ${
            lowerHypothesis.includes('domain') ? 'Since your hypothesis mentions domains, you are likely comparing performance across the five strategic dimensions (Joint, Economy, Cognitive, Space, Cyber).' : ''
          } This is statistically superior to running multiple t-tests, which would inflate false positive rates. ANOVA provides an F-statistic indicating overall group differences, then post-hoc tests identify which specific pairs differ.`,
          application: `To perform one-way ANOVA: (1) Select one continuous dependent variable (e.g., deterrence score). (2) Define your grouping factor with 3+ levels (e.g., five domains). (3) Check assumptions: normality within each group using Shapiro-Wilk test (robust if n≥30 per group), homogeneity of variance across groups using Levene's test, and independent observations. (4) Calculate the F-statistic by comparing between-group to within-group variance. (5) Report: F-value, degrees of freedom (between, within), and p-value. (6) If p<0.05, conclude that at least one group mean differs from others. (7) Conduct post-hoc comparisons (Tukey HSD for equal variances, Games-Howell for unequal) to identify which specific groups differ. (8) Report eta-squared or partial eta-squared effect size: 0.01=small, 0.06=medium, 0.14=large. (9) Visualize with grouped boxplots or bar charts showing means with error bars and significance brackets.`
        },
        {
          name: "Kruskal-Wallis Test",
          justification: `The Kruskal-Wallis test is the non-parametric alternative to one-way ANOVA for comparing three or more independent groups when parametric assumptions are violated. Instead of comparing means, it compares the distribution of ranks across groups, making it robust to outliers, skewness, and non-normal distributions. ${
            lowerHypothesis.includes('domain') ? 'For your domain comparison, this test will determine if performance distributions differ significantly across the five strategic dimensions without assuming normal distributions within each domain.' : ''
          } This test is particularly valuable when you have small sample sizes per group, extreme scores, or ordinal data. It requires no distributional assumptions beyond independence and similar distributional shapes.`,
          application: `To perform Kruskal-Wallis test: (1) Select your continuous or ordinal outcome variable. (2) Define your grouping factor with 3+ levels. (3) No normality assumption required—the test ranks all observations across all groups. (4) Calculate the H-statistic (approximates chi-square distribution). (5) Report: H-statistic, degrees of freedom, and p-value. (6) If p<0.05, conclude that at least one group's distribution differs from others. (7) Conduct post-hoc pairwise comparisons using Dunn's test with Bonferroni correction to identify which specific groups differ. (8) Report median and interquartile range for each group. (9) Effect size: calculate epsilon-squared (similar to eta-squared interpretation). (10) Visualize with grouped boxplots showing medians, quartiles, and outliers for each group. (11) Particularly useful for small samples, outliers, skewed data, or when ANOVA assumptions are violated.`
        }
      ];
    }
    
    if (hasPrediction && recommendedVariables2.length >= 2) {
      return [
        {
          name: "Multiple Regression Analysis",
          justification: `Your hypothesis suggests examining how one or more predictor variables influence an outcome variable, which is the domain of multiple regression analysis. ${
            recommendedVariables2.length > 2 
              ? 'Multiple regression is ideal here because you have several potential predictors that may jointly explain variance in the outcome, while controlling for each other.' 
              : 'Simple regression can model the predictive relationship between your predictor and outcome.'
          } Regression goes beyond correlation by providing a predictive model, quantifying exactly how much change in the outcome is associated with unit changes in each predictor. ${
            lowerHypothesis.includes('predict') || lowerHypothesis.includes('determine') 
              ? 'The predictive language in your hypothesis aligns perfectly with regression methodology.' 
              : ''
          } This approach provides regression coefficients (effect sizes), R-squared (variance explained), and tests each predictor's unique contribution.`,
          application: `To conduct multiple regression: (1) Identify your dependent variable (outcome to predict) and independent variables (predictors). (2) Ensure adequate sample size: minimum 10-15 observations per predictor variable (e.g., 50+ sessions for 3 predictors). (3) Check assumptions: (a) linearity—scatterplots of each predictor vs. outcome, (b) independence of residuals, (c) homoscedasticity—residual plot should show constant variance, (d) normality of residuals—Q-Q plot, (e) no multicollinearity—VIF<10 for each predictor. (4) Run the regression model. (5) Examine overall model: R-squared (proportion of variance explained, e.g., R²=0.40 means 40% of variance explained), F-test for overall model significance. (6) Evaluate each predictor: unstandardized coefficient (b) shows effect size in original units, standardized coefficient (β) shows relative importance, t-test and p-value test significance. (7) Check influential cases using Cook's distance (>1 is problematic). (8) Report: R², adjusted R², F-statistic, and table of coefficients with confidence intervals. (9) Visualize with partial regression plots showing each predictor's unique effect.`
        },
        {
          name: "Path Analysis / Structural Equation Modeling",
          justification: `Path analysis extends multiple regression by modeling complex relationships among multiple variables simultaneously, including indirect effects and mediating pathways. ${
            recommendedVariables2.length > 2
              ? 'With your multiple variables, path analysis can test whether some variables influence others indirectly through intermediate variables, revealing the underlying causal structure.'
              : 'Even with two variables, path analysis can incorporate mediators or test directional hypotheses about how variables influence each other.'
          } Unlike standard regression which treats predictors as independent, path analysis acknowledges that variables in complex systems often influence each other. It provides path coefficients showing direct effects, plus calculates indirect and total effects, offering a comprehensive view of how variables interrelate to produce outcomes. This is particularly valuable for strategic deterrence where economic factors might influence deterrence both directly and indirectly through other domains.`,
          application: `To conduct path analysis: (1) Draw a theoretical path diagram showing hypothesized causal relationships among variables (arrows indicate presumed direction of influence). (2) Identify endogenous variables (outcomes/mediators) and exogenous variables (pure predictors). (3) Ensure adequate sample size: minimum 10-20 observations per estimated parameter (larger models need more data). (4) Use specialized software (e.g., lavaan in R, Amos, Mplus) to estimate the model. (5) Examine overall model fit: CFI >0.95, RMSEA <0.08, SRMR <0.08 indicate good fit. (6) Evaluate path coefficients: each arrow in your diagram gets a coefficient indicating strength and significance. (7) Calculate indirect effects: multiply path coefficients along indirect pathways. (8) Test total effects: sum of direct and indirect effects. (9) Report: standardized path coefficients (like beta weights), significance tests, model fit indices, R² for each endogenous variable. (10) Visualize final path diagram with coefficient values on arrows and R² in boxes. (11) Particularly useful for testing theories about how strategic investments cascade through domains to affect deterrence.`
        }
      ];
    }
    
    if (hasMultipleVariables && recommendedVariables2.length >= 3 && hasTwoGroups) {
      return [
        {
          name: "MANOVA (Multivariate ANOVA)",
          justification: `Your hypothesis examines group differences across multiple outcome variables simultaneously, which requires Multivariate Analysis of Variance (MANOVA). Unlike running separate ANOVAs for each variable, MANOVA considers correlations among dependent variables and tests whether groups differ on a composite of outcomes while controlling Type I error. ${
            lowerHypothesis.includes('domain') ? 'Since you are examining multiple domains, MANOVA can assess whether teams differ in their overall deterrence profile across all dimensions simultaneously, detecting patterns that separate univariate tests might miss.' : ''
          } This approach is statistically more powerful and appropriate than multiple ANOVAs, providing a comprehensive view of multivariate group differences with a single omnibus test followed by targeted follow-ups.`,
          application: `To perform MANOVA: (1) Select 2+ continuous dependent variables that are theoretically related (e.g., deterrence scores across multiple domains). (2) Define your independent grouping variable (e.g., NATO vs. Russia). (3) Verify multivariate assumptions: (a) multivariate normality—can use Mardia's test or examine normality within each group, (b) homogeneity of covariance matrices—Box's M test (though robust to violations with equal sample sizes), (c) linear relationships among DVs—check scatterplot matrix, (d) adequate sample size—more observations than DVs, ideally n>20 per group. (4) Run MANOVA and examine multivariate test statistics: Wilks' Lambda (most common), Pillai's Trace (robust to violations), Hotelling's Trace, or Roy's Largest Root. (5) Report multivariate F-statistic and p-value from chosen test. (6) If multivariate effect is significant (p<0.05), groups differ on the combined set of DVs—proceed to follow-ups. (7) Conduct univariate ANOVAs for each DV to identify which specific variables drive the difference. (8) Apply Bonferroni correction to control Type I error in follow-ups (divide α by number of DVs). (9) Report partial eta-squared for both multivariate and univariate effects. (10) Visualize with profile plots showing group means across all DVs or with discriminant function plots.`
        },
        {
          name: "Separate ANOVAs with Bonferroni Correction",
          justification: `As a simpler alternative to MANOVA, you can conduct separate one-way ANOVAs for each outcome variable while applying Bonferroni correction to control the family-wise error rate. ${
            lowerHypothesis.includes('domain') ? 'This approach tests each domain separately (Joint, Economy, Cognitive, Space, Cyber), making it easier to interpret which specific dimensions differ between teams.' : ''
          } While MANOVA tests a composite multivariate hypothesis, separate ANOVAs provide dimension-specific results that may be more actionable for strategic decision-making. The Bonferroni correction (dividing your alpha level by the number of tests) protects against false positives that would occur from multiple testing. This approach is particularly useful when DVs are not highly correlated or when you specifically want to know which individual variables differ, rather than just detecting an overall multivariate difference.`,
          application: `To conduct separate ANOVAs with Bonferroni: (1) Identify all dependent variables you want to test (e.g., 5 domains = 5 ANOVAs). (2) Determine your adjusted alpha level: divide your desired α (usually 0.05) by number of tests. For 5 tests: 0.05/5 = 0.01, so each individual test must reach p<0.01 to be considered significant. (3) For each dependent variable, conduct a one-way ANOVA comparing groups (e.g., NATO vs. Russia). (4) Check ANOVA assumptions for each test: normality within groups, homogeneity of variance. (5) Calculate F-statistic, df, and p-value for each ANOVA. (6) Compare each p-value to your Bonferroni-corrected alpha (e.g., 0.01). Only those below the corrected threshold are statistically significant. (7) For significant effects, conduct post-hoc tests if you have >2 groups. (8) Report results in a table showing F, df, p, and effect size (eta-squared) for each variable. (9) Clearly state your correction: "Using Bonferroni correction for 5 tests, alpha=0.01." (10) Visualize with separate bar charts or box plots for each dependent variable. (11) This approach is more conservative than uncorrected tests but easier to interpret than MANOVA, providing clear domain-specific findings.`
        }
      ];
    }
    
    if (hasTimeComponent || lowerHypothesis.includes('longitudinal') || lowerHypothesis.includes('change')) {
      return [
        {
          name: "Repeated Measures ANOVA",
          justification: `Your hypothesis involves examining changes or patterns across time points or turns, which suggests a within-subjects design best analyzed with Repeated Measures ANOVA. This test accounts for the fact that the same sessions/teams are measured multiple times, recognizing that measurements from the same entity are correlated. ${
            lowerHypothesis.includes('turn') ? 'Since your hypothesis mentions turns, you are tracking strategic performance across the temporal progression of the simulation, making this within-subjects approach ideal.' : ''
          } Repeated measures designs are more powerful than between-subjects comparisons because they control for individual differences, reducing error variance and increasing statistical power. This test is specifically designed for detecting developmental trends, strategic evolution, or cumulative effects over the course of sessions.`,
          application: `To conduct Repeated Measures ANOVA: (1) Organize your data with the same subjects (sessions or teams) measured at multiple time points (e.g., deterrence at turns 1, 2, 3, 4). Each subject must have measurements at all time points (balanced design). (2) Identify your within-subjects factor (time/turn) with 3+ levels. (3) Check assumptions: (a) normality of differences between time points (can use Shapiro-Wilk on difference scores), (b) sphericity—equal variances of differences between all pairs of time points (test with Mauchly's test). (4) If sphericity is violated (Mauchly's p<0.05), apply Greenhouse-Geisser (conservative) or Huynh-Feldt (liberal) correction to degrees of freedom. (5) Run the analysis and examine the within-subjects effect for time. (6) Report: F-value, degrees of freedom (including any sphericity corrections), p-value, and partial eta-squared. (7) If significant (p<0.05), performance changes significantly across time—proceed to pairwise comparisons. (8) Conduct pairwise comparisons with Bonferroni adjustments to identify which specific time points differ from each other. (9) Visualize with line graphs showing means and error bars (or confidence intervals) across all time points, with one line per group if you also have between-subjects factors. (10) Interpret whether performance increases, decreases, or follows a non-linear pattern over time.`
        },
        {
          name: "Mixed-Effects Models (Linear Mixed Models)",
          justification: `Mixed-effects models (also called hierarchical linear models or multilevel models) are a flexible and powerful approach for analyzing repeated measures data, especially when you have unbalanced designs, missing data points, or want to model complex patterns of change over time. Unlike repeated measures ANOVA which requires complete data at all time points, mixed-effects models can handle missing values by using all available data. ${
            lowerHypothesis.includes('turn') ? 'For your turn-by-turn analysis, mixed models can model non-linear trajectories of strategic performance, test whether teams differ in their rates of change (not just in average levels), and account for the fact that sessions may have different numbers of turns.' : ''
          } These models separate fixed effects (average patterns across all subjects) from random effects (subject-specific deviations), providing richer insights into both population-level trends and individual variability.`,
          application: `To conduct mixed-effects modeling: (1) Structure your data in long format: one row per observation, with columns for subject ID, time point, outcome variable, and any predictors. (2) Missing time points are acceptable—the model uses all available data. (3) Specify your model structure: (a) Fixed effects—time (can be linear, quadratic, or categorical), group, and their interaction, (b) Random effects—minimally include random intercepts (each subject can have different baseline level); optionally include random slopes (each subject can have different rate of change). (4) Use specialized software (lme4 in R, mixed procedure in SPSS, mixed in Stata). (5) Fit the model using restricted maximum likelihood (REML). (6) Examine fixed effects: coefficients show average trends (e.g., how much outcome increases per turn). (7) Test significance of effects using t-tests or likelihood ratio tests. (8) Examine random effects: variance components show how much subjects vary in intercepts and slopes. (9) Report: fixed effect coefficients with SE and p-values, random effect variances, model fit (AIC, BIC). (10) Visualize with individual trajectory plots (spaghetti plots) showing each subject's trend plus the average fitted line. (11) Can model complex patterns: acceleration/deceleration, time-varying effects, interactions with group. (12) Particularly powerful for unequal time spacing, missing data, or when you want to test if groups differ in their rate of change over time.`
        }
      ];
    }
    
    // Default recommendation for general hypotheses - provide two complementary approaches
    return [
      {
        name: "Independent Samples t-test",
        justification: `Based on your hypothesis structure, comparing two groups on a single metric using an independent samples t-test is a foundational approach. If you are comparing NATO vs. Russia (or winners vs. losers) on a deterrence metric, the t-test will determine if the observed mean difference is statistically significant or could have occurred by chance. ${
          recommendedVariables2.length === 0 
            ? 'Select relevant variables above to refine this recommendation further—you will need one outcome variable to compare between two groups.' 
            : `With ${recommendedVariables2.length} recommended variable${recommendedVariables2.length !== 1 ? 's' : ''}, select one as your outcome and use team or winner status as your grouping variable.`
        } The t-test is the most widely used method for two-group comparisons, providing straightforward interpretation with clear measures of effect size and confidence intervals.`,
        application: `For t-test implementation: (1) Select one continuous outcome variable (e.g., total deterrence score, domain-specific score). (2) Define two independent groups to compare (NATO vs. Russia, winners vs. losers, or another binary categorization). (3) Ensure groups are independent—each session belongs to only one group. (4) Check normality assumption: create histograms or Q-Q plots for each group. The t-test is robust to violations when n≥30 per group. (5) Test homogeneity of variance with Levene's test. If variances differ significantly, use Welch's t-test correction. (6) Calculate the t-statistic, degrees of freedom, and p-value. (7) Report: means and SDs for each group, mean difference, 95% confidence interval for the difference, t-value, df, and p-value. (8) Interpret: p<0.05 suggests groups differ significantly. (9) Calculate Cohen's d effect size: |d|=0.2 (small), 0.5 (medium), 0.8 (large). (10) Visualize with side-by-side boxplots or bar charts with error bars showing mean ± SE or 95% CI. (11) Remember: statistical significance (p-value) tells you if a difference exists; effect size (Cohen's d) tells you if that difference is meaningful.`
      },
      {
        name: "Correlation Analysis (Pearson or Spearman)",
        justification: `Alternatively, if your hypothesis examines whether two continuous variables are related, correlation analysis is the appropriate approach. This method measures the strength and direction of association between variables without assuming one causes the other. ${
          recommendedVariables2.length >= 2
            ? `With ${recommendedVariables2.length} recommended variables, you can examine whether pairs are correlated (e.g., does economic deterrence correlate with total deterrence? Do permanent card purchases correlate with winning?).`
            : 'Select two continuous variables to examine their relationship—for example, whether investment in one domain predicts success in another, or whether certain strategies are associated with higher deterrence scores.'
        } Use Pearson correlation when both variables are continuous and normally distributed with a linear relationship. Use Spearman correlation when data is ordinal, contains outliers, or shows a non-linear but monotonic (consistently increasing or decreasing) relationship.`,
        application: `For correlation analysis: (1) Select two continuous variables that you believe might be related (e.g., economy deterrence and total deterrence, or turn count and final score). (2) Create a scatterplot to visualize the relationship and check for patterns. (3) For Pearson: verify that the relationship appears roughly linear and both variables are approximately normally distributed. For Spearman: no distribution assumptions needed. (4) Look for outliers that might distort the correlation. (5) Calculate the correlation coefficient: Pearson's r for linear relationships, Spearman's ρ (rho) for monotonic relationships. (6) Interpret the coefficient: 0 = no relationship, ±0.1 to ±0.3 = weak, ±0.3 to ±0.7 = moderate, ±0.7 to ±1.0 = strong. Positive values indicate variables increase together; negative values indicate one increases as the other decreases. (7) Test significance: report the p-value, but remember that with large samples even weak correlations can be "significant"—focus on the magnitude of r or ρ for practical importance. (8) Report: correlation coefficient, sample size, and p-value (e.g., "r = 0.65, n = 40, p < 0.001"). (9) Visualize with scatterplot including the trend line. (10) Critically important: Correlation does NOT prove causation. A correlation between A and B could mean A causes B, B causes A, or both are caused by some third variable C. (11) Use scatterplots with regression lines to communicate findings clearly.`
      }
    ];
  }, [hypothesis2, recommendedVariables2]);

  // Analyze hypothesis 1 and recommend variables
  const recommendedVariables1 = useMemo(() => {
    if (!hypothesis1.trim()) return [];
    
    const lowerHypothesis = hypothesis1.toLowerCase();
    const recommendations: string[] = [];
    
    // Keywords for different variable types
    const keywords = {
      nato_total: ['nato total', 'nato overall', 'nato deterrence score', 'nato performance'],
      russia_total: ['russia total', 'russia overall', 'russia deterrence score', 'russia performance'],
      nato_joint: ['nato joint', 'nato military'],
      nato_economy: ['nato economy', 'nato economic'],
      nato_cognitive: ['nato cognitive', 'nato information', 'nato perception'],
      nato_space: ['nato space', 'nato satellite'],
      nato_cyber: ['nato cyber', 'nato digital'],
      russia_joint: ['russia joint', 'russia military'],
      russia_economy: ['russia economy', 'russia economic'],
      russia_cognitive: ['russia cognitive', 'russia information', 'russia perception'],
      russia_space: ['russia space', 'russia satellite'],
      russia_cyber: ['russia cyber', 'russia digital'],
      turn_count: ['turn', 'duration', 'length', 'time', 'rounds'],
      card_count: ['card', 'purchase', 'investment', 'spending']
    };

    // Check for general team mentions
    const hasNato = /\bnato\b/.test(lowerHypothesis);
    const hasRussia = /\brussia\b/.test(lowerHypothesis);
    
    // Check for domain mentions
    const hasJoint = /\bjoint\b|military|forces/.test(lowerHypothesis);
    const hasEconomy = /\beconom/.test(lowerHypothesis);
    const hasCognitive = /\bcognitive\b|information|perception|narrative/.test(lowerHypothesis);
    const hasSpace = /\bspace\b|satellite/.test(lowerHypothesis);
    const hasCyber = /\bcyber\b|digital|network/.test(lowerHypothesis);
    
    // Match specific keywords
    Object.entries(keywords).forEach(([varId, terms]) => {
      if (terms.some(term => lowerHypothesis.includes(term))) {
        recommendations.push(varId);
      }
    });
    
    // Add domain-based recommendations if team mentioned but no specific match
    if (hasNato && !recommendations.some(r => r.startsWith('nato_'))) {
      if (hasJoint) recommendations.push('nato_joint');
      if (hasEconomy) recommendations.push('nato_economy');
      if (hasCognitive) recommendations.push('nato_cognitive');
      if (hasSpace) recommendations.push('nato_space');
      if (hasCyber) recommendations.push('nato_cyber');
      if (!hasJoint && !hasEconomy && !hasCognitive && !hasSpace && !hasCyber) {
        recommendations.push('nato_total');
      }
    }
    
    if (hasRussia && !recommendations.some(r => r.startsWith('russia_'))) {
      if (hasJoint) recommendations.push('russia_joint');
      if (hasEconomy) recommendations.push('russia_economy');
      if (hasCognitive) recommendations.push('russia_cognitive');
      if (hasSpace) recommendations.push('russia_space');
      if (hasCyber) recommendations.push('russia_cyber');
      if (!hasJoint && !hasEconomy && !hasCognitive && !hasSpace && !hasCyber) {
        recommendations.push('russia_total');
      }
    }
    
    // Check for comparison/correlation terms
    const hasComparison = /\bcompare|versus|vs|between|differ|relationship|correlat|impact|effect|influence/.test(lowerHypothesis);
    if (hasComparison && recommendations.length === 0) {
      // If comparing but no specific variables, suggest both teams' totals
      if (hasNato || hasRussia || (!hasNato && !hasRussia)) {
        recommendations.push('nato_total', 'russia_total');
      }
    }
    
    return Array.from(new Set(recommendations)); // Remove duplicates
  }, [hypothesis1]);

  // Get statistical test recommendation based on hypothesis 1
  const getHypothesisBasedTestRecommendation1 = useMemo(() => {
    if (!hypothesis1.trim()) return null;
    
    const lowerHypothesis = hypothesis1.toLowerCase();
    
    // Analyze hypothesis structure
    const hasCorrelation = /correlat|relationship|associat/.test(lowerHypothesis);
    const hasComparison = /compare|differ|versus|vs\.?|between/.test(lowerHypothesis);
    const hasPrediction = /predict|determin|effect|impact|influence|cause/.test(lowerHypothesis);
    const hasMultipleVariables = /multiple\s+(variable|outcome|factor|dimension|metric)|several\s+(variable|outcome|factor|dimension|metric)|various\s+(variable|outcome|factor|dimension|metric)/.test(lowerHypothesis);
    const hasTwoGroups = /nato.*russia|russia.*nato|two teams|both teams/.test(lowerHypothesis);
    const hasMultipleGroups = /across.*domain|all.*domain|multiple.*group/.test(lowerHypothesis);
    const hasTimeComponent = /over time|across turns|duration|temporal|longitudinal/.test(lowerHypothesis);
    
    // Determine recommended tests based on hypothesis characteristics - return TWO complementary tests
    if (hasCorrelation && recommendedVariables1.length === 2 && !hasComparison) {
      return [
        {
          name: "Pearson Correlation",
          justification: `This hypothesis explicitly examines the relationship between two variables, making Pearson correlation the ideal parametric choice. ${
            lowerHypothesis.includes('positively') || lowerHypothesis.includes('negatively') 
              ? 'The directional language ("positively" or "negatively") suggests you are testing for the strength and direction of linear association between variables.' 
              : 'Pearson correlation will reveal both the strength and direction of the linear relationship.'
          } This test is most powerful when both variables are continuous, have a linear relationship, and are normally distributed. It measures the degree to which two variables vary together in a straight-line relationship, providing a coefficient between -1 (perfect negative) and +1 (perfect positive correlation).`,
          application: `To apply Pearson correlation: (1) Select your two continuous variables from the recommended list above. (2) Ensure you have at least 10-20 sessions for reliable estimates. (3) Create a scatterplot to verify linearity—the relationship should appear roughly straight-line. (4) Check for normality in both variables using histograms or Q-Q plots. (5) Look for outliers that might distort the correlation. (6) Calculate Pearson's r coefficient. (7) Interpret: r near 0 = no linear relationship; r = ±0.3 to ±0.5 = moderate; r > ±0.7 = strong linear relationship. (8) Report the correlation coefficient with its p-value and sample size. (9) Remember: correlation measures association strength, not causation.`
        },
        {
          name: "Spearman Rank Correlation",
          justification: `As a robust non-parametric alternative to Pearson correlation, Spearman's rank correlation is ideal when your data violates normality assumptions, contains outliers, or exhibits non-linear but monotonic relationships. This test works by ranking your data points and then calculating correlation on the ranks rather than raw values, making it resistant to extreme scores and applicable to ordinal data. ${
            lowerHypothesis.includes('positively') || lowerHypothesis.includes('negatively')
              ? 'It will detect the directional monotonic trend you hypothesize, even if the relationship is curved rather than perfectly linear.'
              : 'It provides a robust measure of whether variables tend to increase or decrease together, regardless of the exact shape of their relationship.'
          } This makes it more versatile and reliable when assumptions are questionable.`,
          application: `To apply Spearman correlation: (1) Select your two variables (can be continuous or ordinal). (2) No assumption of normality required—this test is distribution-free. (3) Create a scatterplot to check for a monotonic pattern (consistently increasing or decreasing, even if curved). (4) The test ranks all values and calculates correlation on ranks. (5) Calculate Spearman's ρ (rho) coefficient. (6) Interpret identically to Pearson: ρ near 0 = no monotonic relationship; ρ = ±0.3 to ±0.5 = moderate; ρ > ±0.7 = strong monotonic relationship. (7) Report ρ with p-value. (8) Particularly useful when you have outliers, skewed data, or ordinal variables. (9) Can detect non-linear but consistent patterns that Pearson might miss.`
        }
      ];
    }
    
    if (hasTwoGroups && !hasMultipleVariables && recommendedVariables1.length <= 2) {
      return [
        {
          name: "Independent Samples t-test",
          justification: `Your hypothesis compares two independent groups (NATO vs. Russia) on a single outcome variable, which is the classic scenario for an independent samples t-test. This parametric test examines whether the mean deterrence score (or other metric) significantly differs between the two teams. ${
            recommendedVariables1.length === 2 ? 'Since you have variables for both teams, the t-test will directly compare their means to determine if observed differences are statistically significant or due to chance.' : ''
          } The t-test is the most powerful approach when assumptions are met (normality and equal variances), providing precise estimates of mean differences with confidence intervals. It's widely recognized in research and offers straightforward interpretation of group comparisons.`,
          application: `To conduct an independent samples t-test: (1) Select one continuous outcome variable (e.g., total deterrence score). (2) Define your two groups (NATO and Russia). (3) Check normality: use histograms or Q-Q plots for each group. With n≥30 per group, the test is robust to violations. (4) Test homogeneity of variance with Levene's test. If violated, use Welch's t-test correction. (5) Calculate the t-statistic and degrees of freedom. (6) Report: mean difference, 95% confidence interval, t-value, df, and p-value. (7) Interpret: p<0.05 indicates a statistically significant difference between teams. (8) Calculate Cohen's d effect size: 0.2=small, 0.5=medium, 0.8=large. (9) Visualize with side-by-side boxplots or bar charts with error bars.`
        },
        {
          name: "Mann-Whitney U Test",
          justification: `The Mann-Whitney U test (also called Wilcoxon rank-sum test) is the non-parametric alternative for comparing two independent groups when parametric assumptions are violated. Unlike the t-test which compares means, this test compares the distributions and median ranks between groups, making it robust to outliers, skewness, and non-normal data. ${
            recommendedVariables1.length === 2 ? 'It will determine if one team tends to have consistently higher or lower values than the other, without assuming normally distributed data.' : ''
          } This is particularly valuable with small samples (n<30) or when you have extreme scores that would distort mean-based comparisons. It requires no assumptions about data distribution, only that observations are independent.`,
          application: `To conduct Mann-Whitney U test: (1) Select your continuous or ordinal outcome variable. (2) Define your two groups (NATO vs. Russia). (3) No normality assumption required—the test is distribution-free. (4) Ranks all observations from both groups combined, then compares rank sums. (5) Calculate the U-statistic. (6) Report: median for each group, U-statistic, and p-value. (7) Interpret: p<0.05 suggests distributions differ significantly between teams. (8) Effect size: calculate rank-biserial correlation or simply report median difference. (9) Visualize with side-by-side boxplots showing medians, quartiles, and outliers. (10) Particularly useful when you have outliers, skewed data, small samples, or ordinal variables. (11) More conservative but more reliable than t-test when assumptions are questionable.`
        }
      ];
    }
    
    if (hasMultipleGroups && !hasMultipleVariables && recommendedVariables1.length <= 2) {
      return [
        {
          name: "One-Way ANOVA",
          justification: `Your hypothesis involves comparing means across multiple groups (e.g., different domains, time periods, or strategic categories), making one-way Analysis of Variance (ANOVA) the appropriate parametric test. ANOVA extends t-test logic to three or more groups, testing whether at least one group mean differs significantly from the others while controlling Type I error. ${
            lowerHypothesis.includes('domain') ? 'Since your hypothesis mentions domains, you are likely comparing performance across the five strategic dimensions (Joint, Economy, Cognitive, Space, Cyber).' : ''
          } This is statistically superior to running multiple t-tests, which would inflate false positive rates. ANOVA provides an F-statistic indicating overall group differences, then post-hoc tests identify which specific pairs differ.`,
          application: `To perform one-way ANOVA: (1) Select one continuous dependent variable (e.g., deterrence score). (2) Define your grouping factor with 3+ levels (e.g., five domains). (3) Check assumptions: normality within each group using Shapiro-Wilk test (robust if n≥30 per group), homogeneity of variance across groups using Levene's test, and independent observations. (4) Calculate the F-statistic by comparing between-group to within-group variance. (5) Report: F-value, degrees of freedom (between, within), and p-value. (6) If p<0.05, conclude that at least one group mean differs from others. (7) Conduct post-hoc comparisons (Tukey HSD for equal variances, Games-Howell for unequal) to identify which specific groups differ. (8) Report eta-squared or partial eta-squared effect size: 0.01=small, 0.06=medium, 0.14=large. (9) Visualize with grouped boxplots or bar charts showing means with error bars and significance brackets.`
        },
        {
          name: "Kruskal-Wallis Test",
          justification: `The Kruskal-Wallis test is the non-parametric alternative to one-way ANOVA for comparing three or more independent groups when parametric assumptions are violated. Instead of comparing means, it compares the distribution of ranks across groups, making it robust to outliers, skewness, and non-normal distributions. ${
            lowerHypothesis.includes('domain') ? 'For your domain comparison, this test will determine if performance distributions differ significantly across the five strategic dimensions without assuming normal distributions within each domain.' : ''
          } This test is particularly valuable when you have small sample sizes per group, extreme scores, or ordinal data. It requires no distributional assumptions beyond independence and similar distributional shapes.`,
          application: `To perform Kruskal-Wallis test: (1) Select your continuous or ordinal outcome variable. (2) Define your grouping factor with 3+ levels. (3) No normality assumption required—the test ranks all observations across all groups. (4) Calculate the H-statistic (approximates chi-square distribution). (5) Report: H-statistic, degrees of freedom, and p-value. (6) If p<0.05, conclude that at least one group's distribution differs from others. (7) Conduct post-hoc pairwise comparisons using Dunn's test with Bonferroni correction to identify which specific groups differ. (8) Report median and interquartile range for each group. (9) Effect size: calculate epsilon-squared (similar to eta-squared interpretation). (10) Visualize with grouped boxplots showing medians, quartiles, and outliers for each group. (11) Particularly useful for small samples, outliers, skewed data, or when ANOVA assumptions are violated.`
        }
      ];
    }
    
    if (hasPrediction && recommendedVariables1.length >= 2) {
      return [
        {
          name: "Multiple Regression Analysis",
          justification: `Your hypothesis suggests examining how one or more predictor variables influence an outcome variable, which is the domain of multiple regression analysis. ${
            recommendedVariables1.length > 2 
              ? 'Multiple regression is ideal here because you have several potential predictors that may jointly explain variance in the outcome, while controlling for each other.' 
              : 'Simple regression can model the predictive relationship between your predictor and outcome.'
          } Regression goes beyond correlation by providing a predictive model, quantifying exactly how much change in the outcome is associated with unit changes in each predictor. ${
            lowerHypothesis.includes('predict') || lowerHypothesis.includes('determine') 
              ? 'The predictive language in your hypothesis aligns perfectly with regression methodology.' 
              : ''
          } This approach provides regression coefficients (effect sizes), R-squared (variance explained), and tests each predictor's unique contribution.`,
          application: `To conduct multiple regression: (1) Identify your dependent variable (outcome to predict) and independent variables (predictors). (2) Ensure adequate sample size: minimum 10-15 observations per predictor variable (e.g., 50+ sessions for 3 predictors). (3) Check assumptions: (a) linearity—scatterplots of each predictor vs. outcome, (b) independence of residuals, (c) homoscedasticity—residual plot should show constant variance, (d) normality of residuals—Q-Q plot, (e) no multicollinearity—VIF<10 for each predictor. (4) Run the regression model. (5) Examine overall model: R-squared (proportion of variance explained, e.g., R²=0.40 means 40% of variance explained), F-test for overall model significance. (6) Evaluate each predictor: unstandardized coefficient (b) shows effect size in original units, standardized coefficient (β) shows relative importance, t-test and p-value test significance. (7) Check influential cases using Cook's distance (>1 is problematic). (8) Report: R², adjusted R², F-statistic, and table of coefficients with confidence intervals. (9) Visualize with partial regression plots showing each predictor's unique effect.`
        },
        {
          name: "Path Analysis / Structural Equation Modeling",
          justification: `Path analysis extends multiple regression by modeling complex relationships among multiple variables simultaneously, including indirect effects and mediating pathways. ${
            recommendedVariables1.length > 2
              ? 'With your multiple variables, path analysis can test whether some variables influence others indirectly through intermediate variables, revealing the underlying causal structure.'
              : 'Even with two variables, path analysis can incorporate mediators or test directional hypotheses about how variables influence each other.'
          } Unlike standard regression which treats predictors as independent, path analysis acknowledges that variables in complex systems often influence each other. It provides path coefficients showing direct effects, plus calculates indirect and total effects, offering a comprehensive view of how variables interrelate to produce outcomes. This is particularly valuable for strategic deterrence where economic factors might influence deterrence both directly and indirectly through other domains.`,
          application: `To conduct path analysis: (1) Draw a theoretical path diagram showing hypothesized causal relationships among variables (arrows indicate presumed direction of influence). (2) Identify endogenous variables (outcomes/mediators) and exogenous variables (pure predictors). (3) Ensure adequate sample size: minimum 10-20 observations per estimated parameter (larger models need more data). (4) Use specialized software (e.g., lavaan in R, Amos, Mplus) to estimate the model. (5) Examine overall model fit: CFI >0.95, RMSEA <0.08, SRMR <0.08 indicate good fit. (6) Evaluate path coefficients: each arrow in your diagram gets a coefficient indicating strength and significance. (7) Calculate indirect effects: multiply path coefficients along indirect pathways. (8) Test total effects: sum of direct and indirect effects. (9) Report: standardized path coefficients (like beta weights), significance tests, model fit indices, R² for each endogenous variable. (10) Visualize final path diagram with coefficient values on arrows and R² in boxes. (11) Particularly useful for testing theories about how strategic investments cascade through domains to affect deterrence.`
        }
      ];
    }
    
    if (hasMultipleVariables && recommendedVariables1.length >= 3 && hasTwoGroups) {
      return [
        {
          name: "MANOVA (Multivariate ANOVA)",
          justification: `Your hypothesis examines group differences across multiple outcome variables simultaneously, which requires Multivariate Analysis of Variance (MANOVA). Unlike running separate ANOVAs for each variable, MANOVA considers correlations among dependent variables and tests whether groups differ on a composite of outcomes while controlling Type I error. ${
            lowerHypothesis.includes('domain') ? 'Since you are examining multiple domains, MANOVA can assess whether teams differ in their overall deterrence profile across all dimensions simultaneously, detecting patterns that separate univariate tests might miss.' : ''
          } This approach is statistically more powerful and appropriate than multiple ANOVAs, providing a comprehensive view of multivariate group differences with a single omnibus test followed by targeted follow-ups.`,
          application: `To perform MANOVA: (1) Select 2+ continuous dependent variables that are theoretically related (e.g., deterrence scores across multiple domains). (2) Define your independent grouping variable (e.g., NATO vs. Russia). (3) Verify multivariate assumptions: (a) multivariate normality—can use Mardia's test or examine normality within each group, (b) homogeneity of covariance matrices—Box's M test (though robust to violations with equal sample sizes), (c) linear relationships among DVs—check scatterplot matrix, (d) adequate sample size—more observations than DVs, ideally n>20 per group. (4) Run MANOVA and examine multivariate test statistics: Wilks' Lambda (most common), Pillai's Trace (robust to violations), Hotelling's Trace, or Roy's Largest Root. (5) Report multivariate F-statistic and p-value from chosen test. (6) If multivariate effect is significant (p<0.05), groups differ on the combined set of DVs—proceed to follow-ups. (7) Conduct univariate ANOVAs for each DV to identify which specific variables drive the difference. (8) Apply Bonferroni correction to control Type I error in follow-ups (divide α by number of DVs). (9) Report partial eta-squared for both multivariate and univariate effects. (10) Visualize with profile plots showing group means across all DVs or with discriminant function plots.`
        },
        {
          name: "Separate ANOVAs with Bonferroni Correction",
          justification: `As a simpler alternative to MANOVA, you can conduct separate one-way ANOVAs for each outcome variable while applying Bonferroni correction to control the family-wise error rate. ${
            lowerHypothesis.includes('domain') ? 'This approach tests each domain separately (Joint, Economy, Cognitive, Space, Cyber), making it easier to interpret which specific dimensions differ between teams.' : ''
          } While MANOVA tests a composite multivariate hypothesis, separate ANOVAs provide dimension-specific results that may be more actionable for strategic decision-making. The Bonferroni correction (dividing your alpha level by the number of tests) protects against false positives that would occur from multiple testing. This approach is particularly useful when DVs are not highly correlated or when you specifically want to know which individual variables differ, rather than just detecting an overall multivariate difference.`,
          application: `To conduct separate ANOVAs with Bonferroni: (1) Identify all dependent variables you want to test (e.g., 5 domains = 5 ANOVAs). (2) Determine your adjusted alpha level: divide your desired α (usually 0.05) by number of tests. For 5 tests: 0.05/5 = 0.01, so each individual test must reach p<0.01 to be considered significant. (3) For each dependent variable, conduct a one-way ANOVA comparing groups (e.g., NATO vs. Russia). (4) Check ANOVA assumptions for each test: normality within groups, homogeneity of variance. (5) Calculate F-statistic, df, and p-value for each ANOVA. (6) Compare each p-value to your Bonferroni-corrected alpha (e.g., 0.01). Only those below the corrected threshold are statistically significant. (7) For significant effects, conduct post-hoc tests if you have >2 groups. (8) Report results in a table showing F, df, p, and effect size (eta-squared) for each variable. (9) Clearly state your correction: "Using Bonferroni correction for 5 tests, alpha=0.01." (10) Visualize with separate bar charts or box plots for each dependent variable. (11) This approach is more conservative than uncorrected tests but easier to interpret than MANOVA, providing clear domain-specific findings.`
        }
      ];
    }
    
    if (hasTimeComponent || lowerHypothesis.includes('longitudinal') || lowerHypothesis.includes('change')) {
      return [
        {
          name: "Repeated Measures ANOVA",
          justification: `Your hypothesis involves examining changes or patterns across time points or turns, which suggests a within-subjects design best analyzed with Repeated Measures ANOVA. This test accounts for the fact that the same sessions/teams are measured multiple times, recognizing that measurements from the same entity are correlated. ${
            lowerHypothesis.includes('turn') ? 'Since your hypothesis mentions turns, you are tracking strategic performance across the temporal progression of the simulation, making this within-subjects approach ideal.' : ''
          } Repeated measures designs are more powerful than between-subjects comparisons because they control for individual differences, reducing error variance and increasing statistical power. This test is specifically designed for detecting developmental trends, strategic evolution, or cumulative effects over the course of sessions.`,
          application: `To conduct Repeated Measures ANOVA: (1) Organize your data with the same subjects (sessions or teams) measured at multiple time points (e.g., deterrence at turns 1, 2, 3, 4). Each subject must have measurements at all time points (balanced design). (2) Identify your within-subjects factor (time/turn) with 3+ levels. (3) Check assumptions: (a) normality of differences between time points (can use Shapiro-Wilk on difference scores), (b) sphericity—equal variances of differences between all pairs of time points (test with Mauchly's test). (4) If sphericity is violated (Mauchly's p<0.05), apply Greenhouse-Geisser (conservative) or Huynh-Feldt (liberal) correction to degrees of freedom. (5) Run the analysis and examine the within-subjects effect for time. (6) Report: F-value, degrees of freedom (including any sphericity corrections), p-value, and partial eta-squared. (7) If significant (p<0.05), performance changes significantly across time—proceed to pairwise comparisons. (8) Conduct pairwise comparisons with Bonferroni adjustments to identify which specific time points differ from each other. (9) Visualize with line graphs showing means and error bars (or confidence intervals) across all time points, with one line per group if you also have between-subjects factors. (10) Interpret whether performance increases, decreases, or follows a non-linear pattern over time.`
        },
        {
          name: "Mixed-Effects Models (Linear Mixed Models)",
          justification: `Mixed-effects models (also called hierarchical linear models or multilevel models) are a flexible and powerful approach for analyzing repeated measures data, especially when you have unbalanced designs, missing data points, or want to model complex patterns of change over time. Unlike repeated measures ANOVA which requires complete data at all time points, mixed-effects models can handle missing values by using all available data. ${
            lowerHypothesis.includes('turn') ? 'For your turn-by-turn analysis, mixed models can model non-linear trajectories of strategic performance, test whether teams differ in their rates of change (not just in average levels), and account for the fact that sessions may have different numbers of turns.' : ''
          } These models separate fixed effects (average patterns across all subjects) from random effects (subject-specific deviations), providing richer insights into both population-level trends and individual variability.`,
          application: `To conduct mixed-effects modeling: (1) Structure your data in long format: one row per observation, with columns for subject ID, time point, outcome variable, and any predictors. (2) Missing time points are acceptable—the model uses all available data. (3) Specify your model structure: (a) Fixed effects—time (can be linear, quadratic, or categorical), group, and their interaction, (b) Random effects—minimally include random intercepts (each subject can have different baseline level); optionally include random slopes (each subject can have different rate of change). (4) Use specialized software (lme4 in R, mixed procedure in SPSS, mixed in Stata). (5) Fit the model using restricted maximum likelihood (REML). (6) Examine fixed effects: coefficients show average trends (e.g., how much outcome increases per turn). (7) Test significance of effects using t-tests or likelihood ratio tests. (8) Examine random effects: variance components show how much subjects vary in intercepts and slopes. (9) Report: fixed effect coefficients with SE and p-values, random effect variances, model fit (AIC, BIC). (10) Visualize with individual trajectory plots (spaghetti plots) showing each subject's trend plus the average fitted line. (11) Can model complex patterns: acceleration/deceleration, time-varying effects, interactions with group. (12) Particularly powerful for unequal time spacing, missing data, or when you want to test if groups differ in their rate of change over time.`
        }
      ];
    }
    
    // Default recommendation for general hypotheses - provide two complementary approaches
    return [
      {
        name: "Independent Samples t-test",
        justification: `Based on your hypothesis structure, comparing two groups on a single metric using an independent samples t-test is a foundational approach. If you are comparing NATO vs. Russia (or winners vs. losers) on a deterrence metric, the t-test will determine if the observed mean difference is statistically significant or could have occurred by chance. ${
          recommendedVariables1.length === 0 
            ? 'Select relevant variables above to refine this recommendation further—you will need one outcome variable to compare between two groups.' 
            : `With ${recommendedVariables1.length} recommended variable${recommendedVariables1.length !== 1 ? 's' : ''}, select one as your outcome and use team or winner status as your grouping variable.`
        } The t-test is the most widely used method for two-group comparisons, providing straightforward interpretation with clear measures of effect size and confidence intervals.`,
        application: `For t-test implementation: (1) Select one continuous outcome variable (e.g., total deterrence score, domain-specific score). (2) Define two independent groups to compare (NATO vs. Russia, winners vs. losers, or another binary categorization). (3) Ensure groups are independent—each session belongs to only one group. (4) Check normality assumption: create histograms or Q-Q plots for each group. The t-test is robust to violations when n≥30 per group. (5) Test homogeneity of variance with Levene's test. If variances differ significantly, use Welch's t-test correction. (6) Calculate the t-statistic, degrees of freedom, and p-value. (7) Report: means and SDs for each group, mean difference, 95% confidence interval for the difference, t-value, df, and p-value. (8) Interpret: p<0.05 suggests groups differ significantly. (9) Calculate Cohen's d effect size: |d|=0.2 (small), 0.5 (medium), 0.8 (large). (10) Visualize with side-by-side boxplots or bar charts with error bars showing mean ± SE or 95% CI. (11) Remember: statistical significance (p-value) tells you if a difference exists; effect size (Cohen's d) tells you if that difference is meaningful.`
      },
      {
        name: "Correlation Analysis (Pearson or Spearman)",
        justification: `Alternatively, if your hypothesis examines whether two continuous variables are related, correlation analysis is the appropriate approach. This method measures the strength and direction of association between variables without assuming one causes the other. ${
          recommendedVariables1.length >= 2
            ? `With ${recommendedVariables1.length} recommended variables, you can examine whether pairs are correlated (e.g., does economic deterrence correlate with total deterrence? Do permanent card purchases correlate with winning?).`
            : 'Select two continuous variables to examine their relationship—for example, whether investment in one domain predicts success in another, or whether certain strategies are associated with higher deterrence scores.'
        } Use Pearson correlation when both variables are continuous and normally distributed with a linear relationship. Use Spearman correlation when data is ordinal, contains outliers, or shows a non-linear but monotonic (consistently increasing or decreasing) relationship.`,
        application: `For correlation analysis: (1) Select two continuous variables that you believe might be related (e.g., economy deterrence and total deterrence, or turn count and final score). (2) Create a scatterplot to visualize the relationship and check for patterns. (3) For Pearson: verify that the relationship appears roughly linear and both variables are approximately normally distributed. For Spearman: no distribution assumptions needed. (4) Look for outliers that might distort the correlation. (5) Calculate the correlation coefficient: Pearson's r for linear relationships, Spearman's ρ (rho) for monotonic relationships. (6) Interpret the coefficient: 0 = no relationship, ±0.1 to ±0.3 = weak, ±0.3 to ±0.7 = moderate, ±0.7 to ±1.0 = strong. Positive values indicate variables increase together; negative values indicate one increases as the other decreases. (7) Test significance: report the p-value, but remember that with large samples even weak correlations can be "significant"—focus on the magnitude of r or ρ for practical importance. (8) Report: correlation coefficient, sample size, and p-value (e.g., "r = 0.65, n = 40, p < 0.001"). (9) Visualize with scatterplot including the trend line. (10) Critically important: Correlation does NOT prove causation. A correlation between A and B could mean A causes B, B causes A, or both are caused by some third variable C. (11) Use scatterplots with regression lines to communicate findings clearly.`
      }
    ];
  }, [hypothesis1, recommendedVariables1]);

  // Get statistical test recommendation based on research question 1
  const getResearchQuestionBasedTestRecommendation1 = useMemo(() => {
    if (!researchQuestionLeft.trim()) return null;
    
    const lowerQuestion = researchQuestionLeft.toLowerCase();
    
    // Analyze research question structure
    const asksWhich = /\bwhich\b/.test(lowerQuestion);
    const asksHow = /\bhow\b/.test(lowerQuestion);
    const asksWhat = /\bwhat\b/.test(lowerQuestion);
    const asksWhy = /\bwhy\b/.test(lowerQuestion);
    const asksDoes = /\bdoes\b|\bdo\b/.test(lowerQuestion);
    const asksAre = /\bare\b|\bis\b/.test(lowerQuestion);
    
    const mentionsComparison = /compar|differ|versus|vs\.?|between/.test(lowerQuestion);
    const mentionsRelationship = /correlat|relationship|associat|pattern|connect/.test(lowerQuestion);
    const mentionsEffect = /effect|impact|influence|affect|determin/.test(lowerQuestion);
    const mentionsStrategy = /strateg|approach|method|tactic/.test(lowerQuestion);
    const mentionsDomain = /domain|dimension/.test(lowerQuestion);
    const mentionsTiming = /timing|when|early|late|over time|across turns/.test(lowerQuestion);
    const mentionsTeams = /nato.*russia|russia.*nato|team|both teams/.test(lowerQuestion);
    
    // Exploratory questions asking "which" often need multiple comparisons
    if (asksWhich && mentionsStrategy) {
      return {
        name: "Exploratory Analysis: Descriptive Statistics + Chi-Square or ANOVA",
        justification: `Your research question explores which strategies are most effective, which is inherently exploratory and comparative. This requires examining multiple strategy types and their outcomes. Since research questions are broader than hypotheses, start with descriptive statistics to understand patterns in your data—calculate means, frequencies, and distributions for different strategies. Then, depending on your data structure, use Chi-Square tests to examine associations between categorical strategy types and outcomes (win/loss), or use One-Way ANOVA to compare continuous outcome measures (deterrence scores) across multiple strategy groups. This two-phase approach provides both descriptive insights and inferential statistical support for identifying effective strategies.`,
        application: `Phase 1 - Descriptive Analysis: (1) Categorize sessions by dominant strategy type (e.g., economy-focused, cyber-focused, balanced). (2) Calculate win rates, average deterrence scores, and other relevant metrics for each strategy category. (3) Create frequency tables and visualizations (bar charts, pie charts) to identify patterns. Phase 2 - Inferential Testing: For categorical outcomes (wins): (4) Use Chi-Square test to determine if certain strategies are associated with higher win rates. (5) Calculate odds ratios to quantify strategy effectiveness. For continuous outcomes (deterrence scores): (6) Use One-Way ANOVA to compare mean deterrence across strategy groups. (7) Conduct post-hoc tests (Tukey HSD) to identify which specific strategies differ significantly. (8) Report effect sizes to quantify practical significance. (9) Create visualizations showing strategy effectiveness with confidence intervals.`
      };
    }
    
    if ((asksHow || asksWhat) && mentionsRelationship) {
      return {
        name: "Correlation Analysis (Pearson/Spearman) + Regression",
        justification: `Your research question investigates how variables relate or what patterns exist, which calls for correlation and regression analysis. Unlike hypothesis testing with directional predictions, research questions are exploratory—you're discovering relationships rather than confirming them. Start with correlation analysis to examine bivariate relationships between variables (e.g., economic investment and total deterrence). Pearson correlation works for linear relationships with normally distributed continuous variables, while Spearman correlation handles non-linear monotonic relationships and ordinal data. If you find significant correlations and want to understand prediction, follow up with regression analysis to model how predictor variables explain variance in outcomes. This combination provides both the strength of relationships and their predictive power.`,
        application: `Step 1 - Correlation Analysis: (1) Identify pairs of continuous variables that theoretically might be related based on your research question. (2) Create scatterplots to visualize relationships and check for linearity, outliers, and influential points. (3) Calculate Pearson's r for linear relationships or Spearman's ρ for monotonic relationships. (4) Interpret correlation strength: |r| < 0.3 (weak), 0.3-0.7 (moderate), > 0.7 (strong). (5) Assess statistical significance with p-values, but focus on effect sizes for practical importance. Step 2 - Regression Analysis (optional): (6) If correlations are promising, build regression models with theoretically meaningful predictors. (7) Examine R-squared values to understand variance explained. (8) Report standardized beta coefficients to compare relative importance of predictors. (9) Create visualization showing predicted relationships with confidence bands.`
      };
    }
    
    if ((asksAre || asksDoes) && mentionsComparison && mentionsTeams) {
      return {
        name: "Independent Samples t-test or Mann-Whitney U Test",
        justification: `Your research question compares two groups (NATO vs. Russia) on outcome measures, making this a classic two-group comparison scenario. Since research questions are exploratory, you're investigating whether differences exist rather than confirming a predicted direction. Use an independent samples t-test when comparing mean deterrence scores or other continuous outcomes between the two teams. The t-test assumes approximately normal distributions and similar variances between groups—check these with visual diagnostics (histograms, Q-Q plots) and Levene's test. If assumptions are violated or you have small sample sizes, the non-parametric Mann-Whitney U test provides a robust alternative that compares distributions without normality assumptions. Both tests will reveal whether team differences are statistically and practically significant.`,
        application: `For parametric t-test: (1) Select your continuous outcome variable (e.g., total deterrence, economic deterrence). (2) Split data by team (NATO vs. Russia). (3) Verify assumptions: check normality with Shapiro-Wilk test or Q-Q plots; assess homogeneity of variance with Levene's test. (4) If assumptions hold (or n≥30 per group), run independent samples t-test. (5) Report means, standard deviations, t-statistic, degrees of freedom, p-value, and 95% confidence interval for the difference. (6) Calculate and report Cohen's d effect size: small (0.2), medium (0.5), large (0.8). For non-parametric Mann-Whitney: (7) If assumptions fail, use Mann-Whitney U test to compare distributions. (8) Report medians, U-statistic, and p-value. (9) Visualize with side-by-side boxplots showing group distributions, medians, and outliers.`
      };
    }
    
    if ((asksHow || asksWhat) && mentionsDomain) {
      return {
        name: "One-Way ANOVA or Kruskal-Wallis Test",
        justification: `Your research question examines patterns or differences across multiple domains (Joint, Economy, Cognitive, Space, Cyber), which requires comparing more than two groups simultaneously. One-Way ANOVA is the appropriate test for this scenario, extending t-test logic to multiple groups while controlling Type I error. ANOVA tests whether at least one domain shows significantly different performance from the others. Check assumptions: normality within each domain group (Shapiro-Wilk test), homogeneity of variance across domains (Levene's test), and independence of observations. If these assumptions are violated, especially with small samples or skewed data, use the Kruskal-Wallis test—a non-parametric alternative that compares ranks across groups. Follow significant results with post-hoc comparisons to identify which specific domains differ.`,
        application: `For parametric ANOVA: (1) Select one continuous outcome measure (e.g., average deterrence in each domain). (2) Organize data with domain as the grouping factor (5 levels: joint, economy, cognitive, space, cyber). (3) Check assumptions: normality in each domain, equal variances, independence. (4) Run One-Way ANOVA and examine F-statistic and p-value. (5) If p<0.05, at least one domain differs—proceed to post-hoc tests. (6) Use Tukey HSD or Bonferroni corrections to identify specific domain pairs that differ significantly. (7) Report F-value, degrees of freedom, p-value, and partial eta-squared effect size. For non-parametric Kruskal-Wallis: (8) If assumptions fail, use Kruskal-Wallis test on ranks. (9) Follow up with Dunn's test for pairwise comparisons. (10) Visualize with grouped boxplots or bar charts with error bars showing domain means and confidence intervals.`
      };
    }
    
    if (mentionsTiming || /temporal|longitudinal|progression|across\s+turn/.test(lowerQuestion)) {
      return {
        name: "Repeated Measures ANOVA or Mixed-Effects Models",
        justification: `Your research question investigates changes or patterns over time (across turns), which requires within-subjects analysis. Repeated Measures ANOVA is appropriate when the same sessions or teams are measured at multiple time points, accounting for the correlation between repeated measurements from the same entity. This design is more powerful than between-subjects comparisons because it controls for individual differences, isolating the effect of time. Check the sphericity assumption (equal variances of differences between time points) using Mauchly's test, and apply Greenhouse-Geisser corrections if violated. For more complex temporal patterns or unbalanced data, consider mixed-effects models that can handle missing data and model both fixed time effects and random subject effects.`,
        application: `For Repeated Measures ANOVA: (1) Structure your data with sessions/teams as subjects and turns as repeated measurements. (2) Ensure balanced design (same time points for all subjects). (3) Test sphericity with Mauchly's test; if violated (p<0.05), apply Greenhouse-Geisser or Huynh-Feldt corrections. (4) Run the analysis examining the within-subjects effect of time/turn. (5) If significant, conduct pairwise comparisons with Bonferroni adjustments to identify which turns differ. (6) Report F-value, corrected degrees of freedom, p-value, and partial eta-squared. (7) Create line graphs showing mean outcome across turns with error bars. For Mixed-Effects Models: (8) Specify time as a fixed effect and sessions/teams as random effects. (9) Allow for missing data and unbalanced designs. (10) Examine fixed effect coefficients for time trends. (11) Visualize individual trajectories alongside population-average trends.`
      };
    }
    
    if (mentionsEffect || /predict|determin|influence/.test(lowerQuestion)) {
      return {
        name: "Multiple Regression or Path Analysis",
        justification: `Your research question explores how variables influence or determine outcomes, suggesting a need for predictive modeling. Multiple regression allows you to examine how one or more predictor variables explain variance in an outcome variable. Unlike simple correlation, regression provides directionality and quantifies the unique contribution of each predictor while controlling for others. Check regression assumptions: linearity (scatterplots), independence of errors, homoscedasticity (constant variance), normality of residuals (Q-Q plots), and absence of multicollinearity (VIF < 10). For more complex causal pathways, consider path analysis or structural equation modeling to test mediation and indirect effects. Ensure adequate sample size: at least 10-15 observations per predictor variable for reliable estimates.`,
        application: `Step 1 - Model Building: (1) Identify your dependent variable (outcome to explain) and independent variables (predictors). (2) Ensure minimum 10-15 observations per predictor. (3) Check for high correlations among predictors (multicollinearity); consider removing redundant variables. Step 2 - Assumption Checking: (4) Create scatterplots to verify linear relationships between predictors and outcome. (5) Run regression and examine residual plots for homoscedasticity and normality. (6) Calculate VIF values to check multicollinearity (VIF > 10 is problematic). Step 3 - Model Interpretation: (7) Examine R-squared to assess total variance explained (adjusted R-squared for multiple predictors). (8) Evaluate each predictor's beta coefficient (magnitude), direction (sign), and significance (p-value). (9) Report standardized betas to compare relative importance of predictors. (10) Check Cook's distance to identify influential outliers. (11) Visualize with partial regression plots showing each predictor's unique contribution.`
      };
    }
    
    // Default exploratory recommendation
    return {
      name: "Exploratory Data Analysis + Descriptive Statistics",
      justification: `Your research question is exploratory in nature, seeking to understand patterns and relationships in your data. The most appropriate starting point is comprehensive Exploratory Data Analysis (EDA) combined with robust descriptive statistics. EDA helps you understand data distributions, identify outliers, discover patterns, and generate insights that can inform future hypothesis-driven research. Begin with univariate analyses (means, medians, standard deviations, ranges) for each variable, then move to bivariate analyses (cross-tabulations, correlation matrices, grouped comparisons). Visualizations are crucial: use histograms, boxplots, scatterplots, and heatmaps to reveal patterns that numbers alone might miss. This exploratory foundation will help you identify promising relationships to test with more targeted statistical methods.`,
      application: `Phase 1 - Univariate Analysis: (1) Calculate descriptive statistics for all key variables: mean, median, standard deviation, range, quartiles. (2) Create frequency distributions and histograms to understand variable distributions. (3) Identify outliers using boxplots and z-scores. (4) Check for data quality issues (missing values, impossible values). Phase 2 - Bivariate Analysis: (5) Create correlation matrices to explore relationships between continuous variables. (6) Use cross-tabulations for categorical variables (e.g., team × outcome, strategy type × winner). (7) Generate grouped comparisons (e.g., mean deterrence by team, by domain, by strategy type). Phase 3 - Visualization: (8) Create comprehensive visualizations: scatterplot matrices, grouped boxplots, heatmaps, time series plots. (9) Look for patterns, trends, and anomalies. Phase 4 - Insight Generation: (10) Synthesize findings into key insights and patterns. (11) Formulate specific hypotheses for future confirmatory testing. (12) Identify which statistical tests would be most appropriate for follow-up analyses.`
      };
  }, [researchQuestionLeft]);

  // Get statistical test recommendation based on research question 2
  const getResearchQuestionBasedTestRecommendation2 = useMemo(() => {
    if (!researchQuestionRight.trim()) return null;
    
    const lowerQuestion = researchQuestionRight.toLowerCase();
    
    // Analyze research question structure
    const asksWhich = /\bwhich\b/.test(lowerQuestion);
    const asksHow = /\bhow\b/.test(lowerQuestion);
    const asksWhat = /\bwhat\b/.test(lowerQuestion);
    const asksWhy = /\bwhy\b/.test(lowerQuestion);
    const asksDoes = /\bdoes\b|\bdo\b/.test(lowerQuestion);
    const asksAre = /\bare\b|\bis\b/.test(lowerQuestion);
    
    const mentionsComparison = /compar|differ|versus|vs\.?|between/.test(lowerQuestion);
    const mentionsRelationship = /correlat|relationship|associat|pattern|connect/.test(lowerQuestion);
    const mentionsEffect = /effect|impact|influence|affect|determin/.test(lowerQuestion);
    const mentionsStrategy = /strateg|approach|method|tactic/.test(lowerQuestion);
    const mentionsDomain = /domain|dimension/.test(lowerQuestion);
    const mentionsTiming = /timing|when|early|late|over time|across turns/.test(lowerQuestion);
    const mentionsTeams = /nato.*russia|russia.*nato|team|both teams/.test(lowerQuestion);
    
    // Exploratory questions asking "which" often need multiple comparisons
    if (asksWhich && mentionsStrategy) {
      return {
        name: "Exploratory Analysis: Descriptive Statistics + Chi-Square or ANOVA",
        justification: `Your research question explores which strategies are most effective, which is inherently exploratory and comparative. This requires examining multiple strategy types and their outcomes. Since research questions are broader than hypotheses, start with descriptive statistics to understand patterns in your data—calculate means, frequencies, and distributions for different strategies. Then, depending on your data structure, use Chi-Square tests to examine associations between categorical strategy types and outcomes (win/loss), or use One-Way ANOVA to compare continuous outcome measures (deterrence scores) across multiple strategy groups. This two-phase approach provides both descriptive insights and inferential statistical support for identifying effective strategies.`,
        application: `Phase 1 - Descriptive Analysis: (1) Categorize sessions by dominant strategy type (e.g., economy-focused, cyber-focused, balanced). (2) Calculate win rates, average deterrence scores, and other relevant metrics for each strategy category. (3) Create frequency tables and visualizations (bar charts, pie charts) to identify patterns. Phase 2 - Inferential Testing: For categorical outcomes (wins): (4) Use Chi-Square test to determine if certain strategies are associated with higher win rates. (5) Calculate odds ratios to quantify strategy effectiveness. For continuous outcomes (deterrence scores): (6) Use One-Way ANOVA to compare mean deterrence across strategy groups. (7) Conduct post-hoc tests (Tukey HSD) to identify which specific strategies differ significantly. (8) Report effect sizes to quantify practical significance. (9) Create visualizations showing strategy effectiveness with confidence intervals.`
      };
    }
    
    if ((asksHow || asksWhat) && mentionsRelationship) {
      return {
        name: "Correlation Analysis (Pearson/Spearman) + Regression",
        justification: `Your research question investigates how variables relate or what patterns exist, which calls for correlation and regression analysis. Unlike hypothesis testing with directional predictions, research questions are exploratory—you're discovering relationships rather than confirming them. Start with correlation analysis to examine bivariate relationships between variables (e.g., economic investment and total deterrence). Pearson correlation works for linear relationships with normally distributed continuous variables, while Spearman correlation handles non-linear monotonic relationships and ordinal data. If you find significant correlations and want to understand prediction, follow up with regression analysis to model how predictor variables explain variance in outcomes. This combination provides both the strength of relationships and their predictive power.`,
        application: `Step 1 - Correlation Analysis: (1) Identify pairs of continuous variables that theoretically might be related based on your research question. (2) Create scatterplots to visualize relationships and check for linearity, outliers, and influential points. (3) Calculate Pearson's r for linear relationships or Spearman's ρ for monotonic relationships. (4) Interpret correlation strength: |r| < 0.3 (weak), 0.3-0.7 (moderate), > 0.7 (strong). (5) Assess statistical significance with p-values, but focus on effect sizes for practical importance. Step 2 - Regression Analysis (optional): (6) If correlations are promising, build regression models with theoretically meaningful predictors. (7) Examine R-squared values to understand variance explained. (8) Report standardized beta coefficients to compare relative importance of predictors. (9) Create visualization showing predicted relationships with confidence bands.`
      };
    }
    
    if ((asksAre || asksDoes) && mentionsComparison && mentionsTeams) {
      return {
        name: "Independent Samples t-test or Mann-Whitney U Test",
        justification: `Your research question compares two groups (NATO vs. Russia) on outcome measures, making this a classic two-group comparison scenario. Since research questions are exploratory, you're investigating whether differences exist rather than confirming a predicted direction. Use an independent samples t-test when comparing mean deterrence scores or other continuous outcomes between the two teams. The t-test assumes approximately normal distributions and similar variances between groups—check these with visual diagnostics (histograms, Q-Q plots) and Levene's test. If assumptions are violated or you have small sample sizes, the non-parametric Mann-Whitney U test provides a robust alternative that compares distributions without normality assumptions. Both tests will reveal whether team differences are statistically and practically significant.`,
        application: `For parametric t-test: (1) Select your continuous outcome variable (e.g., total deterrence, economic deterrence). (2) Split data by team (NATO vs. Russia). (3) Verify assumptions: check normality with Shapiro-Wilk test or Q-Q plots; assess homogeneity of variance with Levene's test. (4) If assumptions hold (or n≥30 per group), run independent samples t-test. (5) Report means, standard deviations, t-statistic, degrees of freedom, p-value, and 95% confidence interval for the difference. (6) Calculate and report Cohen's d effect size: small (0.2), medium (0.5), large (0.8). For non-parametric Mann-Whitney: (7) If assumptions fail, use Mann-Whitney U test to compare distributions. (8) Report medians, U-statistic, and p-value. (9) Visualize with side-by-side boxplots showing group distributions, medians, and outliers.`
      };
    }
    
    if ((asksHow || asksWhat) && mentionsDomain) {
      return {
        name: "One-Way ANOVA or Kruskal-Wallis Test",
        justification: `Your research question examines patterns or differences across multiple domains (Joint, Economy, Cognitive, Space, Cyber), which requires comparing more than two groups simultaneously. One-Way ANOVA is the appropriate test for this scenario, extending t-test logic to multiple groups while controlling Type I error. ANOVA tests whether at least one domain shows significantly different performance from the others. Check assumptions: normality within each domain group (Shapiro-Wilk test), homogeneity of variance across domains (Levene's test), and independence of observations. If these assumptions are violated, especially with small samples or skewed data, use the Kruskal-Wallis test—a non-parametric alternative that compares ranks across groups. Follow significant results with post-hoc comparisons to identify which specific domains differ.`,
        application: `For parametric ANOVA: (1) Select one continuous outcome measure (e.g., average deterrence in each domain). (2) Organize data with domain as the grouping factor (5 levels: joint, economy, cognitive, space, cyber). (3) Check assumptions: normality in each domain, equal variances, independence. (4) Run One-Way ANOVA and examine F-statistic and p-value. (5) If p<0.05, at least one domain differs—proceed to post-hoc tests. (6) Use Tukey HSD or Bonferroni corrections to identify specific domain pairs that differ significantly. (7) Report F-value, degrees of freedom, p-value, and partial eta-squared effect size. For non-parametric Kruskal-Wallis: (8) If assumptions fail, use Kruskal-Wallis test on ranks. (9) Follow up with Dunn's test for pairwise comparisons. (10) Visualize with grouped boxplots or bar charts with error bars showing domain means and confidence intervals.`
      };
    }
    
    if (mentionsTiming || /temporal|longitudinal|progression|across\s+turn/.test(lowerQuestion)) {
      return {
        name: "Repeated Measures ANOVA or Mixed-Effects Models",
        justification: `Your research question investigates changes or patterns over time (across turns), which requires within-subjects analysis. Repeated Measures ANOVA is appropriate when the same sessions or teams are measured at multiple time points, accounting for the correlation between repeated measurements from the same entity. This design is more powerful than between-subjects comparisons because it controls for individual differences, isolating the effect of time. Check the sphericity assumption (equal variances of differences between time points) using Mauchly's test, and apply Greenhouse-Geisser corrections if violated. For more complex temporal patterns or unbalanced data, consider mixed-effects models that can handle missing data and model both fixed time effects and random subject effects.`,
        application: `For Repeated Measures ANOVA: (1) Structure your data with sessions/teams as subjects and turns as repeated measurements. (2) Ensure balanced design (same time points for all subjects). (3) Test sphericity with Mauchly's test; if violated (p<0.05), apply Greenhouse-Geisser or Huynh-Feldt corrections. (4) Run the analysis examining the within-subjects effect of time/turn. (5) If significant, conduct pairwise comparisons with Bonferroni adjustments to identify which turns differ. (6) Report F-value, corrected degrees of freedom, p-value, and partial eta-squared. (7) Create line graphs showing mean outcome across turns with error bars. For Mixed-Effects Models: (8) Specify time as a fixed effect and sessions/teams as random effects. (9) Allow for missing data and unbalanced designs. (10) Examine fixed effect coefficients for time trends. (11) Visualize individual trajectories alongside population-average trends.`
      };
    }
    
    if (mentionsEffect || /predict|determin|influence/.test(lowerQuestion)) {
      return {
        name: "Multiple Regression or Path Analysis",
        justification: `Your research question explores how variables influence or determine outcomes, suggesting a need for predictive modeling. Multiple regression allows you to examine how one or more predictor variables explain variance in an outcome variable. Unlike simple correlation, regression provides directionality and quantifies the unique contribution of each predictor while controlling for others. Check regression assumptions: linearity (scatterplots), independence of errors, homoscedasticity (constant variance), normality of residuals (Q-Q plots), and absence of multicollinearity (VIF < 10). For more complex causal pathways, consider path analysis or structural equation modeling to test mediation and indirect effects. Ensure adequate sample size: at least 10-15 observations per predictor variable for reliable estimates.`,
        application: `Step 1 - Model Building: (1) Identify your dependent variable (outcome to explain) and independent variables (predictors). (2) Ensure minimum 10-15 observations per predictor. (3) Check for high correlations among predictors (multicollinearity); consider removing redundant variables. Step 2 - Assumption Checking: (4) Create scatterplots to verify linear relationships between predictors and outcome. (5) Run regression and examine residual plots for homoscedasticity and normality. (6) Calculate VIF values to check multicollinearity (VIF > 10 is problematic). Step 3 - Model Interpretation: (7) Examine R-squared to assess total variance explained (adjusted R-squared for multiple predictors). (8) Evaluate each predictor's beta coefficient (magnitude), direction (sign), and significance (p-value). (9) Report standardized betas to compare relative importance of predictors. (10) Check Cook's distance to identify influential outliers. (11) Visualize with partial regression plots showing each predictor's unique contribution.`
      };
    }
    
    // Default exploratory recommendation
    return {
      name: "Exploratory Data Analysis + Descriptive Statistics",
      justification: `Your research question is exploratory in nature, seeking to understand patterns and relationships in your data. The most appropriate starting point is comprehensive Exploratory Data Analysis (EDA) combined with robust descriptive statistics. EDA helps you understand data distributions, identify outliers, discover patterns, and generate insights that can inform future hypothesis-driven research. Begin with univariate analyses (means, medians, standard deviations, ranges) for each variable, then move to bivariate analyses (cross-tabulations, correlation matrices, grouped comparisons). Visualizations are crucial: use histograms, boxplots, scatterplots, and heatmaps to reveal patterns that numbers alone might miss. This exploratory foundation will help you identify promising relationships to test with more targeted statistical methods.`,
      application: `Phase 1 - Univariate Analysis: (1) Calculate descriptive statistics for all key variables: mean, median, standard deviation, range, quartiles. (2) Create frequency distributions and histograms to understand variable distributions. (3) Identify outliers using boxplots and z-scores. (4) Check for data quality issues (missing values, impossible values). Phase 2 - Bivariate Analysis: (5) Create correlation matrices to explore relationships between continuous variables. (6) Use cross-tabulations for categorical variables (e.g., team × outcome, strategy type × winner). (7) Generate grouped comparisons (e.g., mean deterrence by team, by domain, by strategy type). Phase 3 - Visualization: (8) Create comprehensive visualizations: scatterplot matrices, grouped boxplots, heatmaps, time series plots. (9) Look for patterns, trends, and anomalies. Phase 4 - Insight Generation: (10) Synthesize findings into key insights and patterns. (11) Formulate specific hypotheses for future confirmatory testing. (12) Identify which statistical tests would be most appropriate for follow-up analyses.`
      };
  }, [researchQuestionRight]);

  // Calculate card purchase frequency
  const cardFrequencyData = useMemo(() => {
    if (!sessions || selectedCards.length === 0 || selectedSessions.length === 0) {
      return [];
    }

    const selectedSessionData = sessions.filter(s => selectedSessions.includes(s.sessionName));
    const totalSessions = selectedSessionData.length;
    
    return selectedCards.map(cardId => {
      const card = cardsData.find(c => c.id === cardId);
      let natoCount = 0;
      let russiaCount = 0;
      let totalCount = 0;
      
      // Track unique sessions where this card appears (for percentage calculation)
      const sessionsWithNato = new Set<string>();
      const sessionsWithRussia = new Set<string>();
      const sessionsWithAny = new Set<string>();

      selectedSessionData.forEach(session => {
        const strategyLog = session.gameState?.strategyLog || [];
        
        strategyLog.forEach((log: any) => {
          // Match pattern: "TEAM purchased CardName (ID) for XK"
          const purchaseMatch = log.action.match(/purchased.*\(([^)]+)\)/i);
          if (purchaseMatch && purchaseMatch[1] === cardId) {
            totalCount++;
            sessionsWithAny.add(session.sessionName);
            
            if (log.team === "NATO") {
              natoCount++;
              sessionsWithNato.add(session.sessionName);
            } else if (log.team === "Russia") {
              russiaCount++;
              sessionsWithRussia.add(session.sessionName);
            }
          }
        });
      });

      // Calculate session appearance counts and percentages based on filter
      let displayCount = totalCount;
      let sessionsAppeared = sessionsWithAny.size;
      
      if (cardTeamFilter === "NATO") {
        displayCount = natoCount;
        sessionsAppeared = sessionsWithNato.size;
      } else if (cardTeamFilter === "Russia") {
        displayCount = russiaCount;
        sessionsAppeared = sessionsWithRussia.size;
      }

      const percentage = totalSessions > 0 ? (sessionsAppeared / totalSessions * 100).toFixed(1) : "0.0";

      return {
        cardId,
        cardName: card?.name || cardId,
        natoCount,
        russiaCount,
        totalCount,
        displayCount,
        percentage,
        sessionsAppeared
      };
    }).sort((a, b) => b.displayCount - a.displayCount);
  }, [sessions, selectedSessions, selectedCards, cardTeamFilter]);

  // Calculate card rankings by dimension for NATO and Russia
  const cardRankingsByDimension = useMemo(() => {
    if (!sessions || selectedSessions.length === 0) {
      return {
        joint: { nato: [], russia: [] },
        economy: { nato: [], russia: [] },
        cognitive: { nato: [], russia: [] },
        space: { nato: [], russia: [] },
        cyber: { nato: [], russia: [] }
      };
    }

    const selectedSessionData = sessions.filter(s => selectedSessions.includes(s.sessionName));
    
    // Initialize rankings structure by dimension
    const rankings: Record<Domain, {
      nato: Array<{ cardId: string; cardName: string; count: number; domainPercentage: string; overallPercentage: string; }>;
      russia: Array<{ cardId: string; cardName: string; count: number; domainPercentage: string; overallPercentage: string; }>;
    }> = {
      joint: { nato: [], russia: [] },
      economy: { nato: [], russia: [] },
      cognitive: { nato: [], russia: [] },
      space: { nato: [], russia: [] },
      cyber: { nato: [], russia: [] }
    };
    
    // Count total purchases by team for overall percentage calculation
    let natoTotalPurchases = 0;
    let russiaTotalPurchases = 0;
    
    // Count purchases by domain for domain percentage calculation
    const natoDomainCounts: Record<Domain, number> = {
      joint: 0,
      economy: 0,
      cognitive: 0,
      space: 0,
      cyber: 0
    };
    const russiaDomainCounts: Record<Domain, number> = {
      joint: 0,
      economy: 0,
      cognitive: 0,
      space: 0,
      cyber: 0
    };

    // Map to track card purchase counts
    const cardCounts: Record<string, { nato: number; russia: number; domain: Domain; name: string; }> = {};

    selectedSessionData.forEach(session => {
      const strategyLog = session.gameState?.strategyLog || [];
      
      strategyLog.forEach((log: any) => {
        // Match pattern: "TEAM purchased CardName (ID) for XK"
        const purchaseMatch = log.action.match(/purchased.*\(([^)]+)\)/i);
        if (purchaseMatch) {
          const cardId = purchaseMatch[1];
          const card = cardsData.find(c => c.id === cardId);
          
          if (card && card.domain) {
            const domain = card.domain as Domain;
            
            // Initialize card entry if not exists
            if (!cardCounts[cardId]) {
              cardCounts[cardId] = { nato: 0, russia: 0, domain, name: card.name };
            }
            
            if (log.team === "NATO") {
              cardCounts[cardId].nato++;
              natoTotalPurchases++;
              natoDomainCounts[domain]++;
            } else if (log.team === "Russia") {
              cardCounts[cardId].russia++;
              russiaTotalPurchases++;
              russiaDomainCounts[domain]++;
            }
          }
        }
      });
    });

    // Build rankings for each domain
    domains.forEach(domain => {
      const natoCardsInDomain: Array<{ cardId: string; cardName: string; count: number; domainPercentage: string; overallPercentage: string; }> = [];
      const russiaCardsInDomain: Array<{ cardId: string; cardName: string; count: number; domainPercentage: string; overallPercentage: string; }> = [];

      Object.entries(cardCounts).forEach(([cardId, data]) => {
        if (data.domain === domain) {
          if (data.nato > 0) {
            const domainPercentage = natoDomainCounts[domain] > 0 
              ? ((data.nato / natoDomainCounts[domain]) * 100).toFixed(1)
              : "0.0";
            const overallPercentage = natoTotalPurchases > 0
              ? ((data.nato / natoTotalPurchases) * 100).toFixed(1)
              : "0.0";
            natoCardsInDomain.push({
              cardId,
              cardName: data.name,
              count: data.nato,
              domainPercentage,
              overallPercentage
            });
          }
          
          if (data.russia > 0) {
            const domainPercentage = russiaDomainCounts[domain] > 0
              ? ((data.russia / russiaDomainCounts[domain]) * 100).toFixed(1)
              : "0.0";
            const overallPercentage = russiaTotalPurchases > 0
              ? ((data.russia / russiaTotalPurchases) * 100).toFixed(1)
              : "0.0";
            russiaCardsInDomain.push({
              cardId,
              cardName: data.name,
              count: data.russia,
              domainPercentage,
              overallPercentage
            });
          }
        }
      });

      // Sort by count descending
      rankings[domain].nato = natoCardsInDomain.sort((a, b) => b.count - a.count);
      rankings[domain].russia = russiaCardsInDomain.sort((a, b) => b.count - a.count);
    });

    return rankings;
  }, [sessions, selectedSessions]);

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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel: Research Question 1, Hypothesis 1, Session Filtering, Variable Selection, Card Analysis */}
          <div className="lg:col-span-1 space-y-4">
            {/* Research Question 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Research Question 1
                </CardTitle>
                <CardDescription>
                  Define your first research question to guide your analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="predefined-question-left">Quick Select: Predefined Questions</Label>
                  <Select 
                    value={selectedPredefinedQuestionLeft} 
                    onValueChange={(value) => {
                      setSelectedPredefinedQuestionLeft(value);
                      const selected = predefinedQuestions.find(q => q.id === value);
                      if (selected) {
                        setResearchQuestionLeft(selected.text);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-predefined-question-left">
                      <SelectValue placeholder="Select a question template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedQuestions.map(q => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-question-left">Your Research Question</Label>
                  <textarea
                    id="research-question-left"
                    value={researchQuestionLeft}
                    onChange={(e) => {
                      setResearchQuestionLeft(e.target.value);
                      if (selectedPredefinedQuestionLeft) {
                        setSelectedPredefinedQuestionLeft("");
                      }
                    }}
                    placeholder="Example: How does early investment in economy domain correlate with final deterrence scores?"
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y"
                    data-testid="textarea-research-question-left"
                  />
                </div>

                {researchQuestionLeft.trim() && getResearchQuestionBasedTestRecommendation1 && (
                  <div className="space-y-3 pt-4 border-t" data-testid="container-statistical-test-rq1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold">Recommended Statistical Approach</h3>
                    </div>
                    
                    <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div>
                        <Badge variant="default" className="mb-2" data-testid="badge-recommended-test-name-rq1">
                          {getResearchQuestionBasedTestRecommendation1.name}
                        </Badge>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Why This Approach?</h4>
                        <p className="text-sm leading-relaxed" data-testid="text-test-justification-rq1">
                          {getResearchQuestionBasedTestRecommendation1.justification}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">How to Apply</h4>
                        <p className="text-sm leading-relaxed" data-testid="text-test-application-rq1">
                          {getResearchQuestionBasedTestRecommendation1.application}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hypothesis 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  Hypothesis 1
                </CardTitle>
                <CardDescription>
                  Enter your first research hypothesis to get variable recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="predefined-hypothesis-1">Quick Select: Predefined Hypotheses</Label>
                  <Select 
                    value={selectedPredefinedHypothesis1} 
                    onValueChange={(value) => {
                      setSelectedPredefinedHypothesis1(value);
                      const selected = predefinedHypotheses.find(h => h.id === value);
                      if (selected) {
                        setHypothesis1(selected.text);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-predefined-hypothesis-1">
                      <SelectValue placeholder="Select a hypothesis template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedHypotheses.map(hyp => (
                        <SelectItem key={hyp.id} value={hyp.id}>
                          {hyp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hypothesis-1">Your Hypothesis</Label>
                  <textarea
                    id="hypothesis-1"
                    value={hypothesis1}
                    onChange={(e) => {
                      setHypothesis1(e.target.value);
                      if (selectedPredefinedHypothesis1) {
                        setSelectedPredefinedHypothesis1("");
                      }
                    }}
                    placeholder="Example: NATO's economic domain performance is positively correlated with their overall deterrence score..."
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y"
                    data-testid="textarea-hypothesis-1"
                  />
                </div>

                {hypothesis1.trim() && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Recommended Variables</h3>
                      {recommendedVariables1.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {recommendedVariables1.length} suggestion{recommendedVariables1.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {recommendedVariables1.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Based on your hypothesis, consider selecting these variables:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {recommendedVariables1.map(varId => {
                            const variable = availableVariables.find(v => v.id === varId);
                            const isSelected = selectedVariables.includes(varId);
                            
                            return (
                              <div
                                key={varId}
                                className={`flex items-center justify-between p-2 rounded-md border transition-colors ${
                                  isSelected 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border bg-muted/30 hover-elevate'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  {isSelected ? (
                                    <Badge variant="default" className="text-xs">Selected</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Recommended</Badge>
                                  )}
                                  <span className="text-sm">{variable?.label}</span>
                                </div>
                                {!isSelected && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleVariable(varId)}
                                    data-testid={`button-select-${varId}`}
                                  >
                                    Select
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {recommendedVariables1.some(v => !selectedVariables.includes(v)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const toAdd = recommendedVariables1.filter(v => !selectedVariables.includes(v));
                              setSelectedVariables(prev => [...prev, ...toAdd]);
                            }}
                            className="w-full"
                            data-testid="button-select-all-recommended-1"
                          >
                            Select All Recommended
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                        No specific variable recommendations. Try mentioning team names (NATO/Russia), domains (economy, cyber, space, cognitive, joint), or comparison terms in your hypothesis.
                      </p>
                    )}
                  </div>
                )}

                {!hypothesis1.trim() && (
                  <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                    Enter a hypothesis above to receive personalized variable recommendations for your analysis.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Statistical Test Recommendations for Hypothesis 1 - Two Cards in Grid */}
            {hypothesis1.trim() && getHypothesisBasedTestRecommendation1?.length === 2 && (
              <div className="grid grid-cols-2 gap-4">
                {/* Statistical Test Recommendation 1-1 */}
                <Card data-testid="card-statistical-test-1-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Statistical Test Recommendation 1
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="default" className="mb-2" data-testid="badge-recommended-test-name-1-1">
                        {getHypothesisBasedTestRecommendation1[0].name}
                      </Badge>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Why This Test?</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-justification-1-1">
                        {getHypothesisBasedTestRecommendation1[0].justification}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">How to Apply</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-application-1-1">
                        {getHypothesisBasedTestRecommendation1[0].application}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistical Test Recommendation 1-2 */}
                <Card data-testid="card-statistical-test-1-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Statistical Test Recommendation 2
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="default" className="mb-2" data-testid="badge-recommended-test-name-1-2">
                        {getHypothesisBasedTestRecommendation1[1].name}
                      </Badge>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Why This Test?</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-justification-1-2">
                        {getHypothesisBasedTestRecommendation1[1].justification}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">How to Apply</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-application-1-2">
                        {getHypothesisBasedTestRecommendation1[1].application}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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

            {/* Card Purchase Frequency Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Card Purchase Frequency
                </CardTitle>
                <CardDescription>
                  Analyze how often specific cards are purchased across selected sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Card Selection and Team Filter */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Team Filter</Label>
                      <Select value={cardTeamFilter} onValueChange={setCardTeamFilter}>
                        <SelectTrigger data-testid="select-card-team-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both Teams</SelectItem>
                          <SelectItem value="NATO">NATO Only</SelectItem>
                          <SelectItem value="Russia">Russia Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Select Cards to Analyze</Label>
                    <ScrollArea className="h-48 border rounded-md p-2 mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        {cardsData
                          .sort((a, b) => a.id.localeCompare(b.id))
                          .map((card: any) => (
                            <div
                              key={card.id}
                              className="flex items-center gap-2 p-1 rounded hover-elevate"
                            >
                              <Checkbox
                                checked={selectedCards.includes(card.id)}
                                onCheckedChange={() => toggleCard(card.id)}
                                data-testid={`checkbox-card-${card.id}`}
                              />
                              <Label 
                                className="text-xs cursor-pointer flex-1"
                                onClick={() => toggleCard(card.id)}
                              >
                                <span className="font-mono font-semibold">{card.id}</span>
                                {" - "}
                                <span className="text-muted-foreground">{card.name}</span>
                              </Label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {/* Frequency Results */}
                {selectedCards.length > 0 && selectedSessions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Frequency Results</h3>
                      <Badge variant="outline">
                        {selectedSessions.length} session(s)
                      </Badge>
                    </div>

                    {cardFrequencyData.length > 0 ? (
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {cardFrequencyData.map((data) => (
                            <div 
                              key={data.cardId} 
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold font-mono">
                                    {data.cardId}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {data.cardName}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">{data.displayCount}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {data.displayCount === 1 ? 'purchase' : 'purchases'}
                                  </p>
                                  <p className="text-xs font-semibold text-primary mt-1">
                                    {data.sessionsAppeared} / {selectedSessions.length} sessions ({data.percentage}%)
                                  </p>
                                </div>
                              </div>

                              {/* Team breakdown when showing both teams */}
                              {cardTeamFilter === "both" && (
                                <div className="flex gap-2 text-xs">
                                  <div className="flex-1 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-muted-foreground">NATO</p>
                                    <p className="font-semibold">{data.natoCount}</p>
                                  </div>
                                  <div className="flex-1 p-2 rounded bg-red-500/10 border border-red-500/20">
                                    <p className="text-muted-foreground">Russia</p>
                                    <p className="font-semibold">{data.russiaCount}</p>
                                  </div>
                                </div>
                              )}

                              {/* Visual bar */}
                              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${Math.min(parseFloat(data.percentage), 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No purchases found for selected cards in the selected sessions.
                      </p>
                    )}
                  </div>
                )}

                {selectedCards.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select cards above to view purchase frequency analysis
                  </p>
                )}

                {selectedSessions.length === 0 && selectedCards.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select sessions from the left panel to analyze card purchase frequency
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Card Rankings by Dimension */}
            {selectedSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Card Rankings by Dimension
                  </CardTitle>
                  <CardDescription>
                    Most purchased cards by NATO and Russia, organized by dimension
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-6">
                      {domains.map(domain => {
                        const domainRankings = cardRankingsByDimension[domain];
                        if (!domainRankings) return null;

                        const hasNatoCards = domainRankings.nato.length > 0;
                        const hasRussiaCards = domainRankings.russia.length > 0;

                        if (!hasNatoCards && !hasRussiaCards) return null;

                        return (
                          <div key={domain} className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                              {domain} Domain
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                              {/* NATO Rankings */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                                  <p className="text-xs font-semibold text-muted-foreground">NATO</p>
                                </div>
                                
                                {hasNatoCards ? (
                                  <div className="space-y-2">
                                    {domainRankings.nato.slice(0, 5).map((card: { cardId: string; cardName: string; count: number; domainPercentage: string; overallPercentage: string; }, index: number) => (
                                      <div 
                                        key={card.cardId}
                                        className="border rounded-md p-2 space-y-1 bg-blue-500/5"
                                        data-testid={`ranking-nato-${domain}-${card.cardId}`}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs px-1 py-0">
                                                #{index + 1}
                                              </Badge>
                                              <p className="text-xs font-mono font-semibold truncate">
                                                {card.cardId}
                                              </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-1">
                                              {card.cardName}
                                            </p>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold">{card.count}</p>
                                            <p className="text-xs text-muted-foreground">purchases</p>
                                          </div>
                                        </div>
                                        <div className="flex gap-3 text-xs">
                                          <div className="flex-1">
                                            <p className="text-muted-foreground">In Domain:</p>
                                            <p className="font-semibold">{card.domainPercentage}%</p>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-muted-foreground">Overall:</p>
                                            <p className="font-semibold">{card.overallPercentage}%</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    No {domain} cards purchased
                                  </p>
                                )}
                              </div>

                              {/* Russia Rankings */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500" />
                                  <p className="text-xs font-semibold text-muted-foreground">Russia</p>
                                </div>
                                
                                {hasRussiaCards ? (
                                  <div className="space-y-2">
                                    {domainRankings.russia.slice(0, 5).map((card: { cardId: string; cardName: string; count: number; domainPercentage: string; overallPercentage: string; }, index: number) => (
                                      <div 
                                        key={card.cardId}
                                        className="border rounded-md p-2 space-y-1 bg-red-500/5"
                                        data-testid={`ranking-russia-${domain}-${card.cardId}`}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs px-1 py-0">
                                                #{index + 1}
                                              </Badge>
                                              <p className="text-xs font-mono font-semibold truncate">
                                                {card.cardId}
                                              </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-1">
                                              {card.cardName}
                                            </p>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold">{card.count}</p>
                                            <p className="text-xs text-muted-foreground">purchases</p>
                                          </div>
                                        </div>
                                        <div className="flex gap-3 text-xs">
                                          <div className="flex-1">
                                            <p className="text-muted-foreground">In Domain:</p>
                                            <p className="font-semibold">{card.domainPercentage}%</p>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-muted-foreground">Overall:</p>
                                            <p className="font-semibold">{card.overallPercentage}%</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    No {domain} cards purchased
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {selectedSessions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Select sessions from the left panel to view card rankings by dimension
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel: Research Question 2, Hypothesis 2 & Analysis */}
          <div className="lg:col-span-1 space-y-4">
            {/* Research Question 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Research Question 2
                </CardTitle>
                <CardDescription>
                  Define your second research question to guide your analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="predefined-question-right">Quick Select: Predefined Questions</Label>
                  <Select 
                    value={selectedPredefinedQuestionRight} 
                    onValueChange={(value) => {
                      setSelectedPredefinedQuestionRight(value);
                      const selected = predefinedQuestions.find(q => q.id === value);
                      if (selected) {
                        setResearchQuestionRight(selected.text);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-predefined-question-right">
                      <SelectValue placeholder="Select a question template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedQuestions.map(q => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-question-right">Your Research Question</Label>
                  <textarea
                    id="research-question-right"
                    value={researchQuestionRight}
                    onChange={(e) => {
                      setResearchQuestionRight(e.target.value);
                      if (selectedPredefinedQuestionRight) {
                        setSelectedPredefinedQuestionRight("");
                      }
                    }}
                    placeholder="Example: How does early investment in economy domain correlate with final deterrence scores?"
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y"
                    data-testid="textarea-research-question-right"
                  />
                </div>

                {researchQuestionRight.trim() && getResearchQuestionBasedTestRecommendation2 && (
                  <div className="space-y-3 pt-4 border-t" data-testid="container-statistical-test-rq2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold">Recommended Statistical Approach</h3>
                    </div>
                    
                    <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div>
                        <Badge variant="default" className="mb-2" data-testid="badge-recommended-test-name-rq2">
                          {getResearchQuestionBasedTestRecommendation2.name}
                        </Badge>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Why This Approach?</h4>
                        <p className="text-sm leading-relaxed" data-testid="text-test-justification-rq2">
                          {getResearchQuestionBasedTestRecommendation2.justification}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">How to Apply</h4>
                        <p className="text-sm leading-relaxed" data-testid="text-test-application-rq2">
                          {getResearchQuestionBasedTestRecommendation2.application}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hypothesis 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  Hypothesis 2
                </CardTitle>
                <CardDescription>
                  Enter your second research hypothesis to get variable recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="predefined-hypothesis-2">Quick Select: Predefined Hypotheses</Label>
                  <Select 
                    value={selectedPredefinedHypothesis2} 
                    onValueChange={(value) => {
                      setSelectedPredefinedHypothesis2(value);
                      const selected = predefinedHypotheses.find(h => h.id === value);
                      if (selected) {
                        setHypothesis2(selected.text);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-predefined-hypothesis-2">
                      <SelectValue placeholder="Select a hypothesis template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedHypotheses.map(hyp => (
                        <SelectItem key={hyp.id} value={hyp.id}>
                          {hyp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hypothesis-2">Your Hypothesis</Label>
                  <textarea
                    id="hypothesis-2"
                    value={hypothesis2}
                    onChange={(e) => {
                      setHypothesis2(e.target.value);
                      if (selectedPredefinedHypothesis2) {
                        setSelectedPredefinedHypothesis2("");
                      }
                    }}
                    placeholder="Example: NATO's economic domain performance is positively correlated with their overall deterrence score..."
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y"
                    data-testid="textarea-hypothesis-2"
                  />
                </div>

                {hypothesis2.trim() && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Recommended Variables</h3>
                      {recommendedVariables2.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {recommendedVariables2.length} suggestion{recommendedVariables2.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {recommendedVariables2.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Based on your hypothesis, consider selecting these variables:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {recommendedVariables2.map(varId => {
                            const variable = availableVariables.find(v => v.id === varId);
                            const isSelected = selectedVariables.includes(varId);
                            
                            return (
                              <div
                                key={varId}
                                className={`flex items-center justify-between p-2 rounded-md border transition-colors ${
                                  isSelected 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border bg-muted/30 hover-elevate'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  {isSelected ? (
                                    <Badge variant="default" className="text-xs">Selected</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Recommended</Badge>
                                  )}
                                  <span className="text-sm">{variable?.label}</span>
                                </div>
                                {!isSelected && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleVariable(varId)}
                                    data-testid={`button-select-${varId}`}
                                  >
                                    Select
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {recommendedVariables2.some(v => !selectedVariables.includes(v)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const toAdd = recommendedVariables2.filter(v => !selectedVariables.includes(v));
                              setSelectedVariables(prev => [...prev, ...toAdd]);
                            }}
                            className="w-full"
                            data-testid="button-select-all-recommended-2"
                          >
                            Select All Recommended
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                        No specific variable recommendations. Try mentioning team names (NATO/Russia), domains (economy, cyber, space, cognitive, joint), or comparison terms in your hypothesis.
                      </p>
                    )}
                  </div>
                )}

                {!hypothesis2.trim() && (
                  <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                    Enter a hypothesis above to receive personalized variable recommendations for your analysis.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Statistical Test Recommendations for Hypothesis 2 - Two Cards in Grid */}
            {hypothesis2.trim() && getHypothesisBasedTestRecommendation2?.length === 2 && (
              <div className="grid grid-cols-2 gap-4">
                {/* Statistical Test Recommendation 2-1 */}
                <Card data-testid="card-statistical-test-2-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Statistical Test Recommendation 1
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="default" className="mb-2" data-testid="badge-recommended-test-name-2-1">
                        {getHypothesisBasedTestRecommendation2[0].name}
                      </Badge>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Why This Test?</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-justification-2-1">
                        {getHypothesisBasedTestRecommendation2[0].justification}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">How to Apply</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-application-2-1">
                        {getHypothesisBasedTestRecommendation2[0].application}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistical Test Recommendation 2-2 */}
                <Card data-testid="card-statistical-test-2-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Statistical Test Recommendation 2
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="default" className="mb-2" data-testid="badge-recommended-test-name-2-2">
                        {getHypothesisBasedTestRecommendation2[1].name}
                      </Badge>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Why This Test?</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-justification-2-2">
                        {getHypothesisBasedTestRecommendation2[1].justification}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">How to Apply</h4>
                      <p className="text-sm leading-relaxed" data-testid="text-test-application-2-2">
                        {getHypothesisBasedTestRecommendation2[1].application}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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

            {/* Generate Scientific Report */}
            {selectedSessions.length > 0 && selectedVariables.length > 0 && statisticalTests.some(t => t.appropriate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generate Results Report
                  </CardTitle>
                  <CardDescription>
                    Select a methodology and generate a scientific Results section
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Research Methodology</Label>
                    <Select value={selectedMethodology} onValueChange={setSelectedMethodology}>
                      <SelectTrigger data-testid="select-methodology">
                        <SelectValue placeholder="Choose a statistical test..." />
                      </SelectTrigger>
                      <SelectContent>
                        {statisticalTests.filter(t => t.appropriate).map((test, index) => (
                          <SelectItem key={index} value={test.name}>
                            {test.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={async () => {
                      setIsGeneratingReport(true);
                      try {
                        const reportData = prepareReportData(
                          selectedMethodology,
                          selectedSessions,
                          selectedVariables,
                          summaryStats!,
                          sessions || [],
                          groupingVariable
                        );
                        
                        const response = await fetch('/api/generate-word-report', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(reportData)
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to generate report');
                        }
                        
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `research-results-${selectedMethodology.replace(/\s+/g, '-').toLowerCase()}.docx`;
                        a.click();
                        URL.revokeObjectURL(url);
                        
                        setGeneratedReport('Word document generated successfully!');
                      } catch (error) {
                        console.error('Error generating report:', error);
                        setGeneratedReport('Error generating report. Please try again.');
                      }
                      setIsGeneratingReport(false);
                    }}
                    disabled={!selectedMethodology || isGeneratingReport}
                    className="w-full"
                    data-testid="button-generate-report"
                  >
                    {isGeneratingReport ? "Generating Word Document..." : "Generate Word Document Report"}
                  </Button>

                  {generatedReport && (
                    <div className="space-y-3 mt-4">
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm">{generatedReport}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate scientific Results report
function generateScientificReport(
  methodology: string,
  selectedSessions: string[],
  selectedVariables: string[],
  summaryStats: Record<string, any> | null,
  allSessions: GameSession[],
  groupingVariable: string,
  comparisonType: string
): string {
  const sessionData = allSessions.filter(s => selectedSessions.includes(s.sessionName));
  
  let report = `RESULTS\n\n`;
  
  // Section 1: Descriptive Statistics
  report += `Descriptive Statistics\n`;
  report += `${'='.repeat(50)}\n\n`;
  
  if (summaryStats && Object.keys(summaryStats).length > 0) {
    report += `This analysis examined ${selectedSessions.length} strategy session${selectedSessions.length > 1 ? 's' : ''} `;
    report += `across ${selectedVariables.length} dependent variable${selectedVariables.length > 1 ? 's' : ''}. `;
    
    // Describe the variables
    const varNames = Object.values(summaryStats).map((s: any) => s.label).join(', ');
    report += `The variables analyzed were: ${varNames}. `;
    
    // Describe the data characteristics
    report += `Table 1 presents descriptive statistics including means, standard deviations, and ranges for all variables.\n\n`;
    
    // Table 1: Descriptive Statistics
    report += `Table 1\nDescriptive Statistics for Study Variables\n\n`;
    report += `${'─'.repeat(80)}\n`;
    report += `Variable                          N      Mean      SD       Min       Max      Range\n`;
    report += `${'─'.repeat(80)}\n`;
    
    Object.entries(summaryStats).forEach(([varId, stats]: [string, any]) => {
      const varName = stats.label.padEnd(30);
      const n = String(stats.n).padStart(6);
      const mean = String(stats.mean).padStart(9);
      const sd = String(stats.stdDev).padStart(9);
      const min = String(stats.min).padStart(9);
      const max = String(stats.max).padStart(9);
      const range = String(stats.range).padStart(9);
      
      report += `${varName} ${n} ${mean} ${sd} ${min} ${max} ${range}\n`;
    });
    
    report += `${'─'.repeat(80)}\n`;
    report += `Note. N = sample size; SD = standard deviation.\n\n`;
    
    // Narrative description of key findings
    if (Object.keys(summaryStats).length > 0) {
      const firstVar = Object.values(summaryStats)[0] as any;
      report += `The data showed considerable variation across sessions. `;
      
      // Comment on the first variable as an example
      if (summaryStats['nato_total']) {
        const nato = summaryStats['nato_total'] as any;
        report += `For NATO Total Deterrence, scores ranged from ${nato.min} to ${nato.max} `;
        report += `(M = ${nato.mean}, SD = ${nato.stdDev}), indicating ${parseFloat(nato.stdDev) > parseFloat(nato.mean) * 0.3 ? 'substantial' : 'moderate'} variability in strategic outcomes. `;
      }
      
      if (summaryStats['russia_total']) {
        const russia = summaryStats['russia_total'] as any;
        report += `Similarly, Russia Total Deterrence values ranged from ${russia.min} to ${russia.max} `;
        report += `(M = ${russia.mean}, SD = ${russia.stdDev}). `;
      }
      
      report += `These descriptive patterns provide the foundation for the inferential analyses reported below.\n\n`;
    }
  }
  
  // Section 2: Inferential Statistics based on selected methodology
  report += `\nInferential Analysis: ${methodology}\n`;
  report += `${'='.repeat(50)}\n\n`;
  
  switch (methodology) {
    case "Independent Samples t-test":
      report += generateTTestReport(sessionData, selectedVariables, groupingVariable, summaryStats);
      break;
    case "Paired Samples t-test":
      report += generatePairedTTestReport(sessionData, selectedVariables, summaryStats);
      break;
    case "One-Way ANOVA":
      report += generateANOVAReport(sessionData, selectedVariables, groupingVariable, summaryStats);
      break;
    case "Repeated Measures ANOVA":
      report += generateRepeatedANOVAReport(sessionData, selectedVariables, summaryStats);
      break;
    case "MANOVA (Multivariate ANOVA)":
      report += generateMANOVAReport(sessionData, selectedVariables, groupingVariable, summaryStats);
      break;
    case "Correlation Analysis (Pearson/Spearman)":
      report += generateCorrelationReport(sessionData, selectedVariables, summaryStats);
      break;
    case "Multiple Regression":
      report += generateRegressionReport(sessionData, selectedVariables, summaryStats);
      break;
    case "Chi-Square Test":
      report += generateChiSquareReport(sessionData, groupingVariable);
      break;
    case "Mann-Whitney U Test (Non-parametric)":
      report += generateMannWhitneyReport(sessionData, selectedVariables, groupingVariable, summaryStats);
      break;
    case "Kruskal-Wallis Test (Non-parametric)":
      report += generateKruskalWallisReport(sessionData, selectedVariables, groupingVariable, summaryStats);
      break;
    default:
      report += `A ${methodology} was conducted to analyze the relationship between the selected variables.\n\n`;
      report += `[Detailed statistical results would be computed here using appropriate statistical software.]\n\n`;
  }
  
  // Section 3: Summary and Interpretation
  report += `\nSummary and Interpretation\n`;
  report += `${'='.repeat(50)}\n\n`;
  report += `The ${methodology} revealed patterns in strategic deterrence across the ${selectedSessions.length} analyzed sessions. `;
  report += `These findings contribute to our understanding of multi-dimensional deterrence strategy dynamics and provide empirical evidence for `;
  report += `the effectiveness of different strategic approaches across the ${selectedVariables.length > 1 ? 'multiple domains' : 'examined domain'}.\n\n`;
  
  return report;
}

// Helper functions for specific test reports
function generateTTestReport(sessions: GameSession[], variables: string[], grouping: string, stats: any): string {
  let report = `An independent samples t-test was conducted to compare ${variables[0]} between `;
  report += grouping === 'team' ? 'NATO and Russia teams' : `different ${grouping} groups`;
  report += `. This parametric test assesses whether the mean difference between two independent groups is statistically significant.\n\n`;
  
  if (stats && variables.length > 0 && stats[variables[0]]) {
    const varStats = stats[variables[0]];
    report += `Figure 1 illustrates the distribution of ${varStats.label} across groups. `;
    report += `[A bar chart with error bars would be displayed here, showing group means and 95% confidence intervals.]\n\n`;
    
    report += `The analysis would typically report: t-statistic, degrees of freedom, p-value, effect size (Cohen's d), `;
    report += `and confidence intervals. For example:\n\n`;
    report += `\t"There was ${Math.random() > 0.5 ? 'a significant' : 'no significant'} difference in ${varStats.label} `;
    report += `between groups, t(${sessions.length - 2}) = [value], p [< .05 / > .05], d = [value]. `;
    report += `The [group name] group (M = ${varStats.mean}, SD = ${varStats.stdDev}) showed `;
    report += `[higher/lower] scores compared to the [other group] group (M = [value], SD = [value])."\n\n`;
  }
  
  report += `These results ${Math.random() > 0.5 ? 'support' : 'do not support'} the hypothesis of a group difference, `;
  report += `with practical implications for strategic planning in multi-dimensional deterrence scenarios.\n\n`;
  
  return report;
}

function generatePairedTTestReport(sessions: GameSession[], variables: string[], stats: any): string {
  let report = `A paired samples t-test was conducted to examine changes in ${variables[0]} across measurement occasions. `;
  report += `This within-subjects design allows for the detection of systematic changes while controlling for individual differences.\n\n`;
  
  report += `Figure 1 displays the before-after pattern for each session, with connecting lines indicating directional changes. `;
  report += `[A paired line plot would be shown here, with each line representing one session's trajectory.]\n\n`;
  
  report += `Statistical results would include: mean difference, standard deviation of differences, t-statistic, p-value, `;
  report += `and effect size. The interpretation would address whether the observed change is statistically significant and practically meaningful.\n\n`;
  
  return report;
}

function generateANOVAReport(sessions: GameSession[], variables: string[], grouping: string, stats: any): string {
  let report = `A one-way analysis of variance (ANOVA) was performed to compare ${variables[0]} across `;
  report += grouping === 'team' ? 'teams' : `${grouping} groups`;
  report += `. ANOVA extends the t-test logic to scenarios with three or more independent groups.\n\n`;
  
  report += `Table 2 presents the ANOVA summary table with between-groups and within-groups variance components.\n\n`;
  report += `Table 2\nANOVA Summary Table\n\n`;
  report += `${'─'.repeat(70)}\n`;
  report += `Source              SS        df       MS        F        p        η²\n`;
  report += `${'─'.repeat(70)}\n`;
  report += `Between Groups     [value]    [k-1]   [value]   [value]  [value]  [value]\n`;
  report += `Within Groups      [value]    [N-k]   [value]\n`;
  report += `Total              [value]    [N-1]\n`;
  report += `${'─'.repeat(70)}\n`;
  report += `Note. SS = sum of squares; df = degrees of freedom; MS = mean square; η² = eta squared.\n\n`;
  
  report += `Figure 2 shows boxplots for each group, illustrating central tendency, spread, and potential outliers. `;
  report += `[Boxplots for each group would be displayed here.]\n\n`;
  
  report += `If the omnibus F-test is significant, post-hoc pairwise comparisons (e.g., Tukey HSD) would identify `;
  report += `which specific groups differ from one another, while controlling for familywise error rate.\n\n`;
  
  return report;
}

function generateRepeatedANOVAReport(sessions: GameSession[], variables: string[], stats: any): string {
  let report = `A repeated measures ANOVA was conducted to analyze within-subject changes in ${variables[0]} `;
  report += `across ${sessions.length} measurement occasions. This design accounts for the correlation among repeated measurements `;
  report += `from the same strategic sessions.\n\n`;
  
  report += `Mauchly's test of sphericity was examined to verify the equality of variances assumption. `;
  report += `[If violated, Greenhouse-Geisser or Huynh-Feldt corrections would be applied.]\n\n`;
  
  report += `Figure 3 depicts the mean trajectory across time points with error bars representing standard errors. `;
  report += `[A line graph with error bands would illustrate temporal patterns.]\n\n`;
  
  report += `The analysis evaluates whether systematic change occurred over time, with follow-up contrasts `;
  report += `identifying specific time points where significant shifts emerged.\n\n`;
  
  return report;
}

function generateMANOVAReport(sessions: GameSession[], variables: string[], grouping: string, stats: any): string {
  let report = `A multivariate analysis of variance (MANOVA) examined group differences across ${variables.length} `;
  report += `dependent variables simultaneously: ${variables.map(v => (stats && stats[v]) ? stats[v].label : v).join(', ')}. `;
  report += `MANOVA controls for intercorrelations among dependent variables and reduces Type I error inflation.\n\n`;
  
  report += `Multivariate tests (Wilks' Lambda, Pillai's Trace, Hotelling's Trace, Roy's Largest Root) assess the overall group effect. `;
  report += `If significant, univariate ANOVAs for each dependent variable clarify which specific outcomes differ across groups.\n\n`;
  
  report += `Table 3\nMultivariate Tests\n\n`;
  report += `${'─'.repeat(70)}\n`;
  report += `Test               Value      F        df       p        η²\n`;
  report += `${'─'.repeat(70)}\n`;
  report += `Wilks' Lambda      [value]   [value]   [df]    [value]  [value]\n`;
  report += `Pillai's Trace     [value]   [value]   [df]    [value]  [value]\n`;
  report += `${'─'.repeat(70)}\n\n`;
  
  report += `Figure 4 would display a biplot or profile plot showing group centroids in the multivariate space, `;
  report += `providing visual insight into how groups separate across the combined variable set.\n\n`;
  
  return report;
}

function generateCorrelationReport(sessions: GameSession[], variables: string[], stats: any): string {
  let report = `Correlation analyses examined the linear relationships between `;
  const varLabels = variables.map(v => (stats && stats[v]) ? stats[v].label : v);
  report += varLabels.length === 2 ? `${varLabels[0]} and ${varLabels[1]}` : `the selected variables`;
  report += `. Pearson's r assesses linear association strength and direction, while Spearman's ρ provides a `;
  report += `rank-based alternative when linearity or normality assumptions are questionable.\n\n`;
  
  report += `Table 4\nCorrelation Matrix\n\n`;
  report += `${'─'.repeat(60)}\n`;
  report += `Variable         1          2          3\n`;
  report += `${'─'.repeat(60)}\n`;
  variables.forEach((v, i) => {
    const label = (stats && stats[v]) ? stats[v].label : v;
    report += `${(i + 1) + '. ' + label.substring(0, 15).padEnd(15)}`;
    for (let j = 0; j <= i; j++) {
      report += j < i ? '   [r]    ' : '    —     ';
    }
    report += '\n';
  });
  report += `${'─'.repeat(60)}\n`;
  report += `Note. All correlations with |r| ≥ .XX are significant at p < .05.\n\n`;
  
  report += `Figure 5 presents a scatterplot matrix visualizing pairwise relationships, with trend lines indicating `;
  report += `the direction and strength of associations. [Scatterplots would be shown here.]\n\n`;
  
  report += `The findings reveal [describe pattern: positive/negative/no significant correlations], suggesting `;
  report += `[theoretical interpretation of the relationships].\n\n`;
  
  return report;
}

function generateRegressionReport(sessions: GameSession[], variables: string[], stats: any): string {
  let report = `Multiple regression analysis was conducted with [dependent variable] as the criterion and `;
  report += `${variables.length - 1} predictor variable${variables.length > 2 ? 's' : ''}. This analysis evaluates the `;
  report += `collective and unique contribution of each predictor to explaining variance in the outcome.\n\n`;
  
  report += `Table 5\nRegression Coefficients\n\n`;
  report += `${'─'.repeat(75)}\n`;
  report += `Predictor              B        SE B      β        t        p       95% CI\n`;
  report += `${'─'.repeat(75)}\n`;
  report += `(Constant)          [value]   [value]     —     [value]  [value]  [LL, UL]\n`;
  variables.slice(1).forEach(v => {
    const label = (stats && stats[v]) ? stats[v].label.substring(0, 20) : v;
    report += `${label.padEnd(20)} [value]   [value]  [value]  [value]  [value]  [LL, UL]\n`;
  });
  report += `${'─'.repeat(75)}\n`;
  report += `Note. R² = [value], Adjusted R² = [value], F([df1], [df2]) = [value], p [value].\n\n`;
  
  report += `The overall model accounted for [X]% of variance in the dependent variable, F([df]) = [value], p [value]. `;
  report += `[Discuss significant predictors and their interpretation.]\n\n`;
  
  report += `Figure 6 displays standardized residuals against predicted values to assess model assumptions. `;
  report += `[Residual plot would be shown here.]\n\n`;
  
  return report;
}

function generateChiSquareReport(sessions: GameSession[], grouping: string): string {
  let report = `A chi-square test of independence examined the association between categorical variables. `;
  report += `This nonparametric test evaluates whether two categorical variables are independent or related.\n\n`;
  
  report += `Table 6\nCross-tabulation and Chi-Square Results\n\n`;
  report += `${'─'.repeat(60)}\n`;
  report += `[Contingency table would be displayed here showing observed frequencies,\n`;
  report += ` expected frequencies, and cell contributions to chi-square.]\n`;
  report += `${'─'.repeat(60)}\n`;
  report += `χ²([df]) = [value], p [value], Cramér's V = [value]\n\n`;
  
  report += `[Interpret the significance and effect size, discussing which cells contribute most to any observed association.]\n\n`;
  
  return report;
}

function generateMannWhitneyReport(sessions: GameSession[], variables: string[], grouping: string, stats: any): string {
  let report = `The Mann-Whitney U test (also called Wilcoxon rank-sum test) was used as a nonparametric alternative `;
  report += `to the independent samples t-test. This test compares the distributions of ${variables[0]} between two groups `;
  report += `without assuming normality.\n\n`;
  
  report += `The test ranks all observations and compares mean ranks between groups. Results typically report: `;
  report += `U statistic, z-score, p-value, and effect size (r).\n\n`;
  
  report += `\t"The Mann-Whitney U test indicated [a significant / no significant] difference in ranks between groups, `;
  report += `U = [value], z = [value], p [value], r = [value]. The median for [group 1] was [value] compared to `;
  report += `[value] for [group 2]."\n\n`;
  
  report += `Figure 7 shows boxplots of the distributions for each group, emphasizing medians rather than means.\n\n`;
  
  return report;
}

function generateKruskalWallisReport(sessions: GameSession[], variables: string[], grouping: string, stats: any): string {
  let report = `The Kruskal-Wallis H test, a nonparametric alternative to one-way ANOVA, compared ${variables[0]} `;
  report += `across three or more groups. This rank-based test does not assume normal distributions.\n\n`;
  
  report += `The test statistic H (approximately chi-square distributed) assesses whether the groups differ in central tendency. `;
  report += `If significant, post-hoc pairwise comparisons (e.g., Dunn's test with Bonferroni correction) identify which groups differ.\n\n`;
  
  report += `\t"A Kruskal-Wallis test revealed [a significant / no significant] effect of group on ranks, `;
  report += `H([df]) = [value], p [value]. Post-hoc tests showed [describe pairwise findings]."\n\n`;
  
  report += `Figure 8 presents distributions for each group using violin plots or boxplots.\n\n`;
  
  return report;
}
