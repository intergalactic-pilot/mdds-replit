import type { SessionData } from "./sessionAnalyzer";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type Domain = 'joint' | 'economy' | 'cognitive' | 'space' | 'cyber';

function determineWinner(gameState: any): 'NATO' | 'Russia' | null {
  if (gameState.turn < gameState.maxTurns) {
    return null;
  }
  
  const natoScore = gameState.teams.NATO.totalDeterrence;
  const russiaScore = gameState.teams.Russia.totalDeterrence;
  
  if (natoScore > russiaScore) return 'NATO';
  if (russiaScore > natoScore) return 'Russia';
  return null;
}

export function answerQuestion(question: string, sessions: SessionData[]): string {
  const lowerQuestion = question.toLowerCase();

  if (sessions.length === 0) {
    return "Please select at least one game session to analyze. Once you've selected sessions, I can answer questions based on the actual data from those games.";
  }

  // Winner analysis
  if (lowerQuestion.includes('who won') || lowerQuestion.includes('winner')) {
    const winners = sessions.map(s => ({
      name: s.sessionName,
      winner: determineWinner(s.gameState)
    }));
    
    const natoWins = winners.filter(w => w.winner === 'NATO').length;
    const russiaWins = winners.filter(w => w.winner === 'Russia').length;
    const ties = winners.filter(w => w.winner === null).length;
    
    let response = `Based on ${sessions.length} selected session${sessions.length > 1 ? 's' : ''}:\n\n`;
    response += `• NATO victories: ${natoWins}\n`;
    response += `• Russia victories: ${russiaWins}\n`;
    response += `• Incomplete/Tied: ${ties}\n\n`;
    
    if (natoWins > 0 || russiaWins > 0) {
      response += `Win rate: NATO ${Math.round(natoWins / Math.max(natoWins + russiaWins, 1) * 100)}% vs Russia ${Math.round(russiaWins / Math.max(natoWins + russiaWins, 1) * 100)}%`;
    }
    
    return response;
  }

  // Score analysis
  if (lowerQuestion.includes('score') || lowerQuestion.includes('deterrence')) {
    const completedSessions = sessions.filter(s => determineWinner(s.gameState) !== null);
    
    if (completedSessions.length === 0) {
      return "None of the selected sessions are completed yet. Final scores are only available for finished games.";
    }
    
    const natoScores = completedSessions.map(s => s.gameState.teams.NATO.totalDeterrence);
    const russiaScores = completedSessions.map(s => s.gameState.teams.Russia.totalDeterrence);
    
    const avgNATO = natoScores.reduce((a, b) => a + b, 0) / natoScores.length;
    const avgRussia = russiaScores.reduce((a, b) => a + b, 0) / russiaScores.length;
    
    const maxNATO = Math.max(...natoScores);
    const maxRussia = Math.max(...russiaScores);
    
    let response = `Deterrence scores across ${completedSessions.length} completed session${completedSessions.length > 1 ? 's' : ''}:\n\n`;
    response += `NATO:\n`;
    response += `• Average: ${Math.round(avgNATO)}\n`;
    response += `• Highest: ${maxNATO}\n\n`;
    response += `Russia:\n`;
    response += `• Average: ${Math.round(avgRussia)}\n`;
    response += `• Highest: ${maxRussia}\n\n`;
    response += `Average margin: ${Math.abs(Math.round(avgNATO - avgRussia))} points`;
    
    return response;
  }

  // Domain analysis
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
  const mentionedDomain = domains.find(d => lowerQuestion.includes(d));
  
  if (mentionedDomain || lowerQuestion.includes('domain')) {
    const completedSessions = sessions.filter(s => determineWinner(s.gameState) !== null);
    
    if (completedSessions.length === 0) {
      return "None of the selected sessions are completed yet. Domain analysis requires finished games.";
    }
    
    if (mentionedDomain) {
      const natoScores = completedSessions.map(s => s.gameState.teams.NATO.deterrence[mentionedDomain]);
      const russiaScores = completedSessions.map(s => s.gameState.teams.Russia.deterrence[mentionedDomain]);
      
      const avgNATO = natoScores.reduce((a, b) => a + b, 0) / natoScores.length;
      const avgRussia = russiaScores.reduce((a, b) => a + b, 0) / russiaScores.length;
      
      return `${mentionedDomain.charAt(0).toUpperCase() + mentionedDomain.slice(1)} domain performance across ${completedSessions.length} completed session${completedSessions.length > 1 ? 's' : ''}:\n\n` +
        `• NATO average: ${Math.round(avgNATO)}\n` +
        `• Russia average: ${Math.round(avgRussia)}\n` +
        `• Advantage: ${avgNATO > avgRussia ? 'NATO' : 'Russia'} by ${Math.abs(Math.round(avgNATO - avgRussia))} points`;
    }
    
    // All domains
    let response = `Domain performance across ${completedSessions.length} completed session${completedSessions.length > 1 ? 's' : ''}:\n\n`;
    
    domains.forEach(domain => {
      const natoAvg = completedSessions.reduce((sum, s) => sum + s.gameState.teams.NATO.deterrence[domain], 0) / completedSessions.length;
      const russiaAvg = completedSessions.reduce((sum, s) => sum + s.gameState.teams.Russia.deterrence[domain], 0) / completedSessions.length;
      
      response += `${domain.charAt(0).toUpperCase() + domain.slice(1)}:\n`;
      response += `  NATO: ${Math.round(natoAvg)} | Russia: ${Math.round(russiaAvg)}\n`;
    });
    
    return response;
  }

  // Budget analysis
  if (lowerQuestion.includes('budget') || lowerQuestion.includes('spending')) {
    const avgNATOBudget = sessions.reduce((sum, s) => sum + s.gameState.teams.NATO.budget, 0) / sessions.length;
    const avgRussiaBudget = sessions.reduce((sum, s) => sum + s.gameState.teams.Russia.budget, 0) / sessions.length;
    
    return `Budget status across ${sessions.length} session${sessions.length > 1 ? 's' : ''}:\n\n` +
      `• NATO average remaining: ${Math.round(avgNATOBudget)}K\n` +
      `• Russia average remaining: ${Math.round(avgRussiaBudget)}K\n\n` +
      `Note: Lower budgets indicate more aggressive spending strategies.`;
  }

  // Card analysis
  if (lowerQuestion.includes('card') || lowerQuestion.includes('permanent')) {
    const avgNATOPermanents = sessions.reduce((sum, s) => sum + s.gameState.teams.NATO.ownedPermanents.length, 0) / sessions.length;
    const avgRussiaPermanents = sessions.reduce((sum, s) => sum + s.gameState.teams.Russia.ownedPermanents.length, 0) / sessions.length;
    
    const avgNATOPurchases = sessions.reduce((sum, s) => sum + (s.gameState.teams.NATO.recentPurchases?.length || 0), 0) / sessions.length;
    const avgRussiaPurchases = sessions.reduce((sum, s) => sum + (s.gameState.teams.Russia.recentPurchases?.length || 0), 0) / sessions.length;
    
    return `Card purchase patterns across ${sessions.length} session${sessions.length > 1 ? 's' : ''}:\n\n` +
      `NATO:\n` +
      `• Average permanent cards: ${avgNATOPermanents.toFixed(1)}\n` +
      `• Average total purchases: ${avgNATOPurchases.toFixed(1)}\n\n` +
      `Russia:\n` +
      `• Average permanent cards: ${avgRussiaPermanents.toFixed(1)}\n` +
      `• Average total purchases: ${avgRussiaPurchases.toFixed(1)}`;
  }

  // Turn analysis
  if (lowerQuestion.includes('turn') || lowerQuestion.includes('how long')) {
    const avgTurn = sessions.reduce((sum, s) => sum + s.gameState.turn, 0) / sessions.length;
    const completedSessions = sessions.filter(s => s.gameState.turn >= s.gameState.maxTurns);
    
    return `Turn progression across ${sessions.length} session${sessions.length > 1 ? 's' : ''}:\n\n` +
      `• Average current turn: ${avgTurn.toFixed(1)}\n` +
      `• Completed sessions: ${completedSessions.length}\n` +
      `• In progress: ${sessions.length - completedSessions.length}`;
  }

  // Team comparison
  if (lowerQuestion.includes('compare') || lowerQuestion.includes('difference') || lowerQuestion.includes('vs')) {
    const completedSessions = sessions.filter(s => determineWinner(s.gameState) !== null);
    
    if (completedSessions.length === 0) {
      return "Please select completed sessions for team comparison analysis.";
    }
    
    const natoWins = completedSessions.filter(s => determineWinner(s.gameState) === 'NATO').length;
    const russiaWins = completedSessions.filter(s => determineWinner(s.gameState) === 'Russia').length;
    
    const avgNATOScore = completedSessions.reduce((sum, s) => sum + s.gameState.teams.NATO.totalDeterrence, 0) / completedSessions.length;
    const avgRussiaScore = completedSessions.reduce((sum, s) => sum + s.gameState.teams.Russia.totalDeterrence, 0) / completedSessions.length;
    
    return `NATO vs Russia comparison (${completedSessions.length} completed sessions):\n\n` +
      `Victories:\n` +
      `• NATO: ${natoWins} (${Math.round(natoWins / completedSessions.length * 100)}%)\n` +
      `• Russia: ${russiaWins} (${Math.round(russiaWins / completedSessions.length * 100)}%)\n\n` +
      `Average Total Deterrence:\n` +
      `• NATO: ${Math.round(avgNATOScore)}\n` +
      `• Russia: ${Math.round(avgRussiaScore)}\n` +
      `• Difference: ${Math.abs(Math.round(avgNATOScore - avgRussiaScore))} points`;
  }

  // Session list
  if (lowerQuestion.includes('session') && (lowerQuestion.includes('list') || lowerQuestion.includes('show'))) {
    let response = `You have selected ${sessions.length} session${sessions.length > 1 ? 's' : ''}:\n\n`;
    sessions.forEach((s, i) => {
      const winner = determineWinner(s.gameState);
      response += `${i + 1}. ${s.sessionName}\n`;
      response += `   Turn ${s.gameState.turn}/${s.gameState.maxTurns}`;
      if (winner) {
        response += ` - Winner: ${winner}`;
      }
      response += '\n';
    });
    return response;
  }

  // Default response with suggestions
  return `I can answer questions about the ${sessions.length} selected session${sessions.length > 1 ? 's' : ''} based on actual game data. Try asking:\n\n` +
    `• "Who won the games?"\n` +
    `• "What were the final scores?"\n` +
    `• "How did teams perform in the economy domain?"\n` +
    `• "What's the average budget remaining?"\n` +
    `• "How many cards were purchased?"\n` +
    `• "Compare NATO vs Russia"\n` +
    `• "Show me the session list"\n\n` +
    `All answers are based on real data from your selected sessions.`;
}

export type { Message };
