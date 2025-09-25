import jsPDF from 'jspdf';
import { TeamState, Team, Domain } from '@shared/schema';

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
  pdf.setLineWidth(2);
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
  pdf.setLineWidth(2);
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
  
  // Defense vs Offense Analysis
  if (data.turnStatistics.length > 0) {
    checkPage(80);
    
    const latestStats = data.turnStatistics[data.turnStatistics.length - 1];
    const defenseOffenseData = domains.map(domain => ({
      label: domain.charAt(0).toUpperCase() + domain.slice(1),
      nato: latestStats.natoDeterrence[domain], // Defense
      russia: 100 - latestStats.natoDeterrence[domain] // Offense potential
    }));
    
    drawBarChart(
      pdf,
      margin + 5,
      yPosition + 20,
      contentWidth - 10,
      50,
      defenseOffenseData,
      'NATO Defense vs Russia Offense Potential (Latest Turn)'
    );
    yPosition += 75;
    
    // Russia Defense vs NATO Offense
    checkPage(80);
    const defenseOffenseDataRussia = domains.map(domain => ({
      label: domain.charAt(0).toUpperCase() + domain.slice(1),
      nato: 100 - latestStats.russiaDeterrence[domain], // NATO offense potential
      russia: latestStats.russiaDeterrence[domain] // Russia defense
    }));
    
    drawBarChart(
      pdf,
      margin + 5,
      yPosition + 20,
      contentWidth - 10,
      50,
      defenseOffenseDataRussia,
      'NATO Offense Potential vs Russia Defense (Latest Turn)'
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