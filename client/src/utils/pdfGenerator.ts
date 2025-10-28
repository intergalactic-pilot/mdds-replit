import jsPDF from 'jspdf';
import { TeamState, Team, Domain, Card } from '@shared/schema';
import cardsData from '../data/cards.json';

interface TurnStatistics {
  turn: number;
  natoTotalDeterrence: number;
  russiaTotalDeterrence: number;
  natoDeterrence: Record<Domain, number>;
  russiaDeterrence: Record<Domain, number>;
  timestamp: Date;
}

interface StrategyLogEntry {
  turn: number;
  team: Team;
  action: string;
  timestamp: Date;
}

interface SessionInfo {
  sessionName: string;
  participants: Array<{
    name: string;
    country: string;
  }>;
}

interface PDFReportData {
  currentTurn: number;
  maxTurns: number;
  natoTeam: TeamState;
  russiaTeam: TeamState;
  turnStatistics: TurnStatistics[];
  strategyLog: StrategyLogEntry[];
  sessionInfo: SessionInfo;
}

// Generate Card Logs PDF Report
export const generateCardLogsPDF = (strategyLog: StrategyLogEntry[], sessionInfo: SessionInfo) => {
  const pdf = new jsPDF();
  const margin = 20;
  const contentWidth = 170; // 210 - 40 (margins)
  let yPosition = margin;
  
  // Helper function to check if we need a new page
  const checkPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > 280) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Header
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MDDS - Card Purchase Logs', margin, yPosition);
  yPosition += 15;
  
  // Session info
  if (sessionInfo.sessionName) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Session: ${sessionInfo.sessionName}`, margin, yPosition);
    yPosition += 8;
  }
  
  // Generation timestamp
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;
  
  // Filter only card purchase logs
  const cardPurchaseLogs = strategyLog.filter(entry => 
    entry.action.includes('purchased') && !entry.action.includes('Committed purchases')
  );
  
  if (cardPurchaseLogs.length === 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('No card purchases recorded yet.', margin, yPosition);
  } else {
    // Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Card Purchases: ${cardPurchaseLogs.length}`, margin + 5, yPosition);
    yPosition += 6;
    
    const natoCount = cardPurchaseLogs.filter(log => log.team === 'NATO').length;
    const russiaCount = cardPurchaseLogs.filter(log => log.team === 'Russia').length;
    
    pdf.text(`NATO Purchases: ${natoCount}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`Russia Purchases: ${russiaCount}`, margin + 5, yPosition);
    yPosition += 15;
    
    // Card Purchase Logs
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Card Purchase History', margin, yPosition);
    yPosition += 10;
    
    // Group by turn
    const logByTurn = cardPurchaseLogs.reduce((acc, entry) => {
      if (!acc[entry.turn]) acc[entry.turn] = [];
      acc[entry.turn].push(entry);
      return acc;
    }, {} as Record<number, StrategyLogEntry[]>);
    
    Object.keys(logByTurn).sort((a, b) => parseInt(a) - parseInt(b)).forEach(turn => {
      checkPage(25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Turn ${turn}`, margin + 5, yPosition);
      yPosition += 8;
      
      logByTurn[parseInt(turn)].forEach(entry => {
        checkPage(8);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const timeStr = new Date(entry.timestamp).toLocaleTimeString();
        const teamColor = entry.team === 'NATO' ? '[NATO]' : '[RUS]';
        const logText = `${teamColor} ${timeStr}: ${entry.action}`;
        
        const lines = pdf.splitTextToSize(logText, contentWidth - 20);
        lines.forEach((line: string) => {
          pdf.text(line, margin + 10, yPosition);
          yPosition += 4;
        });
        yPosition += 2;
      });
      
      yPosition += 8;
    });
  }
  
  // Save the PDF
  const fileName = `MDDS_Card_Logs_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

// Helper function to draw line chart
const drawLineChart = (
  pdf: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  height: number,
  data: Array<{turn: number, nato: number, russia: number}>,
  title: string
) => {
  // Modern chart border with rounded effect
  pdf.setLineWidth(1);
  pdf.setDrawColor(150, 150, 150);
  pdf.rect(x, y, width, height);
  
  // Title
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, x + width/2, y - 5, { align: 'center' });
  
  if (data.length === 0) return;
  
  // Handle single data point case
  if (data.length === 1) {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Insufficient data for line chart (minimum 2 turns required)', x + width/2, y + height/2, { align: 'center' });
    return;
  }
  
  const maxValue = Math.max(...data.map(d => Math.max(d.nato, d.russia)));
  const minValue = Math.min(...data.map(d => Math.min(d.nato, d.russia)));
  const valueRange = Math.max(maxValue - minValue, 1); // Ensure minimum range of 1
  
  // Y-axis labels
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  for (let i = 0; i <= 4; i++) {
    const value = minValue + (valueRange * i / 4);
    const labelY = y + height - (i * height / 4);
    pdf.text(Math.round(value).toString(), x - 10, labelY, { align: 'right' });
    
    // Modern grid lines
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(220, 220, 220);
    pdf.line(x, labelY, x + width, labelY);
  }
  
  // X-axis labels
  data.forEach((point, index) => {
    const labelX = x + (index * width / (data.length - 1));
    pdf.text(`T${point.turn}`, labelX, y + height + 10, { align: 'center' });
  });
  
  // Draw NATO line (blue) with enhanced styling
  pdf.setLineWidth(1.2);
  pdf.setDrawColor(59, 130, 246); // Blue
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + (i * width / (data.length - 1));
    const y1 = y + height - ((data[i].nato - minValue) / valueRange * height);
    const x2 = x + ((i + 1) * width / (data.length - 1));
    const y2 = y + height - ((data[i + 1].nato - minValue) / valueRange * height);
    pdf.line(x1, y1, x2, y2);
  }
  
  // Draw NATO data points (dots)
  pdf.setFillColor(59, 130, 246); // Blue
  data.forEach((point, index) => {
    const dotX = x + (index * width / (data.length - 1));
    const dotY = y + height - ((point.nato - minValue) / valueRange * height);
    pdf.circle(dotX, dotY, 1.5, 'F');
    
    // Add value label
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(point.nato.toString(), dotX - 3, dotY - 3);
  });
  
  // Draw Russia line (red) with enhanced styling
  pdf.setDrawColor(239, 68, 68); // Red
  pdf.setLineWidth(1.2);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + (i * width / (data.length - 1));
    const y1 = y + height - ((data[i].russia - minValue) / valueRange * height);
    const x2 = x + ((i + 1) * width / (data.length - 1));
    const y2 = y + height - ((data[i + 1].russia - minValue) / valueRange * height);
    pdf.line(x1, y1, x2, y2);
  }
  
  // Draw Russia data points (dots)
  pdf.setFillColor(239, 68, 68); // Red
  data.forEach((point, index) => {
    const dotX = x + (index * width / (data.length - 1));
    const dotY = y + height - ((point.russia - minValue) / valueRange * height);
    pdf.circle(dotX, dotY, 1.5, 'F');
    
    // Add value label
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(239, 68, 68);
    pdf.text(point.russia.toString(), dotX + 3, dotY - 3);
  });
  
  // Enhanced Legend with dots
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(2);
  pdf.line(x + width - 80, y - 15, x + width - 65, y - 15);
  pdf.setFillColor(59, 130, 246);
  pdf.circle(x + width - 72.5, y - 15, 1, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('NATO', x + width - 60, y - 12);
  
  pdf.setDrawColor(239, 68, 68);
  pdf.line(x + width - 35, y - 15, x + width - 20, y - 15);
  pdf.setFillColor(239, 68, 68);
  pdf.circle(x + width - 27.5, y - 15, 1, 'F');
  pdf.text('Russia', x + width - 15, y - 12);
  
  pdf.setDrawColor(0, 0, 0); // Reset to black
  pdf.setTextColor(0, 0, 0); // Reset text color to black
};

// Helper function to draw bar chart
const drawBarChart = (
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  data: Array<{label: string, nato: number, russia: number}>,
  title: string
) => {
  // Modern chart border
  pdf.setLineWidth(1);
  pdf.setDrawColor(150, 150, 150);
  pdf.rect(x, y, width, height);
  
  // Title
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, x + width/2, y - 5, { align: 'center' });
  
  if (data.length === 0) return;
  
  const maxValue = Math.max(...data.map(d => Math.max(d.nato, d.russia)), 1); // Ensure minimum value of 1
  const barWidth = width / (data.length * 2 + 1);
  
  // Y-axis labels
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  for (let i = 0; i <= 4; i++) {
    const value = (maxValue * i / 4);
    const labelY = y + height - (i * height / 4);
    pdf.text(Math.round(value).toString(), x - 10, labelY, { align: 'right' });
    
    // Modern grid lines
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(220, 220, 220);
    pdf.line(x, labelY, x + width, labelY);
  }
  
  // Draw bars with enhanced styling
  data.forEach((item, index) => {
    const barX = x + (index * 2 + 0.5) * barWidth;
    
    // NATO bar (blue) with enhanced styling
    const natoHeight = (item.nato / maxValue) * height;
    pdf.setFillColor(59, 130, 246);
    pdf.rect(barX, y + height - natoHeight, barWidth * 0.8, natoHeight, 'F');
    
    // Add NATO value label
    if (natoHeight > 10) {
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(item.nato.toString(), barX + (barWidth * 0.4), y + height - natoHeight/2, { align: 'center' });
    }
    
    // Russia bar (red) with enhanced styling
    const russiaHeight = (item.russia / maxValue) * height;
    pdf.setFillColor(239, 68, 68);
    pdf.rect(barX + barWidth, y + height - russiaHeight, barWidth * 0.8, russiaHeight, 'F');
    
    // Add Russia value label
    if (russiaHeight > 10) {
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(item.russia.toString(), barX + barWidth + (barWidth * 0.4), y + height - russiaHeight/2, { align: 'center' });
    }
    
    // X-axis label
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const labelText = item.label.length > 8 ? item.label.substring(0, 6) + '..' : item.label;
    pdf.text(labelText, barX + barWidth, y + height + 8, { align: 'center' });
  });
  
  // Enhanced Legend
  pdf.setFillColor(59, 130, 246);
  pdf.rect(x + width - 80, y - 18, 8, 4, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('NATO', x + width - 68, y - 15);
  
  pdf.setFillColor(239, 68, 68);
  pdf.rect(x + width - 35, y - 18, 8, 4, 'F');
  pdf.text('Russia', x + width - 23, y - 15);
  
  pdf.setDrawColor(0, 0, 0); // Reset to black
  pdf.setTextColor(0, 0, 0); // Reset text color to black
};

// Domain colors matching the web component
const domainColors = {
  joint: { r: 156, g: 163, b: 175 }, // #9CA3AF
  economy: { r: 16, g: 185, b: 129 }, // #10B981
  cognitive: { r: 139, g: 92, b: 246 }, // #8B5CF6
  space: { r: 59, g: 130, b: 246 }, // #3B82F6
  cyber: { r: 245, g: 158, b: 11 } // #F59E0B
};

// Helper function to draw domain-specific line chart
const drawDomainChart = (
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  data: Array<{turn: number, joint: number, economy: number, cognitive: number, space: number, cyber: number}>,
  title: string
) => {
  // Modern chart border
  pdf.setLineWidth(1);
  pdf.setDrawColor(150, 150, 150);
  pdf.rect(x, y, width, height);
  
  // Title
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, x + width/2, y - 3, { align: 'center' });
  
  if (data.length === 0) return;
  
  // Handle single data point case
  if (data.length === 1) {
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Insufficient data (minimum 2 turns)', x + width/2, y + height/2, { align: 'center' });
    return;
  }
  
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
  
  // Find max and min values across all domains
  const allValues = data.flatMap(d => domains.map(domain => d[domain]));
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const valueRange = Math.max(maxValue - minValue, 1);
  
  // Y-axis labels (smaller)
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  for (let i = 0; i <= 3; i++) {
    const value = minValue + (valueRange * i / 3);
    const labelY = y + height - (i * height / 3);
    pdf.text(Math.round(value).toString(), x - 8, labelY, { align: 'right' });
    
    // Modern grid lines
    pdf.setLineWidth(0.2);
    pdf.setDrawColor(230, 230, 230);
    pdf.line(x, labelY, x + width, labelY);
  }
  
  // X-axis labels (smaller)
  data.forEach((point, index) => {
    const labelX = x + (index * width / (data.length - 1));
    pdf.setFontSize(6);
    pdf.text(`T${point.turn}`, labelX, y + height + 6, { align: 'center' });
  });
  
  // Draw lines for each domain
  domains.forEach(domain => {
    const color = domainColors[domain];
    pdf.setLineWidth(1);
    pdf.setDrawColor(color.r, color.g, color.b);
    
    // Draw line segments
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = x + (i * width / (data.length - 1));
      const y1 = y + height - ((data[i][domain] - minValue) / valueRange * height);
      const x2 = x + ((i + 1) * width / (data.length - 1));
      const y2 = y + height - ((data[i + 1][domain] - minValue) / valueRange * height);
      pdf.line(x1, y1, x2, y2);
    }
    
    // Draw dots at data points
    pdf.setFillColor(color.r, color.g, color.b);
    data.forEach((point, index) => {
      const dotX = x + (index * width / (data.length - 1));
      const dotY = y + height - ((point[domain] - minValue) / valueRange * height);
      pdf.circle(dotX, dotY, 1, 'F');
    });
  });
  
  // Domain legend (compact)
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  domains.forEach((domain, index) => {
    const color = domainColors[domain];
    const legendX = x + 5 + (index * 15);
    const legendY = y - 8;
    
    pdf.setFillColor(color.r, color.g, color.b);
    pdf.circle(legendX, legendY, 0.8, 'F');
    pdf.setTextColor(color.r, color.g, color.b);
    pdf.text(domain.charAt(0).toUpperCase(), legendX + 3, legendY + 1);
  });
  
  pdf.setTextColor(0, 0, 0); // Reset text color
};

// Helper function to calculate defense/offense effects (matching web component logic)
const calculateDefenseOffenseEffects = (data: PDFReportData) => {
  const cards = cardsData as Card[];
  
  // Calculate team's offensive effects on opponent's dimensions for each turn (cumulative)
  const calculateOffensiveEffects = (attackingTeam: 'NATO' | 'Russia') => {
    const effectsByTurn: Record<number, Record<Domain, number>> = {};
    const cumulativeEffects: Record<Domain, number> = {
      joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0
    };
    
    // Initialize all turns with zero effects
    data.turnStatistics.forEach(stat => {
      effectsByTurn[stat.turn] = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 };
    });
    
    // Process each turn sequentially to build cumulative effects
    data.turnStatistics.forEach(stat => {
      // Find all card purchases for this team in this turn
      const turnPurchases = data.strategyLog.filter(logEntry => 
        logEntry.team === attackingTeam && 
        logEntry.turn === stat.turn && 
        logEntry.action.includes('purchased')
      );
      
      // Add effects from cards purchased this turn
      turnPurchases.forEach(logEntry => {
        const cardIdMatch = logEntry.action.match(/\(([^)]+)\)/);
        if (cardIdMatch) {
          const cardId = cardIdMatch[1];
          const card = cards.find(c => c.id === cardId);
          
          if (card && card.effects) {
            card.effects.forEach(effect => {
              if (effect.target === 'opponent') {
                // Add to cumulative effects (keep negative values)
                cumulativeEffects[effect.domain] += effect.delta;
              } else if (effect.target === 'global') {
                // Global effects also impact opponent
                cumulativeEffects[effect.domain] += effect.delta;
              }
            });
          }
        }
      });
      
      // Record cumulative effects for this turn
      effectsByTurn[stat.turn] = { ...cumulativeEffects };
    });
    
    return effectsByTurn;
  };
  
  // Calculate team's defensive effects (self-targeting positive effects) for each turn (cumulative)
  const calculateDefensiveEffects = (defendingTeam: 'NATO' | 'Russia') => {
    const effectsByTurn: Record<number, Record<Domain, number>> = {};
    const cumulativeEffects: Record<Domain, number> = {
      joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0
    };
    
    // Initialize all turns with zero effects
    data.turnStatistics.forEach(stat => {
      effectsByTurn[stat.turn] = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 };
    });
    
    // Process each turn sequentially to build cumulative effects
    data.turnStatistics.forEach(stat => {
      // Find all card purchases for this team in this turn
      const turnPurchases = data.strategyLog.filter(logEntry => 
        logEntry.team === defendingTeam && 
        logEntry.turn === stat.turn && 
        logEntry.action.includes('purchased')
      );
      
      // Add effects from cards purchased this turn
      turnPurchases.forEach(logEntry => {
        const cardIdMatch = logEntry.action.match(/\(([^)]+)\)/);
        if (cardIdMatch) {
          const cardId = cardIdMatch[1];
          const card = cards.find(c => c.id === cardId);
          
          if (card && card.effects) {
            card.effects.forEach(effect => {
              if (effect.target === 'self') {
                // Add to cumulative defensive effects (including negative deltas)
                cumulativeEffects[effect.domain] += effect.delta;
              } else if (effect.target === 'global') {
                // Global effects also impact self
                cumulativeEffects[effect.domain] += effect.delta;
              }
            });
          }
        }
      });
      
      // Record cumulative effects for this turn
      effectsByTurn[stat.turn] = { ...cumulativeEffects };
    });
    
    return effectsByTurn;
  };
  
  const natoOffensiveEffects = calculateOffensiveEffects('NATO');
  const russiaOffensiveEffects = calculateOffensiveEffects('Russia');
  const natoDefensiveEffects = calculateDefensiveEffects('NATO');
  const russiaDefensiveEffects = calculateDefensiveEffects('Russia');
  
  // Prepare data for NATO Defensive chart (showing self-effects)
  const natoDefenseData = data.turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: natoDefensiveEffects[stat.turn]?.joint || 0,
    economy: natoDefensiveEffects[stat.turn]?.economy || 0,
    cognitive: natoDefensiveEffects[stat.turn]?.cognitive || 0,
    space: natoDefensiveEffects[stat.turn]?.space || 0,
    cyber: natoDefensiveEffects[stat.turn]?.cyber || 0
  }));
  
  // Prepare data for NATO Offensive chart (showing effects on Russia)
  const natoOffenseData = data.turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: natoOffensiveEffects[stat.turn]?.joint || 0,
    economy: natoOffensiveEffects[stat.turn]?.economy || 0,
    cognitive: natoOffensiveEffects[stat.turn]?.cognitive || 0,
    space: natoOffensiveEffects[stat.turn]?.space || 0,
    cyber: natoOffensiveEffects[stat.turn]?.cyber || 0
  }));
  
  // Prepare data for Russia Defensive chart (showing self-effects)
  const russiaDefenseData = data.turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: russiaDefensiveEffects[stat.turn]?.joint || 0,
    economy: russiaDefensiveEffects[stat.turn]?.economy || 0,
    cognitive: russiaDefensiveEffects[stat.turn]?.cognitive || 0,
    space: russiaDefensiveEffects[stat.turn]?.space || 0,
    cyber: russiaDefensiveEffects[stat.turn]?.cyber || 0
  }));
  
  // Prepare data for Russia Offensive chart (showing effects on NATO)
  const russiaOffenseData = data.turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: russiaOffensiveEffects[stat.turn]?.joint || 0,
    economy: russiaOffensiveEffects[stat.turn]?.economy || 0,
    cognitive: russiaOffensiveEffects[stat.turn]?.cognitive || 0,
    space: russiaOffensiveEffects[stat.turn]?.space || 0,
    cyber: russiaOffensiveEffects[stat.turn]?.cyber || 0
  }));
  
  return { natoDefenseData, natoOffenseData, russiaDefenseData, russiaOffenseData };
};

export const generateMDDSReport = async (data: PDFReportData) => {
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  
  let yPosition = margin;
  let pageNumber = 1;
  
  // Helper function to add page footer
  const addFooter = () => {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };
  
  // Helper function to add new page
  const addNewPage = () => {
    addFooter();
    pdf.addPage();
    pageNumber++;
    yPosition = margin;
  };
  
  // Helper function to check page space
  const checkPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      addNewPage();
    }
  };
  
  // TITLE
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MDDS Strategic Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 30;
  
  // SESSION INFORMATION PART
  checkPage(50);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SESSION INFORMATION', margin, yPosition);
  yPosition += 15;
  
  // Create unified table for all session information
  const sessionName = data.sessionInfo.sessionName || 'Unnamed Session';
  const sessionDate = data.turnStatistics.length > 0 
    ? new Date(data.turnStatistics[0].timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : reportDate;
  
  const validParticipants = data.sessionInfo.participants.filter(p => p.name.trim() !== '' || p.country.trim() !== '');
  const participantsList = validParticipants.length > 0 
    ? validParticipants.map(p => `${p.name || 'N/A'} (${p.country || 'N/A'})`).join(', ')
    : 'No participants listed';
  
  // Table header
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, yPosition - 2, contentWidth, 8, 'F');
  pdf.text('Information Type', margin + 5, yPosition + 3);
  pdf.text('Details', margin + 60, yPosition + 3);
  yPosition += 10;
  
  // Table content
  pdf.setFont('helvetica', 'normal');
  
  // Session Name row
  pdf.text('Session Name', margin + 5, yPosition);
  const sessionNameLines = pdf.splitTextToSize(sessionName, contentWidth - 65);
  sessionNameLines.forEach((line: string, index: number) => {
    pdf.text(line, margin + 60, yPosition + (index * 5));
  });
  yPosition += Math.max(6, sessionNameLines.length * 5);
  
  // Session Date row
  pdf.text('Session Date', margin + 5, yPosition);
  pdf.text(sessionDate, margin + 60, yPosition);
  yPosition += 7;
  
  // Session Participants row
  pdf.text('Session Participants', margin + 5, yPosition);
  const participantLines = pdf.splitTextToSize(participantsList, contentWidth - 65);
  participantLines.forEach((line: string, index: number) => {
    pdf.text(line, margin + 60, yPosition + (index * 5));
  });
  yPosition += Math.max(6, participantLines.length * 5);
  
  // Table border
  pdf.setLineWidth(0.1);
  pdf.line(margin, yPosition - (sessionNameLines.length * 5) - 13 - 7 - (participantLines.length * 5), pageWidth - margin, yPosition - (sessionNameLines.length * 5) - 13 - 7 - (participantLines.length * 5));
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  pdf.line(margin, yPosition - (sessionNameLines.length * 5) - 13 - 7 - (participantLines.length * 5), margin, yPosition);
  pdf.line(pageWidth - margin, yPosition - (sessionNameLines.length * 5) - 13 - 7 - (participantLines.length * 5), pageWidth - margin, yPosition);
  pdf.line(margin + 55, yPosition - (sessionNameLines.length * 5) - 13 - 7 - (participantLines.length * 5), margin + 55, yPosition);
  
  yPosition += 20;
  
  // STATISTICS PART
  checkPage(40);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STATISTICS', margin, yPosition);
  yPosition += 15;
  
  // Total Deterrence Scores
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Deterrence Scores', margin, yPosition);
  yPosition += 10;
  
  // Current scores table
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin + 5, yPosition - 2, contentWidth - 10, 8, 'F');
  pdf.text('Team', margin + 10, yPosition + 3);
  pdf.text('Current Deterrence', margin + 60, yPosition + 3);
  pdf.text('Turn Progress', margin + 120, yPosition + 3);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('NATO', margin + 10, yPosition);
  pdf.text(data.natoTeam.totalDeterrence.toString(), margin + 60, yPosition);
  pdf.text(`${data.currentTurn} of ${data.maxTurns}`, margin + 120, yPosition);
  yPosition += 7;
  
  pdf.text('Russia', margin + 10, yPosition);
  pdf.text(data.russiaTeam.totalDeterrence.toString(), margin + 60, yPosition);
  pdf.text(`${data.currentTurn} of ${data.maxTurns}`, margin + 120, yPosition);
  yPosition += 20;
  
  // Dimensional Scores for Teams (Turn by Turn)
  checkPage(40);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dimensional Scores for Teams (Turn by Turn)', margin, yPosition);
  yPosition += 10;
  
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
  
  data.turnStatistics.forEach((stat, index) => {
    checkPage(60);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${stat.turn}`, margin + 5, yPosition);
    yPosition += 8;
    
    // Create table for dimensional scores
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin + 10, yPosition - 2, contentWidth - 20, 8, 'F');
    pdf.text('Dimension', margin + 15, yPosition + 3);
    pdf.text('NATO', margin + 70, yPosition + 3);
    pdf.text('Russia', margin + 100, yPosition + 3);
    pdf.text('Advantage', margin + 130, yPosition + 3);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    domains.forEach(domain => {
      const natoValue = stat.natoDeterrence[domain];
      const russiaValue = stat.russiaDeterrence[domain];
      const advantage = natoValue - russiaValue;
      
      pdf.text(domain.charAt(0).toUpperCase() + domain.slice(1), margin + 15, yPosition);
      pdf.text(natoValue.toString(), margin + 70, yPosition);
      pdf.text(russiaValue.toString(), margin + 100, yPosition);
      pdf.text(`${advantage > 0 ? '+' : ''}${advantage}`, margin + 130, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
  });
  
  // Turn-based Card Purchase Logs
  checkPage(40);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Turn-based Card Purchase Logs', margin, yPosition);
  yPosition += 10;
  
  // Group strategy log by turn
  const logByTurn = data.strategyLog.reduce((acc, entry) => {
    if (!acc[entry.turn]) acc[entry.turn] = [];
    acc[entry.turn].push(entry);
    return acc;
  }, {} as Record<number, StrategyLogEntry[]>);
  
  Object.keys(logByTurn).sort((a, b) => parseInt(a) - parseInt(b)).forEach(turn => {
    checkPage(25);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${turn} Actions`, margin + 5, yPosition);
    yPosition += 8;
    
    logByTurn[parseInt(turn)].forEach(entry => {
      checkPage(8);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const timeStr = new Date(entry.timestamp).toLocaleTimeString();
      const logText = `[${entry.team}] ${timeStr}: ${entry.action}`;
      
      const lines = pdf.splitTextToSize(logText, contentWidth - 20);
      lines.forEach((line: string) => {
        pdf.text(line, margin + 10, yPosition);
        yPosition += 4;
      });
    });
    
    yPosition += 10;
  });
  
  // Charts (overall statistics for both teams, dimension based statistics for both teams)
  checkPage(40);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Charts (Overall Statistics for Both Teams, Dimension Based Statistics for Both Teams)', margin, yPosition);
  yPosition += 10;
  
  // Overall Deterrence Line Chart
  checkPage(80);
  const lineChartData = data.turnStatistics.map(stat => ({
    turn: stat.turn,
    nato: stat.natoTotalDeterrence,
    russia: stat.russiaTotalDeterrence
  }));
  
  if (lineChartData.length > 0) {
    drawLineChart(
      pdf,
      margin + 5,
      yPosition + 20,
      contentWidth - 10,
      50,
      lineChartData,
      'Total Deterrence Over Time'
    );
    yPosition += 85;
  }
  
  // Current Dimensional Scores Bar Chart
  checkPage(80);
  const currentDimensionData = domains.map(domain => ({
    label: domain.charAt(0).toUpperCase() + domain.slice(1),
    nato: data.natoTeam.deterrence[domain],
    russia: data.russiaTeam.deterrence[domain]
  }));
  
  drawBarChart(
    pdf,
    margin + 5,
    yPosition + 20,
    contentWidth - 10,
    50,
    currentDimensionData,
    'Current Dimensional Deterrence Scores'
  );
  yPosition += 85;
  
  // Defensive/Offensive Statistic Charts that includes all charts in color
  checkPage(40);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Defensive/Offensive Statistic Charts', margin, yPosition);
  yPosition += 10;
  
  // Turn-by-Turn Dimensional Evolution Charts
  domains.forEach(domain => {
    checkPage(80);
    
    const dimensionData = data.turnStatistics.map(stat => ({
      turn: stat.turn,
      nato: stat.natoDeterrence[domain],
      russia: stat.russiaDeterrence[domain]
    }));
    
    if (dimensionData.length > 0) {
      drawLineChart(
        pdf,
        margin + 5,
        yPosition + 20,
        contentWidth - 10,
        40,
        dimensionData,
        `${domain.charAt(0).toUpperCase() + domain.slice(1)} Dimension Evolution`
      );
      yPosition += 70;
    }
  });
  
  // Four Individual Defense/Offense Charts
  if (data.turnStatistics.length > 1 && data.strategyLog.length > 0) {
    // Calculate effects similar to the web component
    const { natoDefenseData, natoOffenseData, russiaDefenseData, russiaOffenseData } = calculateDefenseOffenseEffects(data);
    
    // Chart layout: proper spacing to accommodate y-axis labels on both columns
    // Y-axis labels render at x - 8mm, so we need:
    // - Left chart must start at margin + 10 (so labels at x-8 = margin+2, safely within page)
    // - Right chart needs 12mm left of it for its y-axis labels (8mm offset + 4mm buffer for wide numbers)
    const chartWidth = (contentWidth - 32) / 2; // 69mm each, leaving room for labels
    const leftChartX = margin + 10; // Labels will be at margin + 2
    const rightChartX = margin + 10 + chartWidth + 12; // 12mm gap for right chart's y-axis labels
    
    // NATO Defensive Effects
    checkPage(70);
    drawDomainChart(
      pdf,
      leftChartX,
      yPosition + 20,
      chartWidth,
      50,
      natoDefenseData,
      'NATO Defensive Effects'
    );
    
    // NATO Offensive Effects on Russia
    drawDomainChart(
      pdf,
      rightChartX,
      yPosition + 20,
      chartWidth,
      50,
      natoOffenseData,
      'NATO Offensive Effects on Russia'
    );
    yPosition += 85;
    
    // Russia Defensive Effects
    checkPage(70);
    drawDomainChart(
      pdf,
      leftChartX,
      yPosition + 20,
      chartWidth,
      50,
      russiaDefenseData,
      'Russia Defensive Effects'
    );
    
    // Russia Offensive Effects on NATO
    drawDomainChart(
      pdf,
      rightChartX,
      yPosition + 20,
      chartWidth,
      50,
      russiaOffenseData,
      'Russia Offensive Effects on NATO'
    );
    yPosition += 75;
  }
  
  // Final footer
  addFooter();
  
  // Save the PDF with session-based naming
  const sessionNameClean = (data.sessionInfo.sessionName || 'MDDS_Session').replace(/[^a-zA-Z0-9]/g, '_');
  const dateString = new Date().toISOString().split('T')[0];
  pdf.save(`MDDS_Report_${sessionNameClean}_${dateString}.pdf`);
};

// Generate MDDS report and return as base64 string for database storage
export const generateMDDSReportBase64 = async (data: PDFReportData): Promise<string> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  
  let yPosition = margin;
  let pageNumber = 1;
  
  // Helper function to add page footer
  const addFooter = () => {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };
  
  // Helper function to add new page
  const addNewPage = () => {
    addFooter();
    pdf.addPage();
    pageNumber++;
    yPosition = margin;
  };
  
  // Helper function to check page space
  const checkPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      addNewPage();
    }
  };
  
  // TITLE
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MDDS Strategic Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 30;
  
  // SESSION INFORMATION
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Session Information', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  if (data.sessionInfo && data.sessionInfo.sessionName) {
    pdf.text(`Session: ${data.sessionInfo.sessionName}`, margin, yPosition);
    yPosition += 8;
  }
  
  pdf.text(`Turn: ${data.currentTurn} / ${data.maxTurns}`, margin, yPosition);
  yPosition += 8;
  
  // Determine winner
  const natoScore = data.natoTeam.totalDeterrence;
  const russiaScore = data.russiaTeam.totalDeterrence;
  let winner = 'TIE';
  if (natoScore > russiaScore) winner = 'NATO';
  if (russiaScore > natoScore) winner = 'Russia';
  
  pdf.text(`Winner: ${winner}`, margin, yPosition);
  yPosition += 20;
  
  // FINAL SCORES
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Final Deterrence Scores', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(59, 130, 246); // NATO blue
  pdf.text(`NATO: ${natoScore}`, margin, yPosition);
  yPosition += 8;
  
  pdf.setTextColor(239, 68, 68); // Russia red
  pdf.text(`Russia: ${russiaScore}`, margin, yPosition);
  yPosition += 15;
  
  pdf.setTextColor(0, 0, 0); // Reset to black
  
  addFooter();
  
  // Return PDF as raw base64 string (strip data URI prefix)
  const dataUri = pdf.output('datauristring');
  return dataUri.split(',')[1]; // Remove "data:application/pdf;filename=generated.pdf;base64," prefix
};