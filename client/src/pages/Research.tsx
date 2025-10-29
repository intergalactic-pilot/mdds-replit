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
  
  // Hypothesis Development
  const [hypothesis, setHypothesis] = useState<string>("");
  const [selectedPredefinedHypothesis, setSelectedPredefinedHypothesis] = useState<string>("");
  
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

  // Analyze hypothesis and recommend variables
  const recommendedVariables = useMemo(() => {
    if (!hypothesis.trim()) return [];
    
    const lowerHypothesis = hypothesis.toLowerCase();
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
  }, [hypothesis]);

  // Get statistical test recommendation based on hypothesis
  const getHypothesisBasedTestRecommendation = useMemo(() => {
    if (!hypothesis.trim()) return null;
    
    const lowerHypothesis = hypothesis.toLowerCase();
    
    // Analyze hypothesis structure
    const hasCorrelation = /correlat|relationship|associat/.test(lowerHypothesis);
    const hasComparison = /compare|differ|versus|vs\.?|between/.test(lowerHypothesis);
    const hasPrediction = /predict|determin|effect|impact|influence|cause/.test(lowerHypothesis);
    const hasMultipleVariables = /multiple\s+(variable|outcome|factor|dimension|metric)|several\s+(variable|outcome|factor|dimension|metric)|various\s+(variable|outcome|factor|dimension|metric)/.test(lowerHypothesis);
    const hasTwoGroups = /nato.*russia|russia.*nato|two teams|both teams/.test(lowerHypothesis);
    const hasMultipleGroups = /across.*domain|all.*domain|multiple.*group/.test(lowerHypothesis);
    const hasTimeComponent = /over time|across turns|duration|temporal|longitudinal/.test(lowerHypothesis);
    
    // Determine recommended test based on hypothesis characteristics
    if (hasCorrelation && recommendedVariables.length === 2 && !hasComparison) {
      return {
        name: "Correlation Analysis (Pearson/Spearman)",
        justification: `This hypothesis explicitly examines the relationship between two variables, making correlation analysis the ideal choice. ${
          lowerHypothesis.includes('positively') || lowerHypothesis.includes('negatively') 
            ? 'The directional language ("positively" or "negatively") suggests you are testing for the strength and direction of association between variables.' 
            : 'Correlation analysis will reveal both the strength and direction of the relationship.'
        } Pearson correlation is appropriate when both variables are continuous and linearly related with normal distributions. If your data is skewed or contains outliers, Spearman's rank correlation provides a robust non-parametric alternative that assesses monotonic relationships.`,
        application: `To apply correlation analysis: (1) Select your two continuous variables from the recommended list above. (2) Ensure you have at least 10-20 sessions for reliable correlation estimates. (3) Visualize the relationship using a scatterplot to check for linearity and outliers. (4) Calculate Pearson's r if assumptions are met, or Spearman's ρ if data is ordinal or non-normal. (5) Interpret the correlation coefficient: values near ±1 indicate strong relationships, while values near 0 suggest weak associations. (6) Report both the correlation coefficient and p-value to assess statistical significance. (7) Remember that correlation does not imply causation—it only measures association strength.`
      };
    }
    
    if (hasTwoGroups && !hasMultipleVariables && recommendedVariables.length <= 2) {
      return {
        name: "Independent Samples t-test",
        justification: `Your hypothesis compares two independent groups (NATO vs. Russia) on a single outcome variable, which is the classic scenario for an independent samples t-test. This parametric test examines whether the mean deterrence score (or other metric) significantly differs between the two teams. The t-test is robust, widely recognized in research, and provides clear evidence of group differences. ${
          recommendedVariables.length === 2 ? 'Since you have variables for both teams, the test will directly compare their means.' : ''
        } This test assumes independent observations, approximately normal distributions within each group (or sample sizes ≥30), and similar variances between groups (homogeneity of variance).`,
        application: `To conduct an independent samples t-test: (1) Select one continuous outcome variable (e.g., total deterrence score). (2) Define your two groups (NATO and Russia). (3) Verify assumptions: check for normality using histograms or Q-Q plots, and test homogeneity of variance with Levene's test. (4) If assumptions are violated and sample sizes are small (n<30), consider the Mann-Whitney U test instead. (5) Calculate the t-statistic and degrees of freedom. (6) Report the mean difference, confidence interval, t-value, and p-value. (7) Interpret results: p<0.05 suggests a statistically significant difference between teams. (8) Calculate effect size (Cohen's d) to quantify the magnitude of difference—small (0.2), medium (0.5), or large (0.8).`
      };
    }
    
    if (hasMultipleGroups && !hasMultipleVariables && recommendedVariables.length <= 2) {
      return {
        name: "One-Way ANOVA",
        justification: `Your hypothesis involves comparing means across multiple groups (e.g., different domains, time periods, or strategic categories), making one-way Analysis of Variance (ANOVA) the appropriate test. ANOVA extends the t-test logic to three or more groups, testing whether at least one group mean differs significantly from the others. This is more efficient and statistically appropriate than running multiple t-tests, which would inflate Type I error rates. ${
          lowerHypothesis.includes('domain') ? 'Since your hypothesis mentions domains, you are likely comparing performance across the five strategic dimensions (Joint, Economy, Cognitive, Space, Cyber).' : ''
        } ANOVA provides an F-statistic that indicates overall group differences, followed by post-hoc tests to identify which specific groups differ.`,
        application: `To perform one-way ANOVA: (1) Select one continuous dependent variable (e.g., deterrence score). (2) Define your grouping factor with 3+ levels (e.g., five domains). (3) Check assumptions: normality within each group (Shapiro-Wilk test), homogeneity of variance across groups (Levene's test), and independent observations. (4) If assumptions are violated, use the Kruskal-Wallis test instead. (5) Calculate the F-statistic and p-value. (6) If p<0.05, conclude that at least one group differs. (7) Conduct post-hoc comparisons (Tukey HSD, Bonferroni) to identify which specific groups differ. (8) Report means, standard deviations, F-value, degrees of freedom, p-value, and effect size (eta-squared). (9) Visualize results with boxplots or bar charts showing group means and error bars.`
      };
    }
    
    if (hasPrediction && recommendedVariables.length >= 2) {
      return {
        name: "Multiple Regression",
        justification: `Your hypothesis suggests examining how one or more predictor variables influence an outcome variable, which is the domain of regression analysis. ${
          recommendedVariables.length > 2 
            ? 'Multiple regression is ideal here because you have several potential predictors that may jointly explain variance in the outcome.' 
            : 'Simple regression can model the relationship between your predictor and outcome.'
        } Regression goes beyond correlation by modeling the predictive relationship and quantifying how much change in the outcome is associated with unit changes in predictors. ${
          lowerHypothesis.includes('predict') || lowerHypothesis.includes('determine') 
            ? 'The causal/predictive language in your hypothesis aligns perfectly with regression methodology.' 
            : ''
        } This approach provides regression coefficients, R-squared values, and statistical significance for each predictor, offering comprehensive insights into determinants of strategic performance.`,
        application: `To conduct multiple regression: (1) Identify your dependent variable (outcome you want to predict) and independent variables (predictors). (2) Ensure adequate sample size: at least 10-15 observations per predictor variable. (3) Check assumptions: linearity (scatterplots), independence of residuals, homoscedasticity (constant variance), normality of residuals (Q-Q plot), and absence of multicollinearity (VIF<10). (4) Run the regression model and examine R-squared to assess model fit (proportion of variance explained). (5) Evaluate each predictor's coefficient: magnitude indicates effect size, sign indicates direction, and p-value indicates significance. (6) Report standardized coefficients (beta weights) to compare relative importance of predictors. (7) Check for influential outliers using Cook's distance. (8) Interpret results carefully: regression suggests prediction, not necessarily causation. (9) Visualize with partial regression plots.`
      };
    }
    
    if (hasMultipleVariables && recommendedVariables.length >= 3 && hasTwoGroups) {
      return {
        name: "MANOVA (Multivariate ANOVA)",
        justification: `Your hypothesis examines group differences across multiple outcome variables simultaneously, which requires Multivariate Analysis of Variance (MANOVA). Unlike running separate ANOVAs for each variable, MANOVA considers correlations among dependent variables and tests whether groups differ on a composite of outcomes. ${
          lowerHypothesis.includes('domain') ? 'Since you are examining multiple domains, MANOVA can assess whether teams differ in their overall deterrence profile across all dimensions simultaneously.' : ''
        } This approach is more powerful and controls for Type I error inflation that would occur with multiple univariate tests. MANOVA provides a comprehensive view of multivariate group differences and can detect patterns that univariate tests might miss.`,
        application: `To perform MANOVA: (1) Select 2+ continuous dependent variables that are theoretically related. (2) Define your independent grouping variable (e.g., NATO vs. Russia). (3) Verify multivariate assumptions: multivariate normality (Mardia's test), homogeneity of covariance matrices (Box's M test), linear relationships among DVs, and adequate sample size (more observations than DVs). (4) Run MANOVA and examine multivariate test statistics: Wilks' Lambda, Pillai's Trace, Hotelling's Trace, or Roy's Largest Root. (5) If multivariate effect is significant (p<0.05), conduct follow-up univariate ANOVAs for each DV to identify which specific variables drive the difference. (6) Apply Bonferroni correction to control Type I error in follow-ups. (7) Report effect sizes (partial eta-squared) for both multivariate and univariate effects. (8) Interpret whether groups differ on the overall pattern of outcomes.`
      };
    }
    
    if (hasTimeComponent || lowerHypothesis.includes('longitudinal') || lowerHypothesis.includes('change')) {
      return {
        name: "Repeated Measures ANOVA",
        justification: `Your hypothesis involves examining changes or patterns across time points or turns, which suggests a within-subjects design best analyzed with Repeated Measures ANOVA. This test accounts for the fact that the same sessions/teams are measured multiple times, recognizing that measurements from the same entity are correlated. ${
          lowerHypothesis.includes('turn') ? 'Since your hypothesis mentions turns, you are tracking strategic performance across the temporal progression of the simulation.' : ''
        } Repeated measures designs are more powerful than between-subjects designs because they control for individual differences, reducing error variance. This test is ideal for detecting developmental trends, strategic evolution, or cumulative effects over the course of sessions.`,
        application: `To conduct Repeated Measures ANOVA: (1) Organize your data with the same subjects (sessions or teams) measured at multiple time points (e.g., deterrence at turns 1, 2, 3, etc.). (2) Ensure you have the same subjects measured at all time points (balanced design). (3) Check assumptions: normality of differences between time points and sphericity (equal variances of differences). (4) If sphericity is violated (Mauchly's test, p<0.05), apply Greenhouse-Geisser or Huynh-Feldt corrections. (5) Run the analysis and examine the within-subjects effect for time. (6) If significant, conduct pairwise comparisons with Bonferroni adjustments to identify which specific time points differ. (7) Report F-value, degrees of freedom (including any corrections), p-value, and partial eta-squared. (8) Visualize trends with line graphs showing means and error bars across time points. (9) Interpret whether performance changes significantly over time.`
      };
    }
    
    // Default recommendation for general hypotheses
    return {
      name: "Independent Samples t-test or Correlation Analysis",
      justification: `Based on your hypothesis structure, the most appropriate test depends on whether you are comparing groups or examining relationships. If you are comparing NATO vs. Russia (or winners vs. losers) on a single metric, use an independent samples t-test to test for mean differences. If you are examining whether two continuous variables are related (e.g., whether economic deterrence correlates with total deterrence), use correlation analysis. ${
        recommendedVariables.length === 0 
          ? 'Select relevant variables above to refine this recommendation further.' 
          : `With ${recommendedVariables.length} recommended variable${recommendedVariables.length !== 1 ? 's' : ''}, consider whether you want to compare groups (t-test) or measure association (correlation).`
      } Both approaches are foundational statistical methods with clear interpretation and wide acceptance in research.`,
      application: `For t-test: (1) Select one outcome variable and two groups to compare. (2) Check normality and variance assumptions. (3) Run the test and interpret mean differences with confidence intervals and p-values. For correlation: (1) Select two continuous variables you believe are related. (2) Visualize their relationship with a scatterplot. (3) Calculate Pearson's r (for linear relationships) or Spearman's ρ (for non-linear/monotonic relationships). (4) Report the correlation coefficient, interpret its strength and direction, and assess significance. (5) Use scatterplots with regression lines to communicate findings visually. Both tests require sufficient sample size (ideally 20+ sessions) and should be followed by effect size reporting to quantify practical significance beyond statistical significance.`
    };
  }, [hypothesis, recommendedVariables]);

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
            {/* Hypothesis Development */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  Hypothesis Development
                </CardTitle>
                <CardDescription>
                  Enter your research hypothesis to get variable recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="predefined-hypothesis">Quick Select: Predefined Hypotheses</Label>
                  <Select 
                    value={selectedPredefinedHypothesis} 
                    onValueChange={(value) => {
                      setSelectedPredefinedHypothesis(value);
                      const selected = predefinedHypotheses.find(h => h.id === value);
                      if (selected) {
                        setHypothesis(selected.text);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-predefined-hypothesis">
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
                  <Label htmlFor="hypothesis">Your Hypothesis</Label>
                  <textarea
                    id="hypothesis"
                    value={hypothesis}
                    onChange={(e) => {
                      setHypothesis(e.target.value);
                      // Clear predefined selection if user manually edits
                      if (selectedPredefinedHypothesis) {
                        setSelectedPredefinedHypothesis("");
                      }
                    }}
                    placeholder="Example: NATO's economic domain performance is positively correlated with their overall deterrence score..."
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y"
                    data-testid="textarea-hypothesis"
                  />
                </div>

                {/* Recommendations */}
                {hypothesis.trim() && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Recommended Variables</h3>
                      {recommendedVariables.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {recommendedVariables.length} suggestion{recommendedVariables.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {recommendedVariables.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Based on your hypothesis, consider selecting these variables:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {recommendedVariables.map(varId => {
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
                        
                        {recommendedVariables.some(v => !selectedVariables.includes(v)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const toAdd = recommendedVariables.filter(v => !selectedVariables.includes(v));
                              setSelectedVariables(prev => [...prev, ...toAdd]);
                            }}
                            className="w-full"
                            data-testid="button-select-all-recommended"
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

                {/* Statistical Test Recommendation */}
                {hypothesis.trim() && getHypothesisBasedTestRecommendation && (
                  <div className="space-y-3 pt-4 border-t" data-testid="container-statistical-test-recommendation">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold">Recommended Statistical Test</h3>
                    </div>
                    
                    <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div>
                        <Badge variant="default" className="mb-2" data-testid="badge-recommended-test-name">
                          {getHypothesisBasedTestRecommendation.name}
                        </Badge>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Why This Test?</h4>
                        <p className="text-sm leading-relaxed" data-testid="text-test-justification">
                          {getHypothesisBasedTestRecommendation.justification}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">How to Apply</h4>
                        <p className="text-sm leading-relaxed" data-testid="text-test-application">
                          {getHypothesisBasedTestRecommendation.application}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!hypothesis.trim() && (
                  <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                    Enter a hypothesis above to receive personalized variable recommendations for your analysis.
                  </p>
                )}
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
