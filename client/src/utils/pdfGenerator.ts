import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

// Helper function to capture chart screenshots
const captureChartScreenshots = async () => {
  const screenshots: { [key: string]: string } = {};
  
  // List of chart selectors to capture
  const chartSelectors = [
    { id: 'deterrence-chart', name: 'Deterrence Overview' },
    { id: 'turn-based-logs', name: 'Turn-based Statistics' },
    { id: 'domain-statistics-content', name: 'Domain Statistics' },
    { id: 'defense-offense-charts', name: 'Defense/Offense Analysis' }
  ];
  
  for (const chart of chartSelectors) {
    try {
      const element = document.querySelector(`[data-testid="${chart.id}"]`);
      if (element) {
        const canvas = await html2canvas(element as HTMLElement, {
          backgroundColor: '#ffffff', // White background for reports
          scale: 2, // Higher resolution for crisp output
          useCORS: true,
          allowTaint: true,
          ignoreElements: (element) => {
            return element.tagName === 'BUTTON' && (element.textContent?.includes('Expand') || false);
          }
        });
        screenshots[chart.id] = canvas.toDataURL('image/png');
      }
    } catch (error) {
      console.warn(`Failed to capture chart ${chart.name}:`, error);
    }
  }
  
  return screenshots;
};

export const generateMDDSReport = async (data: PDFReportData) => {
  // Capture chart screenshots first
  const screenshots = await captureChartScreenshots();
  
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
  
  // Add overall and dimension-based chart screenshots
  const mainCharts = [
    { id: 'deterrence-chart', title: 'Overall Deterrence Statistics' },
    { id: 'domain-statistics-content', title: 'Dimension-Based Team Statistics' }
  ];
  
  mainCharts.forEach(chart => {
    if (screenshots[chart.id]) {
      checkPage(90);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(chart.title, margin + 5, yPosition);
      yPosition += 8;
      
      try {
        const imgWidth = contentWidth - 10;
        const imgHeight = 70;
        pdf.addImage(screenshots[chart.id], 'PNG', margin + 5, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.warn(`Failed to add chart image ${chart.title}:`, error);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[Chart visualization unavailable]', margin + 5, yPosition);
        yPosition += 15;
      }
    }
  });
  
  // Defensive/Offensive Statistic Charts that includes all charts in color
  checkPage(40);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Defensive/Offensive Statistic Charts', margin, yPosition);
  yPosition += 10;
  
  // Add turn-based and defense/offense charts
  const defenseOffenseCharts = [
    { id: 'turn-based-logs', title: 'Turn-Based Strategic Evolution' },
    { id: 'defense-offense-charts', title: 'Defensive and Offensive Analysis Charts' }
  ];
  
  defenseOffenseCharts.forEach(chart => {
    if (screenshots[chart.id]) {
      checkPage(90);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(chart.title, margin + 5, yPosition);
      yPosition += 8;
      
      try {
        const imgWidth = contentWidth - 10;
        const imgHeight = 70;
        pdf.addImage(screenshots[chart.id], 'PNG', margin + 5, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.warn(`Failed to add chart image ${chart.title}:`, error);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[Chart visualization unavailable]', margin + 5, yPosition);
        yPosition += 15;
      }
    }
  });
  
  // Final footer
  addFooter();
  
  // Save the PDF with session-based naming
  const sessionNameClean = (data.sessionInfo.sessionName || 'MDDS_Session').replace(/[^a-zA-Z0-9]/g, '_');
  const dateString = new Date().toISOString().split('T')[0];
  pdf.save(`MDDS_Report_${sessionNameClean}_${dateString}.pdf`);
};