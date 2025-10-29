import { calculateTTest, calculateANOVA, calculateCorrelation, calculateRegression, type TTestResult, type ANOVAResult, type CorrelationResult, type RegressionResult } from './statisticalCalculations';

export interface GameSession {
  sessionName: string;
  gameState: any;
  sessionInfo?: any;
  turnStatistics?: any;
}

export interface PreparedReportData {
  methodology: string;
  descriptiveStats: {
    variable: string;
    n: number;
    mean: string;
    sd: string;
    min: string;
    max: string;
    range: string;
  }[];
  inferentialData: any;
  sessionCount: number;
  variableNames: string[];
  chartData: {
    type: string;
    title: string;
    data: any;
    xLabel?: string;
    yLabel?: string;
  }[];
}

export function prepareReportData(
  methodology: string,
  selectedSessions: string[],
  selectedVariables: string[],
  summaryStats: Record<string, any>,
  allSessions: GameSession[],
  groupingVariable: string
): PreparedReportData {
  const sessionData = allSessions.filter(s => selectedSessions.includes(s.sessionName));
  
  const descriptiveStats = Object.entries(summaryStats).map(([varId, stats]: [string, any]) => ({
    variable: stats.label,
    n: stats.n,
    mean: String(stats.mean),
    sd: String(stats.stdDev),
    min: String(stats.min),
    max: String(stats.max),
    range: String(stats.range)
  }));
  
  const variableNames = Object.values(summaryStats).map((s: any) => s.label);
  
  let inferentialData: any = null;
  let chartData: any[] = [];
  
  switch (methodology) {
    case 'Independent Samples t-test':
      {
        const result = performTTest(sessionData, selectedVariables[0], groupingVariable);
        inferentialData = result.stats;
        chartData = result.charts;
      }
      break;
      
    case 'One-Way ANOVA':
      {
        const result = performANOVA(sessionData, selectedVariables[0], groupingVariable);
        inferentialData = result.stats;
        chartData = result.charts;
      }
      break;
      
    case 'Correlation Analysis (Pearson/Spearman)':
      {
        const result = performCorrelation(sessionData, selectedVariables);
        inferentialData = result.stats;
        chartData = result.charts;
      }
      break;
      
    case 'Multiple Regression':
      {
        const result = performRegression(sessionData, selectedVariables);
        inferentialData = result.stats;
        chartData = result.charts;
      }
      break;
  }
  
  return {
    methodology,
    descriptiveStats,
    inferentialData,
    sessionCount: selectedSessions.length,
    variableNames,
    chartData
  };
}

function performTTest(sessions: GameSession[], variableId: string, groupingVar: string) {
  // Build groups based on unique grouping variable values
  const groupsMap: Map<string, number[]> = new Map();
  
  sessions.forEach(session => {
    const value = extractVariableValue(session, variableId);
    const groupValue = extractVariableValue(session, groupingVar);
    
    if (value !== null && groupValue !== null) {
      const groupKey = String(groupValue);
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, []);
      }
      groupsMap.get(groupKey)!.push(value);
    }
  });
  
  const groupEntries = Array.from(groupsMap.entries());
  
  // For t-test, we need exactly 2 groups or can take first 2 if more exist
  if (groupEntries.length < 2) {
    return {
      stats: {
        tStatistic: 0,
        degreesOfFreedom: 0,
        pValue: 1,
        mean1: 0,
        mean2: 0,
        sd1: 0,
        sd2: 0,
        n1: 0,
        n2: 0,
        cohensD: 0,
        significant: false
      },
      charts: []
    };
  }
  
  const [group1Name, group1Values] = groupEntries[0];
  const [group2Name, group2Values] = groupEntries[1];
  
  const stats: TTestResult = calculateTTest(group1Values, group2Values);
  
  const charts = [{
    type: 'grouped-bar',
    title: 'Group Comparison',
    data: {
      labels: [group1Name, group2Name],
      datasets: [{
        label: 'Mean',
        data: [stats.mean1, stats.mean2]
      }]
    },
    yLabel: 'Mean Value'
  }];
  
  return { stats, charts };
}

function performANOVA(sessions: GameSession[], variableId: string, groupingVar: string) {
  const groupsMap: Map<string, number[]> = new Map();
  
  sessions.forEach(session => {
    const value = extractVariableValue(session, variableId);
    const groupValue = extractVariableValue(session, groupingVar);
    
    // Skip sessions with null grouping values (ties, incomplete data)
    if (value !== null && groupValue !== null) {
      const groupKey = String(groupValue);
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, []);
      }
      groupsMap.get(groupKey)!.push(value);
    }
  });
  
  const groups = Array.from(groupsMap.entries()).map(([name, values]) => ({
    name,
    values
  }));
  
  const stats: ANOVAResult = calculateANOVA(groups);
  
  const charts = [{
    type: 'grouped-bar',
    title: 'Group Means with Standard Errors',
    data: {
      labels: stats.groupMeans.map(g => g.group),
      datasets: [{
        label: 'Mean',
        data: stats.groupMeans.map(g => g.mean)
      }]
    },
    yLabel: 'Mean Value'
  }];
  
  return { stats, charts };
}

function performCorrelation(sessions: GameSession[], variableIds: string[]) {
  if (variableIds.length < 2) {
    return { stats: null, charts: [] };
  }
  
  const xValues: number[] = [];
  const yValues: number[] = [];
  
  sessions.forEach(session => {
    const xVal = extractVariableValue(session, variableIds[0]);
    const yVal = extractVariableValue(session, variableIds[1]);
    
    if (xVal !== null && yVal !== null) {
      xValues.push(xVal);
      yValues.push(yVal);
    }
  });
  
  const stats: CorrelationResult = calculateCorrelation(xValues, yValues);
  
  const scatterData = xValues.map((x, i) => ({ x, y: yValues[i] }));
  
  const charts = [{
    type: 'scatter',
    title: 'Scatterplot with Correlation',
    data: {
      datasets: [{
        label: 'Data Points',
        data: scatterData
      }]
    },
    xLabel: 'Variable 1',
    yLabel: 'Variable 2'
  }];
  
  return { stats, charts };
}

function performRegression(sessions: GameSession[], variableIds: string[]) {
  if (variableIds.length < 2) {
    return { stats: null, charts: [] };
  }
  
  const xValues: number[] = [];
  const yValues: number[] = [];
  
  sessions.forEach(session => {
    const xVal = extractVariableValue(session, variableIds[0]);
    const yVal = extractVariableValue(session, variableIds[1]);
    
    if (xVal !== null && yVal !== null) {
      xValues.push(xVal);
      yValues.push(yVal);
    }
  });
  
  const stats: RegressionResult = calculateRegression(xValues, yValues);
  
  const scatterData = xValues.map((x, i) => ({ x, y: yValues[i] }));
  
  const charts = [{
    type: 'scatter',
    title: 'Regression Analysis',
    data: {
      datasets: [{
        label: 'Data Points',
        data: scatterData
      }]
    },
    xLabel: 'Predictor Variable',
    yLabel: 'Outcome Variable'
  }];
  
  return { stats, charts };
}

function extractVariableValue(session: GameSession, variableId: string): number | null {
  if (!session.gameState) return null;
  
  const parts = variableId.split('_');
  
  if (variableId === 'turns') {
    return session.gameState.turn || 0;
  }
  
  if (variableId === 'team') {
    // Determine winner by comparing total deterrence scores
    // Try multiple paths to find the total deterrence score
    const natoScore = 
      session.gameState.teams?.NATO?.totalDeterrence ?? 
      session.gameState.teams?.NATO?.deterrenceScores?.total ?? 
      session.gameState.nato?.totalDeterrence ?? 
      session.gameState.nato?.deterrenceScores?.total ?? 
      null;
    
    const russiaScore = 
      session.gameState.teams?.Russia?.totalDeterrence ?? 
      session.gameState.teams?.Russia?.deterrenceScores?.total ?? 
      session.gameState.russia?.totalDeterrence ?? 
      session.gameState.russia?.deterrenceScores?.total ?? 
      null;
    
    // Only determine winner if BOTH scores are valid numbers
    // Return null for incomplete data or ties to exclude from grouping
    if (natoScore === null || russiaScore === null) return null;
    if (natoScore > russiaScore) return 1;
    if (russiaScore > natoScore) return 2;
    return null; // Tie - exclude from grouping
  }
  
  const team = parts[0];
  const metric = parts.slice(1).join('_');
  
  if (team === 'nato' || team === 'russia') {
    // Try new structure first (teams.NATO / teams.Russia)
    const teamKey = team === 'nato' ? 'NATO' : 'Russia';
    let teamState = session.gameState.teams?.[teamKey];
    
    // Fallback to old structure if needed
    if (!teamState) {
      teamState = session.gameState[team];
    }
    
    if (!teamState) return null;
    
    if (metric === 'total') {
      return teamState.totalDeterrence || teamState.deterrenceScores?.total || 0;
    } else if (metric === 'budget' || metric === 'used') {
      return teamState.budget || 0;
    } else if (metric === 'remaining') {
      return teamState.budget || 0;
    } else {
      // Try domain deterrence scores
      if (teamState.deterrenceScores && metric in teamState.deterrenceScores) {
        return teamState.deterrenceScores[metric] || 0;
      }
      // Try direct deterrence (new structure)
      if (teamState.deterrence && metric in teamState.deterrence) {
        return teamState.deterrence[metric] || 0;
      }
    }
  }
  
  return null;
}
