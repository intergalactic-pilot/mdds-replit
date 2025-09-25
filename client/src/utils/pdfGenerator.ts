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
          backgroundColor: '#1a1a2e', // Dark background
          scale: 1.5, // Higher resolution
          useCORS: true,
          allowTaint: true,
          ignoreElements: (element) => {
            // Skip buttons and interactive elements that might cause issues
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
  
  // Helper function to add new page if needed
  const checkPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };
  
  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MDDS Strategy Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Subtitle with date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const reportDate = new Date().toLocaleDateString();
  pdf.text(`Generated on: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Session Information Section
  checkPage(50);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Session Information', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const sessionName = data.sessionInfo.sessionName || 'Unnamed Session';
  pdf.text(`Session Name: ${sessionName}`, margin, yPosition);
  yPosition += 10;
  
  // Participants
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Participants:', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const validParticipants = data.sessionInfo.participants.filter(p => p.name.trim() !== '' || p.country.trim() !== '');
  if (validParticipants.length > 0) {
    validParticipants.forEach((participant, index) => {
      const participantText = `${index + 1}. ${participant.name || 'N/A'} (${participant.country || 'N/A'})`;
      pdf.text(participantText, margin + 5, yPosition);
      yPosition += 6;
    });
  } else {
    pdf.text('No participants listed', margin + 5, yPosition);
    yPosition += 6;
  }
  yPosition += 15;

  // Charts Section
  checkPage(40);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Charts and Visualizations', margin, yPosition);
  yPosition += 15;

  // Add chart screenshots
  const chartNames = {
    'deterrence-chart': 'Deterrence Overview',
    'turn-based-logs': 'Turn-based Statistics', 
    'domain-statistics-content': 'Domain Statistics',
    'defense-offense-charts': 'Defense/Offense Analysis'
  };

  for (const [chartId, chartName] of Object.entries(chartNames)) {
    if (screenshots[chartId]) {
      // Add chart title
      checkPage(80);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(chartName, margin, yPosition);
      yPosition += 8;
      
      try {
        // Add chart image
        const imgWidth = contentWidth;
        const imgHeight = 60; // Fixed height for consistency
        pdf.addImage(screenshots[chartId], 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.warn(`Failed to add chart image ${chartName}:`, error);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Chart image could not be generated', margin, yPosition);
        yPosition += 15;
      }
    }
  }
  
  // Strategy Overview Section
  checkPage(40);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategy Overview', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Current Turn: ${data.currentTurn} of ${data.maxTurns}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`NATO Total Deterrence: ${data.natoTeam.totalDeterrence}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Russia Total Deterrence: ${data.russiaTeam.totalDeterrence}`, margin, yPosition);
  yPosition += 15;
  
  // Current Domain Statistics
  checkPage(60);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Current Domain Statistics', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Domain', margin, yPosition);
  pdf.text('NATO', margin + 40, yPosition);
  pdf.text('Russia', margin + 70, yPosition);
  pdf.text('Advantage', margin + 100, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'normal');
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
  domains.forEach(domain => {
    const natoValue = data.natoTeam.deterrence[domain];
    const russiaValue = data.russiaTeam.deterrence[domain];
    const advantage = natoValue - russiaValue;
    
    pdf.text(domain.charAt(0).toUpperCase() + domain.slice(1), margin, yPosition);
    pdf.text(natoValue.toString(), margin + 40, yPosition);
    pdf.text(russiaValue.toString(), margin + 70, yPosition);
    pdf.text(`${advantage > 0 ? '+' : ''}${advantage}`, margin + 100, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Turn-based Statistics
  checkPage(40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Turn-based Statistics', margin, yPosition);
  yPosition += 10;
  
  data.turnStatistics.forEach((stat, index) => {
    checkPage(25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${stat.turn}`, margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`NATO Total: ${stat.natoTotalDeterrence}`, margin + 5, yPosition);
    pdf.text(`Russia Total: ${stat.russiaTotalDeterrence}`, margin + 80, yPosition);
    yPosition += 6;
    
    // Domain breakdown for this turn
    domains.forEach(domain => {
      const natoValue = stat.natoDeterrence[domain];
      const russiaValue = stat.russiaDeterrence[domain];
      pdf.text(`${domain.charAt(0).toUpperCase() + domain.slice(1)}: NATO ${natoValue}, Russia ${russiaValue}`, margin + 10, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5;
  });
  
  // Defensive/Offensive Statistics
  checkPage(60);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Defensive/Offensive Analysis', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Defense = Team\'s own deterrence, Offense = 100 - Opponent\'s deterrence', margin, yPosition);
  yPosition += 10;
  
  data.turnStatistics.forEach((stat, index) => {
    checkPage(30);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${stat.turn} - Defensive/Offensive Scores`, margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // NATO Defense & Offense
    pdf.text('NATO:', margin + 5, yPosition);
    yPosition += 5;
    domains.forEach(domain => {
      const defense = stat.natoDeterrence[domain];
      const offense = 100 - stat.russiaDeterrence[domain];
      pdf.text(`  ${domain}: Def ${defense}, Off ${offense}`, margin + 10, yPosition);
      yPosition += 4;
    });
    
    // Russia Defense & Offense
    yPosition += 2;
    pdf.text('Russia:', margin + 5, yPosition);
    yPosition += 5;
    domains.forEach(domain => {
      const defense = stat.russiaDeterrence[domain];
      const offense = 100 - stat.natoDeterrence[domain];
      pdf.text(`  ${domain}: Def ${defense}, Off ${offense}`, margin + 10, yPosition);
      yPosition += 4;
    });
    
    yPosition += 8;
  });
  
  // Strategy Log
  checkPage(40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategy Log', margin, yPosition);
  yPosition += 10;
  
  // Group strategy log by turn
  const logByTurn = data.strategyLog.reduce((acc, entry) => {
    if (!acc[entry.turn]) acc[entry.turn] = [];
    acc[entry.turn].push(entry);
    return acc;
  }, {} as Record<number, StrategyLogEntry[]>);
  
  Object.keys(logByTurn).sort((a, b) => parseInt(a) - parseInt(b)).forEach(turn => {
    checkPage(20);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${turn}`, margin, yPosition);
    yPosition += 8;
    
    logByTurn[parseInt(turn)].forEach(entry => {
      checkPage(8);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const timeStr = new Date(entry.timestamp).toLocaleTimeString();
      const logText = `[${entry.team}] ${timeStr}: ${entry.action}`;
      
      // Split long text into multiple lines
      const lines = pdf.splitTextToSize(logText, contentWidth - 10);
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      yPosition += 1;
    });
    
    yPosition += 5;
  });
  
  // Team Details
  checkPage(60);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Team Details', margin, yPosition);
  yPosition += 10;
  
  // NATO Team Details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NATO Team', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Budget: ${data.natoTeam.budget}K`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Owned Permanents: ${data.natoTeam.ownedPermanents.length}`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Cart Items: ${data.natoTeam.cart.length}`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Recent Purchases: ${data.natoTeam.recentPurchases.length}`, margin + 5, yPosition);
  yPosition += 10;
  
  // Russia Team Details
  checkPage(30);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Russia Team', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Budget: ${data.russiaTeam.budget}K`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Owned Permanents: ${data.russiaTeam.ownedPermanents.length}`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Cart Items: ${data.russiaTeam.cart.length}`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Recent Purchases: ${data.russiaTeam.recentPurchases.length}`, margin + 5, yPosition);
  
  // Save the PDF
  pdf.save('MDDS Report.pdf');
};