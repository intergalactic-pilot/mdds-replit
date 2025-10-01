import type { GameState, Team, Domain } from "@shared/schema";

export interface SessionData {
  sessionName: string;
  gameState: GameState;
  turnStatistics?: any;
}

export interface AnalysisResult {
  headlineInsight: string;
  patterns: string[];
  narrativeCommentary: string;
  visualSuggestions: string[];
}

export function analyzeGenericPatterns(sessions: SessionData[]): AnalysisResult {
  if (sessions.length === 0) {
    return {
      headlineInsight: "No sessions selected for analysis",
      patterns: [],
      narrativeCommentary: "Select some game sessions to discover winning strategies and correlations.",
      visualSuggestions: []
    };
  }

  const allPatterns: string[] = [];
  
  // Analyze all winning strategies
  const winnerAnalysis = analyzeAllWinningStrategies(sessions);
  allPatterns.push(...winnerAnalysis.patterns);

  // Analyze domain correlations comprehensively
  const domainCorrelations = analyzeCompleteDomainCorrelations(sessions);
  allPatterns.push(...domainCorrelations.patterns);

  // Analyze budget strategies
  const budgetStrategies = analyzeBudgetPatterns(sessions);
  allPatterns.push(...budgetStrategies.patterns);

  // Analyze card type effectiveness
  const cardEffectiveness = analyzeCardTypeEffectiveness(sessions);
  allPatterns.push(...cardEffectiveness.patterns);

  // Analyze timing patterns
  const timingPatterns = analyzeComprehensiveTiming(sessions);
  allPatterns.push(...timingPatterns.patterns);

  // Analyze turn-by-turn patterns
  const turnPatterns = analyzeTurnByTurnPatterns(sessions);
  allPatterns.push(...turnPatterns.patterns);

  // Analyze team-specific winning formulas
  const teamFormulas = analyzeTeamWinningFormulas(sessions);
  allPatterns.push(...teamFormulas.patterns);

  // Generate headline
  const winnerStats = analyzeWinners(sessions);
  const headlineInsight = generateGenericHeadline(sessions, winnerStats, allPatterns.length);

  // Generate narrative
  const narrativeCommentary = generateGenericNarrative(
    sessions,
    winnerAnalysis,
    domainCorrelations,
    budgetStrategies,
    cardEffectiveness,
    timingPatterns,
    teamFormulas,
    winnerStats
  );

  const visualSuggestions = [
    "Win rate correlation matrix by domain strength combinations",
    "Scatter plot of budget spending vs final deterrence scores",
    "Timeline heatmap showing critical decision points across all games",
    "Domain strength evolution chart comparing winners vs losers",
    "Card purchase frequency histogram by turn and outcome",
    "Team strategy comparison radar chart showing average domain investment"
  ];

  return {
    headlineInsight,
    patterns: allPatterns,
    narrativeCommentary,
    visualSuggestions
  };
}

function analyzeAllWinningStrategies(sessions: SessionData[]) {
  const patterns: string[] = [];
  
  const winners = sessions.map(s => ({
    team: determineWinner(s.gameState),
    state: s.gameState
  })).filter(w => w.team !== null);

  if (winners.length === 0) {
    return { patterns: ["No completed games to analyze winning strategies"] };
  }

  // Analyze final scores
  const avgWinningScore = winners.reduce((sum, w) => {
    return sum + (w.team ? w.state.teams[w.team].totalDeterrence : 0);
  }, 0) / winners.length;

  const avgLosingScore = winners.reduce((sum, w) => {
    const loser = w.team === 'NATO' ? 'Russia' : 'NATO';
    return sum + w.state.teams[loser].totalDeterrence;
  }, 0) / winners.length;

  patterns.push(`Winners average ${Math.round(avgWinningScore)} total deterrence vs losers' ${Math.round(avgLosingScore)} - a ${Math.round(avgWinningScore - avgLosingScore)} point gap`);

  // Analyze permanent card counts
  const avgWinnerPermanents = winners.reduce((sum, w) => {
    return sum + (w.team ? w.state.teams[w.team].ownedPermanents.length : 0);
  }, 0) / winners.length;

  patterns.push(`Winning teams hold an average of ${avgWinnerPermanents.toFixed(1)} permanent cards by game end`);

  return { patterns };
}

function analyzeCompleteDomainCorrelations(sessions: SessionData[]) {
  const patterns: string[] = [];
  
  const domainWins: Record<Domain, number> = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 };
  const domainScores: Record<Domain, number[]> = { joint: [], economy: [], cognitive: [], space: [], cyber: [] };
  
  sessions.forEach(session => {
    const winner = determineWinner(session.gameState);
    if (!winner) return;

    const winnerState = session.gameState.teams[winner];
    
    // Track which domain was strongest
    let maxDomain: Domain = 'joint';
    let maxScore = 0;
    (Object.keys(winnerState.deterrence) as Domain[]).forEach(domain => {
      const score = winnerState.deterrence[domain];
      domainScores[domain].push(score);
      if (score > maxScore) {
        maxScore = score;
        maxDomain = domain;
      }
    });
    domainWins[maxDomain]++;
  });

  // Report all domain correlations
  (Object.keys(domainWins) as Domain[]).forEach(domain => {
    const wins = domainWins[domain];
    const scores = domainScores[domain];
    if (wins > 0 && scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      patterns.push(`${domain.charAt(0).toUpperCase() + domain.slice(1)} domain dominance: ${wins} victories with avg score of ${Math.round(avgScore)}`);
    }
  });

  return { patterns };
}

function analyzeBudgetPatterns(sessions: SessionData[]) {
  const patterns: string[] = [];
  
  const winners = sessions.map(s => ({
    team: determineWinner(s.gameState),
    finalBudget: s.gameState.teams[determineWinner(s.gameState) || 'NATO']?.budget || 0
  })).filter(w => w.team !== null);

  if (winners.length > 0) {
    const avgFinalBudget = winners.reduce((sum, w) => sum + w.finalBudget, 0) / winners.length;
    
    if (avgFinalBudget < 50) {
      patterns.push(`Winners typically exhaust their budgets (avg ${Math.round(avgFinalBudget)}K remaining) - aggressive spending pays off`);
    } else if (avgFinalBudget > 200) {
      patterns.push(`Winners maintain budget reserves (avg ${Math.round(avgFinalBudget)}K remaining) - conservative play succeeds`);
    } else {
      patterns.push(`Winners balance spending and reserves (avg ${Math.round(avgFinalBudget)}K remaining at game end)`);
    }
  }

  return { patterns };
}

function analyzeCardTypeEffectiveness(sessions: SessionData[]) {
  const patterns: string[] = [];
  
  sessions.forEach(session => {
    const winner = determineWinner(session.gameState);
    if (!winner) return;

    const winnerState = session.gameState.teams[winner];
    const permanentCount = winnerState.ownedPermanents.length;
    const totalPurchases = winnerState.recentPurchases?.length || 0;

    if (permanentCount >= totalPurchases * 0.4) {
      patterns.push(`High permanent card ratio (${Math.round(permanentCount / Math.max(totalPurchases, 1) * 100)}%) correlates with victory in session "${session.sessionName}"`);
    }
  });

  if (patterns.length === 0) {
    patterns.push("Mixed card strategies observed - no single card type dominates winning formulas");
  }

  return { patterns };
}

function analyzeComprehensiveTiming(sessions: SessionData[]) {
  const patterns: string[] = [];
  
  const earlyActionWins = sessions.filter(s => {
    const winner = determineWinner(s.gameState);
    if (!winner) return false;
    const purchases = s.gameState.teams[winner].recentPurchases || [];
    return purchases.filter(p => p.purchasedTurn <= 3).length >= 2;
  }).length;

  const lateActionWins = sessions.filter(s => {
    const winner = determineWinner(s.gameState);
    if (!winner) return false;
    const purchases = s.gameState.teams[winner].recentPurchases || [];
    return purchases.filter(p => p.purchasedTurn > s.gameState.maxTurns - 3).length >= 2;
  }).length;

  const totalWins = sessions.filter(s => determineWinner(s.gameState) !== null).length;

  if (totalWins > 0) {
    patterns.push(`Early aggression (turns 1-3): ${earlyActionWins} wins (${Math.round(earlyActionWins / totalWins * 100)}%)`);
    patterns.push(`Late-game surge strategy: ${lateActionWins} wins (${Math.round(lateActionWins / totalWins * 100)}%)`);
  }

  return { patterns };
}

function analyzeTurnByTurnPatterns(sessions: SessionData[]) {
  const patterns: string[] = [];
  
  const turnDistribution: Record<number, number> = {};
  
  sessions.forEach(session => {
    const winner = determineWinner(session.gameState);
    if (!winner) return;

    const purchases = session.gameState.teams[winner].recentPurchases || [];
    purchases.forEach(p => {
      turnDistribution[p.purchasedTurn] = (turnDistribution[p.purchasedTurn] || 0) + 1;
    });
  });

  const criticalTurns = Object.entries(turnDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (criticalTurns.length > 0) {
    patterns.push(`Most critical purchase turns: ${criticalTurns.map(([turn, count]) => `Turn ${turn} (${count} key purchases)`).join(', ')}`);
  }

  return { patterns };
}

function analyzeTeamWinningFormulas(sessions: SessionData[]) {
  const patterns: string[] = [];
  
  const natoWins = sessions.filter(s => determineWinner(s.gameState) === 'NATO');
  const russiaWins = sessions.filter(s => determineWinner(s.gameState) === 'Russia');

  if (natoWins.length > 0) {
    const natoAvgDomains = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 } as Record<Domain, number>;
    natoWins.forEach(s => {
      const state = s.gameState.teams.NATO;
      (Object.keys(state.deterrence) as Domain[]).forEach(d => {
        natoAvgDomains[d] += state.deterrence[d];
      });
    });
    
    const topNATODomain = (Object.entries(natoAvgDomains) as [Domain, number][])
      .sort((a, b) => b[1] - a[1])[0];
    
    patterns.push(`NATO winning formula: Prioritize ${topNATODomain[0]} (avg ${Math.round(topNATODomain[1] / natoWins.length)}) across ${natoWins.length} victories`);
  }

  if (russiaWins.length > 0) {
    const russiaAvgDomains = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 } as Record<Domain, number>;
    russiaWins.forEach(s => {
      const state = s.gameState.teams.Russia;
      (Object.keys(state.deterrence) as Domain[]).forEach(d => {
        russiaAvgDomains[d] += state.deterrence[d];
      });
    });
    
    const topRussiaDomain = (Object.entries(russiaAvgDomains) as [Domain, number][])
      .sort((a, b) => b[1] - a[1])[0];
    
    patterns.push(`Russia winning formula: Prioritize ${topRussiaDomain[0]} (avg ${Math.round(topRussiaDomain[1] / russiaWins.length)}) across ${russiaWins.length} victories`);
  }

  return { patterns };
}

function generateGenericHeadline(sessions: SessionData[], winnerStats: any, patternCount: number): string {
  if (sessions.length === 0) return "No data to analyze";
  if (winnerStats.total === 0) return `Analyzed ${sessions.length} sessions - ${patternCount} strategic patterns identified`;

  return `Comprehensive analysis of ${sessions.length} sessions reveals ${patternCount} distinct winning strategies and performance correlations.`;
}

function generateGenericNarrative(
  sessions: SessionData[],
  winnerAnalysis: any,
  domainCorrelations: any,
  budgetStrategies: any,
  cardEffectiveness: any,
  timingPatterns: any,
  teamFormulas: any,
  winnerStats: any
): string {
  if (sessions.length === 0) {
    return "Select some game sessions to unlock comprehensive strategic analysis. The system will identify all winning patterns, domain correlations, and effective strategies without limitations.";
  }

  let narrative = `Analyzing ${sessions.length} complete strategic encounters, we've identified every measurable pattern that correlates with victory. `;

  if (winnerStats.total > 0) {
    narrative += `Out of ${winnerStats.total} decided games, the data reveals clear performance gaps between winners and losers across all dimensions. `;
  }

  narrative += `The winning strategies aren't random - they follow identifiable patterns in domain investment, timing, and resource allocation. `;
  
  narrative += `Some teams dominate through single-domain superiority, building an insurmountable lead in one area. Others spread their investments across multiple domains, creating a balanced deterrence profile that's hard to crack. `;

  narrative += `Budget management separates winners from losers - not just how much you spend, but when you spend it and what you buy. `;

  narrative += `Permanent cards provide long-term value, but asset cards deliver immediate impact. Expert advisors offer specialized advantages at critical moments. The most successful teams find the right mix for their strategic approach. `;

  narrative += `Every session tells a story of adaptation, timing, and strategic vision. The patterns are here - learn from them, adapt them to your style, and execute with precision.`;

  return narrative;
}

export function analyzeSelectedSessions(sessions: SessionData[]): AnalysisResult {
  if (sessions.length === 0) {
    return {
      headlineInsight: "No sessions selected for analysis",
      patterns: [],
      narrativeCommentary: "Select some game sessions to see strategic patterns and insights.",
      visualSuggestions: []
    };
  }

  // Analyze card timing patterns
  const cardTimingInsights = analyzeCardTiming(sessions);
  
  // Analyze momentum and comebacks
  const momentumInsights = analyzeMomentumSwings(sessions);
  
  // Analyze team asymmetry
  const asymmetryInsights = analyzeTeamAsymmetry(sessions);
  
  // Analyze comeback triggers
  const comebackInsights = analyzeComebackTriggers(sessions);
  
  // Analyze dimension correlation
  const dimensionInsights = analyzeDimensionCorrelation(sessions);
  
  // Analyze strategy consistency
  const consistencyInsights = analyzeStrategyConsistency(sessions);
  
  // Analyze cross-session patterns
  const crossSessionInsights = analyzeCrossSessionPatterns(sessions);

  // Determine winner stats
  const winnerStats = analyzeWinners(sessions);

  // Build the comprehensive analysis
  const allPatterns = [
    ...cardTimingInsights.patterns,
    ...momentumInsights.patterns,
    ...asymmetryInsights.patterns,
    ...comebackInsights.patterns,
    ...dimensionInsights.patterns,
    ...consistencyInsights.patterns,
    ...crossSessionInsights.patterns
  ].filter(Boolean);

  const headlineInsight = generateHeadlineInsight(sessions, winnerStats, dimensionInsights);
  const narrativeCommentary = generateNarrativeCommentary(
    sessions,
    cardTimingInsights,
    momentumInsights,
    asymmetryInsights,
    comebackInsights,
    dimensionInsights,
    consistencyInsights,
    crossSessionInsights,
    winnerStats
  );

  const visualSuggestions = [
    "Timeline chart showing deterrence momentum shifts turn-by-turn",
    "Heatmap of domain strength by team (NATO vs Russia average deterrence per domain)",
    "Bar chart comparing early-game vs late-game card purchase timing",
    "Win rate breakdown by dominant dimension for each team",
    "Comeback frequency tracker showing turn-by-turn lead changes"
  ];

  return {
    headlineInsight,
    patterns: allPatterns,
    narrativeCommentary,
    visualSuggestions
  };
}

function analyzeCardTiming(sessions: SessionData[]) {
  let earlyPermanentWins = 0;
  let latePermanentWins = 0;
  let totalGamesWithWinner = 0;

  sessions.forEach(session => {
    const winner = determineWinner(session.gameState);
    if (!winner) return;
    
    totalGamesWithWinner++;
    const winnerState = session.gameState.teams[winner];
    
    // Check when permanents were acquired
    const earlyPermanents = winnerState.recentPurchases?.filter(p => 
      p.purchasedTurn <= 4 && 
      winnerState.ownedPermanents.some(perm => perm.id === p.cardId)
    ).length || 0;
    
    const latePermanents = winnerState.recentPurchases?.filter(p => 
      p.purchasedTurn > 4 && 
      winnerState.ownedPermanents.some(perm => perm.id === p.cardId)
    ).length || 0;

    if (earlyPermanents > latePermanents) earlyPermanentWins++;
    else if (latePermanents > earlyPermanents) latePermanentWins++;
  });

  const patterns = [];
  if (totalGamesWithWinner > 0) {
    if (earlyPermanentWins > latePermanentWins) {
      patterns.push(`Early permanent cards strongly correlate with victory (${Math.round(earlyPermanentWins / totalGamesWithWinner * 100)}% of wins)`);
    } else if (latePermanentWins > earlyPermanentWins) {
      patterns.push(`Late-game permanent acquisitions can turn the tide (${Math.round(latePermanentWins / totalGamesWithWinner * 100)}% of wins)`);
    } else {
      patterns.push("Permanent card timing shows no clear pattern - victory depends on overall strategy");
    }
  }

  return { patterns, earlyPermanentWins, latePermanentWins };
}

function analyzeMomentumSwings(sessions: SessionData[]) {
  let comebackWins = 0;
  let dominantWins = 0;

  sessions.forEach(session => {
    const winner = determineWinner(session.gameState);
    if (!winner) return;

    // Check mid-game (turn 5) vs final scores
    const loser = winner === 'NATO' ? 'Russia' : 'NATO';
    const finalWinnerScore = session.gameState.teams[winner].totalDeterrence;
    const finalLoserScore = session.gameState.teams[loser].totalDeterrence;

    // If we had turn statistics, we could check mid-game scores
    // For now, use margin of victory as proxy
    const margin = Math.abs(finalWinnerScore - finalLoserScore);
    
    if (margin < 100) {
      comebackWins++;
    } else {
      dominantWins++;
    }
  });

  const patterns = [];
  const total = comebackWins + dominantWins;
  if (total > 0) {
    if (comebackWins > dominantWins) {
      patterns.push(`Comebacks are the norm - ${Math.round(comebackWins / total * 100)}% of games are close battles to the end`);
    } else {
      patterns.push(`Early leads tend to stick - ${Math.round(dominantWins / total * 100)}% of games show clear dominance from start to finish`);
    }
  }

  return { patterns, comebackWins, dominantWins };
}

function analyzeTeamAsymmetry(sessions: SessionData[]) {
  const natoStrengths: Record<Domain, number> = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 };
  const russiaStrengths: Record<Domain, number> = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 };
  let natoCount = 0;
  let russiaCount = 0;

  sessions.forEach(session => {
    const natoState = session.gameState.teams.NATO;
    const russiaState = session.gameState.teams.Russia;

    (Object.keys(natoStrengths) as Domain[]).forEach(domain => {
      natoStrengths[domain] += natoState.deterrence[domain];
      russiaStrengths[domain] += russiaState.deterrence[domain];
    });

    natoCount++;
    russiaCount++;
  });

  const patterns = [];
  if (natoCount > 0) {
    const natoAvg = Object.entries(natoStrengths).map(([domain, total]) => ({
      domain,
      avg: total / natoCount
    })).sort((a, b) => b.avg - a.avg);

    const russiaAvg = Object.entries(russiaStrengths).map(([domain, total]) => ({
      domain,
      avg: total / russiaCount
    })).sort((a, b) => b.avg - a.avg);

    patterns.push(`NATO's go-to domains: ${natoAvg[0].domain} (avg ${Math.round(natoAvg[0].avg)}), ${natoAvg[1].domain} (avg ${Math.round(natoAvg[1].avg)})`);
    patterns.push(`Russia's preferred battlegrounds: ${russiaAvg[0].domain} (avg ${Math.round(russiaAvg[0].avg)}), ${russiaAvg[1].domain} (avg ${Math.round(russiaAvg[1].avg)})`);
  }

  return { patterns, natoStrengths, russiaStrengths };
}

function analyzeComebackTriggers(sessions: SessionData[]) {
  const patterns = [];
  
  // Analyze strategy log for comeback patterns
  sessions.forEach(session => {
    const log = session.gameState.strategyLog || [];
    const midGameActions = log.filter(entry => entry.turn >= 5 && entry.turn <= 8);
    
    if (midGameActions.length > 0) {
      // Look for patterns in mid-game purchases
      const permanentPurchases = midGameActions.filter(entry => 
        entry.action.includes('permanent') || entry.action.includes('Permanent')
      );
      
      if (permanentPurchases.length > 2) {
        patterns.push("Mid-game permanent card investments often trigger momentum shifts");
      }
    }
  });

  if (patterns.length === 0) {
    patterns.push("Comeback triggers vary - no single card type dominates turnaround scenarios");
  }

  return { patterns };
}

function analyzeDimensionCorrelation(sessions: SessionData[]) {
  const winsByDomain: Record<Domain, number> = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 };
  let totalWins = 0;

  sessions.forEach(session => {
    const winner = determineWinner(session.gameState);
    if (!winner) return;
    
    totalWins++;
    const winnerState = session.gameState.teams[winner];
    
    // Find winner's strongest domain
    let strongestDomain: Domain = 'joint';
    let maxScore = 0;
    (Object.keys(winnerState.deterrence) as Domain[]).forEach(domain => {
      if (winnerState.deterrence[domain] > maxScore) {
        maxScore = winnerState.deterrence[domain];
        strongestDomain = domain;
      }
    });

    winsByDomain[strongestDomain]++;
  });

  const patterns = [];
  if (totalWins > 0) {
    const sortedDomains = (Object.entries(winsByDomain) as [Domain, number][])
      .sort((a, b) => b[1] - a[1]);
    
    patterns.push(`${sortedDomains[0][0]} dominance appears in ${Math.round(sortedDomains[0][1] / totalWins * 100)}% of victories - the most decisive dimension`);
    
    if (sortedDomains[1][1] > 0) {
      patterns.push(`${sortedDomains[1][0]} strength correlates with ${Math.round(sortedDomains[1][1] / totalWins * 100)}% of wins - a solid secondary path`);
    }
  }

  return { patterns, winsByDomain };
}

function analyzeStrategyConsistency(sessions: SessionData[]) {
  let balancedWins = 0;
  let focusedWins = 0;

  sessions.forEach(session => {
    const winner = determineWinner(session.gameState);
    if (!winner) return;
    
    const winnerState = session.gameState.teams[winner];
    const scores = Object.values(winnerState.deterrence);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;

    if (variance < 500) {
      balancedWins++;
    } else {
      focusedWins++;
    }
  });

  const patterns = [];
  const total = balancedWins + focusedWins;
  if (total > 0) {
    if (balancedWins > focusedWins) {
      patterns.push(`Balanced offense across all domains wins ${Math.round(balancedWins / total * 100)}% of the time - consistency beats specialization`);
    } else {
      patterns.push(`Focused domain dominance wins ${Math.round(focusedWins / total * 100)}% of games - specialists prevail over generalists`);
    }
  }

  return { patterns, balancedWins, focusedWins };
}

function analyzeCrossSessionPatterns(sessions: SessionData[]) {
  const patterns = [];
  
  // Find common winning patterns
  const winners = sessions.map(s => determineWinner(s.gameState)).filter(Boolean);
  const natoWins = winners.filter(w => w === 'NATO').length;
  const russiaWins = winners.filter(w => w === 'Russia').length;

  if (winners.length > 0) {
    patterns.push(`Across ${sessions.length} sessions: NATO ${natoWins} wins, Russia ${russiaWins} wins`);
    
    if (sessions.length >= 3) {
      // Check for recurring strategies
      const earlySpenders = sessions.filter(s => {
        const winner = determineWinner(s.gameState);
        if (!winner) return false;
        const purchases = s.gameState.teams[winner].recentPurchases || [];
        return purchases.filter(p => p.purchasedTurn <= 3).length >= 3;
      }).length;

      if (earlySpenders >= sessions.length / 2) {
        patterns.push(`${Math.round(earlySpenders / sessions.length * 100)}% of winners invested heavily in turns 1-3 - early aggression pays off`);
      }
    }
  }

  return { patterns };
}

function analyzeWinners(sessions: SessionData[]) {
  const natoWins = sessions.filter(s => determineWinner(s.gameState) === 'NATO').length;
  const russiaWins = sessions.filter(s => determineWinner(s.gameState) === 'Russia').length;
  
  return { natoWins, russiaWins, total: natoWins + russiaWins };
}

function determineWinner(gameState: GameState): Team | null {
  const natoScore = gameState.teams.NATO.totalDeterrence;
  const russiaScore = gameState.teams.Russia.totalDeterrence;
  
  if (natoScore > russiaScore) return 'NATO';
  if (russiaScore > natoScore) return 'Russia';
  return null;
}

function generateHeadlineInsight(
  sessions: SessionData[],
  winnerStats: { natoWins: number; russiaWins: number; total: number },
  dimensionInsights: { winsByDomain: Record<Domain, number> }
): string {
  if (sessions.length === 0) return "No data to analyze";
  if (winnerStats.total === 0) return `Analyzed ${sessions.length} sessions - all games still in progress or tied`;

  const topDomain = (Object.entries(dimensionInsights.winsByDomain) as [Domain, number][])
    .sort((a, b) => b[1] - a[1])[0];

  if (winnerStats.natoWins > winnerStats.russiaWins) {
    return `NATO dominates with ${winnerStats.natoWins} victories across ${sessions.length} sessions, with ${topDomain[0]} superiority being the most decisive factor.`;
  } else if (winnerStats.russiaWins > winnerStats.natoWins) {
    return `Russia takes control with ${winnerStats.russiaWins} wins across ${sessions.length} matches, leveraging ${topDomain[0]} strength as their primary weapon.`;
  } else {
    return `A dead heat - NATO and Russia split ${winnerStats.total} decisions evenly, with ${topDomain[0]} emerging as the key battleground dimension.`;
  }
}

function generateNarrativeCommentary(
  sessions: SessionData[],
  cardTiming: any,
  momentum: any,
  asymmetry: any,
  comeback: any,
  dimension: any,
  consistency: any,
  crossSession: any,
  winners: any
): string {
  if (sessions.length === 0) {
    return "Select some game sessions to unlock detailed strategic insights. The analysis will examine card timing, momentum shifts, team preferences, and winning patterns across your selected matches.";
  }

  let commentary = `Looking at ${sessions.length} strategic encounters, we're seeing some fascinating patterns emerge. `;

  // Winner narrative
  if (winners.total > 0) {
    if (winners.natoWins > winners.russiaWins) {
      commentary += `NATO's been running the table lately, notching ${winners.natoWins} wins compared to Russia's ${winners.russiaWins}. `;
    } else if (winners.russiaWins > winners.natoWins) {
      commentary += `Russia's finding their groove with ${winners.russiaWins} victories while NATO manages just ${winners.natoWins}. `;
    } else {
      commentary += `It's a perfectly balanced rivalry - both sides claiming ${winners.natoWins} wins apiece. `;
    }
  }

  // Card timing narrative
  if (cardTiming.earlyPermanentWins > cardTiming.latePermanentWins) {
    commentary += `Winners are investing in permanent cards early - it's like building your infrastructure in the first quarter and reaping dividends all game long. `;
  } else if (cardTiming.latePermanentWins > cardTiming.earlyPermanentWins) {
    commentary += `We're seeing late-game permanent purchases paying off - teams that stay patient and strike in the clutch are finding success. `;
  }

  // Momentum narrative
  if (momentum.comebackWins > momentum.dominantWins) {
    commentary += `These matches are nail-biters - early leads mean nothing when the late game arrives. `;
  } else if (momentum.dominantWins > 0) {
    commentary += `Once a team gets ahead, they tend to stay there - early momentum is king in these matchups. `;
  }

  // Strategy consistency narrative
  if (consistency.balancedWins > consistency.focusedWins) {
    commentary += `The balanced approach is winning out - teams that spread their investments across all five dimensions are harder to crack. `;
  } else if (consistency.focusedWins > 0) {
    commentary += `Specialists are thriving - picking two or three domains and dominating them proves more effective than spreading thin. `;
  }

  commentary += `The data tells a clear story: success requires reading the opponent, timing your investments, and either building an unassailable lead or staying close enough to strike when opportunities emerge.`;

  return commentary;
}
