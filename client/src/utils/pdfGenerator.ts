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
          backgroundColor: '#ffffff', // White background for academic look
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
  const margin = 25;
  const contentWidth = pageWidth - (2 * margin);
  
  let yPosition = margin;
  let pageNumber = 1;
  
  // Helper function to add page header (except first page)
  const addHeader = () => {
    if (pageNumber > 1) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('MDDS Strategic Analysis Report', margin, 15);
      pdf.setLineWidth(0.1);
      pdf.line(margin, 18, pageWidth - margin, 18);
    }
  };
  
  // Helper function to add page footer
  const addFooter = () => {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(reportDate, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };
  
  // Helper function to add new page
  const addNewPage = () => {
    addFooter();
    pdf.addPage();
    pageNumber++;
    addHeader();
    yPosition = pageNumber === 1 ? margin : 30;
  };
  
  // Helper function to check page space
  const checkPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      addNewPage();
    }
  };
  
  // Helper function for section spacing
  const addSectionSpacing = () => {
    yPosition += 8;
  };
  
  // TITLE PAGE
  yPosition = 60;
  
  // University/Institution header
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Strategic Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Main title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize('Multi Dimension Deterrence Strategy (MDDS) Analysis and Assessment', contentWidth * 0.8);
  titleLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  });
  yPosition += 15;
  
  // Subtitle
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  const sessionName = data.sessionInfo.sessionName || 'Strategic Planning Session';
  pdf.text(sessionName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 30;
  
  // Session metadata
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Session Information', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  
  pdf.setFontSize(10);
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Report Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  pdf.text(`Analysis Period: Turn 1 - ${data.currentTurn} of ${data.maxTurns}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Participants section
  if (data.sessionInfo.participants.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Participants', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const validParticipants = data.sessionInfo.participants.filter(p => p.name.trim() !== '' || p.country.trim() !== '');
    validParticipants.forEach((participant) => {
      const participantText = `${participant.name || 'N/A'} (${participant.country || 'N/A'})`;
      pdf.text(participantText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
    });
  }
  
  addFooter();
  addNewPage();
  
  // TABLE OF CONTENTS
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', margin, yPosition);
  yPosition += 15;
  
  const tocItems = [
    { title: 'Executive Summary', page: 3 },
    { title: 'Methodology', page: 4 },
    { title: 'Strategic Overview', page: 5 },
    { title: 'Data Analysis and Visualizations', page: 6 },
    { title: 'Dimension-wise Performance Analysis', page: 8 },
    { title: 'Turn-by-Turn Strategic Evolution', page: 10 },
    { title: 'Defense and Offense Dynamics', page: 12 },
    { title: 'Strategic Decision Log', page: 14 },
    { title: 'Team Performance Assessment', page: 16 },
    { title: 'Conclusions and Recommendations', page: 17 }
  ];
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  tocItems.forEach(item => {
    pdf.text(item.title, margin + 5, yPosition);
    pdf.text(item.page.toString(), pageWidth - margin - 10, yPosition, { align: 'right' });
    
    // Add dotted line
    const titleWidth = pdf.getTextWidth(item.title);
    const pageNumWidth = pdf.getTextWidth(item.page.toString());
    const dotsWidth = contentWidth - titleWidth - pageNumWidth - 15;
    const dotCount = Math.floor(dotsWidth / 3);
    const dots = '.'.repeat(dotCount);
    pdf.text(dots, margin + 5 + titleWidth + 5, yPosition);
    
    yPosition += 7;
  });
  
  addNewPage();
  
  // EXECUTIVE SUMMARY
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, yPosition);
  yPosition += 12;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  // Calculate key metrics for summary
  const finalNATODeterrence = data.natoTeam.totalDeterrence;
  const finalRussiaDeterrence = data.russiaTeam.totalDeterrence;
  const strategicAdvantage = finalNATODeterrence - finalRussiaDeterrence;
  
  const summaryParagraphs = [
    `This report presents a comprehensive analysis of the Multi Dimension Deterrence Strategy (MDDS) simulation conducted over ${data.currentTurn} strategic turns. The simulation analyzed deterrence effectiveness across five critical dimensions: Joint Operations, Economic, Cognitive, Space, and Cyber domains.`,
    
    `Key findings indicate that ${strategicAdvantage > 0 ? 'NATO maintains' : 'Russia holds'} a strategic advantage with a final deterrence differential of ${Math.abs(strategicAdvantage)} points. NATO achieved a total deterrence score of ${finalNATODeterrence}, while Russia achieved ${finalRussiaDeterrence}.`,
    
    `The analysis reveals significant strategic patterns in resource allocation, capability development, and dimensional focus that provide insights into effective deterrence strategies in multi-domain environments.`
  ];
  
  summaryParagraphs.forEach(paragraph => {
    const lines = pdf.splitTextToSize(paragraph, contentWidth);
    lines.forEach((line: string) => {
      checkPage(6);
      pdf.text(line, margin, yPosition);
      yPosition += 5.5;
    });
    yPosition += 4;
  });
  
  addNewPage();
  
  // METHODOLOGY
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Methodology', margin, yPosition);
  yPosition += 12;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Simulation Framework', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const methodologyText = [
    'The MDDS simulation employs a turn-based strategic framework where two opposing forces (NATO and Russia) compete across five dimensions of deterrence. Each turn involves strategic resource allocation, capability acquisition, and tactical decision-making.',
    
    'Key simulation parameters include:',
    '• Turn-based budget allocation system with domain-specific spending requirements',
    '• Dynamic deterrence scoring based on capability portfolios and strategic choices',
    '• Multi-dimensional competition across Joint, Economic, Cognitive, Space, and Cyber domains',
    '• Card-based capability system representing assets, permanent capabilities, and expert advisors'
  ];
  
  methodologyText.forEach(text => {
    if (text.startsWith('•')) {
      pdf.text(text, margin + 5, yPosition);
    } else {
      const lines = pdf.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        checkPage(6);
        pdf.text(line, margin, yPosition);
        yPosition += 5.5;
      });
    }
    yPosition += text.startsWith('•') ? 5 : 4;
  });
  
  addNewPage();
  
  // STRATEGIC OVERVIEW
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategic Overview', margin, yPosition);
  yPosition += 12;
  
  // Current status table
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Current Strategic Position', margin, yPosition);
  yPosition += 10;
  
  // Table headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, yPosition - 2, contentWidth, 8, 'F');
  pdf.text('Metric', margin + 2, yPosition + 3);
  pdf.text('NATO', margin + 60, yPosition + 3);
  pdf.text('Russia', margin + 100, yPosition + 3);
  pdf.text('Advantage', margin + 140, yPosition + 3);
  yPosition += 10;
  
  // Add border lines
  pdf.setLineWidth(0.1);
  pdf.line(margin, yPosition - 12, pageWidth - margin, yPosition - 12);
  pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
  
  // Table data
  pdf.setFont('helvetica', 'normal');
  const overviewMetrics = [
    { name: 'Total Deterrence', nato: finalNATODeterrence, russia: finalRussiaDeterrence },
    { name: 'Budget Remaining', nato: data.natoTeam.budget, russia: data.russiaTeam.budget },
    { name: 'Permanent Assets', nato: data.natoTeam.ownedPermanents.length, russia: data.russiaTeam.ownedPermanents.length }
  ];
  
  overviewMetrics.forEach(metric => {
    const advantage = metric.nato - metric.russia;
    pdf.text(metric.name, margin + 2, yPosition);
    pdf.text(metric.nato.toString(), margin + 60, yPosition);
    pdf.text(metric.russia.toString(), margin + 100, yPosition);
    pdf.text(`${advantage > 0 ? '+' : ''}${advantage}`, margin + 140, yPosition);
    yPosition += 7;
  });
  
  // Add bottom border
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  addNewPage();
  
  // DATA ANALYSIS AND VISUALIZATIONS
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data Analysis and Visualizations', margin, yPosition);
  yPosition += 12;
  
  // Chart sections
  const chartSections = [
    { id: 'deterrence-chart', title: 'Figure 1: Strategic Deterrence Overview', description: 'Comprehensive view of deterrence levels across all dimensions showing current strategic balance.' },
    { id: 'turn-based-logs', title: 'Figure 2: Turn-based Strategic Evolution', description: 'Historical progression of deterrence capabilities demonstrating strategic development patterns.' },
    { id: 'domain-statistics-content', title: 'Figure 3: Dimensional Performance Analysis', description: 'Detailed breakdown of performance metrics across the five strategic dimensions.' },
    { id: 'defense-offense-charts', title: 'Figure 4: Defense-Offense Dynamics', description: 'Analysis of defensive capabilities versus offensive potential across all dimensions.' }
  ];
  
  chartSections.forEach((section, index) => {
    checkPage(100);
    
    // Chart title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.title, margin, yPosition);
    yPosition += 8;
    
    // Chart description
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(section.description, contentWidth);
    descLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
    
    // Add chart image if available
    if (screenshots[section.id]) {
      try {
        const imgWidth = contentWidth;
        const imgHeight = 80; // Larger height for better visibility
        pdf.addImage(screenshots[section.id], 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.warn(`Failed to add chart image ${section.title}:`, error);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[Chart visualization unavailable]', margin, yPosition);
        yPosition += 15;
      }
    } else {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text('[Chart visualization unavailable]', margin, yPosition);
      yPosition += 15;
    }
    
    if (index < chartSections.length - 1) {
      yPosition += 10;
    }
  });
  
  addNewPage();
  
  // DIMENSION-WISE PERFORMANCE ANALYSIS
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dimension-wise Performance Analysis', margin, yPosition);
  yPosition += 12;
  
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
  
  domains.forEach(domain => {
    checkPage(30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const domainTitle = domain.charAt(0).toUpperCase() + domain.slice(1) + ' Dimension';
    pdf.text(domainTitle, margin, yPosition);
    yPosition += 8;
    
    const natoValue = data.natoTeam.deterrence[domain];
    const russiaValue = data.russiaTeam.deterrence[domain];
    const advantage = natoValue - russiaValue;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const analysisText = `Current deterrence levels show NATO at ${natoValue} and Russia at ${russiaValue}, ` +
      `resulting in a ${Math.abs(advantage)}-point ${advantage > 0 ? 'NATO' : 'Russian'} advantage. ` +
      `This represents ${((natoValue / (natoValue + russiaValue)) * 100).toFixed(1)}% NATO control in this dimension.`;
    
    const lines = pdf.splitTextToSize(analysisText, contentWidth);
    lines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 8;
  });
  
  addNewPage();
  
  // TURN-BY-TURN STRATEGIC EVOLUTION
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Turn-by-Turn Strategic Evolution', margin, yPosition);
  yPosition += 12;
  
  data.turnStatistics.forEach((stat, index) => {
    checkPage(35);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${stat.turn} Analysis`, margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Summary statistics
    pdf.text(`Total Deterrence - NATO: ${stat.natoTotalDeterrence}, Russia: ${stat.russiaTotalDeterrence}`, margin + 5, yPosition);
    yPosition += 6;
    
    const turnAdvantage = stat.natoTotalDeterrence - stat.russiaTotalDeterrence;
    pdf.text(`Strategic Balance: ${turnAdvantage > 0 ? 'NATO' : 'Russia'} +${Math.abs(turnAdvantage)}`, margin + 5, yPosition);
    yPosition += 8;
    
    // Domain breakdown
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dimensional Breakdown:', margin + 5, yPosition);
    yPosition += 6;
    
    pdf.setFont('helvetica', 'normal');
    domains.forEach(domain => {
      const natoVal = stat.natoDeterrence[domain];
      const russiaVal = stat.russiaDeterrence[domain];
      pdf.text(`${domain.charAt(0).toUpperCase() + domain.slice(1)}: NATO ${natoVal}, Russia ${russiaVal}`, margin + 10, yPosition);
      yPosition += 5;
    });
    
    yPosition += 8;
  });
  
  addNewPage();
  
  // DEFENSE AND OFFENSE DYNAMICS
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Defense and Offense Dynamics', margin, yPosition);
  yPosition += 12;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Defense represents a team\'s own deterrence capability, while Offense represents', margin, yPosition);
  yPosition += 5;
  pdf.text('their ability to counter opponent deterrence (calculated as 100 - opponent deterrence).', margin, yPosition);
  yPosition += 15;
  
  data.turnStatistics.forEach((stat, index) => {
    checkPage(50);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${stat.turn} - Defense/Offense Analysis`, margin, yPosition);
    yPosition += 8;
    
    // NATO Analysis
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NATO Forces:', margin + 5, yPosition);
    yPosition += 6;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    domains.forEach(domain => {
      const defense = stat.natoDeterrence[domain];
      const offense = 100 - stat.russiaDeterrence[domain];
      pdf.text(`${domain.charAt(0).toUpperCase() + domain.slice(1)}: Defense ${defense}, Offense ${offense}`, margin + 10, yPosition);
      yPosition += 4;
    });
    
    yPosition += 5;
    
    // Russia Analysis
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Russian Forces:', margin + 5, yPosition);
    yPosition += 6;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    domains.forEach(domain => {
      const defense = stat.russiaDeterrence[domain];
      const offense = 100 - stat.natoDeterrence[domain];
      pdf.text(`${domain.charAt(0).toUpperCase() + domain.slice(1)}: Defense ${defense}, Offense ${offense}`, margin + 10, yPosition);
      yPosition += 4;
    });
    
    yPosition += 10;
  });
  
  addNewPage();
  
  // STRATEGIC DECISION LOG
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategic Decision Log', margin, yPosition);
  yPosition += 12;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Chronological record of all strategic decisions and actions taken during the simulation.', margin, yPosition);
  yPosition += 15;
  
  // Group strategy log by turn
  const logByTurn = data.strategyLog.reduce((acc, entry) => {
    if (!acc[entry.turn]) acc[entry.turn] = [];
    acc[entry.turn].push(entry);
    return acc;
  }, {} as Record<number, StrategyLogEntry[]>);
  
  Object.keys(logByTurn).sort((a, b) => parseInt(a) - parseInt(b)).forEach(turn => {
    checkPage(25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Turn ${turn} Strategic Actions`, margin, yPosition);
    yPosition += 8;
    
    logByTurn[parseInt(turn)].forEach(entry => {
      checkPage(8);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const timeStr = new Date(entry.timestamp).toLocaleTimeString();
      const logText = `[${entry.team}] ${timeStr}: ${entry.action}`;
      
      const lines = pdf.splitTextToSize(logText, contentWidth - 10);
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
    });
    
    yPosition += 8;
  });
  
  addNewPage();
  
  // TEAM PERFORMANCE ASSESSMENT
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Team Performance Assessment', margin, yPosition);
  yPosition += 12;
  
  // NATO Assessment
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NATO Performance Analysis', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const natoMetrics = [
    `Final Deterrence Score: ${data.natoTeam.totalDeterrence}`,
    `Budget Utilization: ${((1000 - data.natoTeam.budget) / 1000 * 100).toFixed(1)}%`,
    `Permanent Capabilities Acquired: ${data.natoTeam.ownedPermanents.length}`,
    `Strategic Purchases Made: ${data.natoTeam.recentPurchases.length}`,
    `Items Currently in Cart: ${data.natoTeam.cart.length}`
  ];
  
  natoMetrics.forEach(metric => {
    pdf.text(`• ${metric}`, margin + 5, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Russia Assessment
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Russian Performance Analysis', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const russiaMetrics = [
    `Final Deterrence Score: ${data.russiaTeam.totalDeterrence}`,
    `Budget Utilization: ${((1000 - data.russiaTeam.budget) / 1000 * 100).toFixed(1)}%`,
    `Permanent Capabilities Acquired: ${data.russiaTeam.ownedPermanents.length}`,
    `Strategic Purchases Made: ${data.russiaTeam.recentPurchases.length}`,
    `Items Currently in Cart: ${data.russiaTeam.cart.length}`
  ];
  
  russiaMetrics.forEach(metric => {
    pdf.text(`• ${metric}`, margin + 5, yPosition);
    yPosition += 6;
  });
  
  yPosition += 15;
  
  addNewPage();
  
  // CONCLUSIONS AND RECOMMENDATIONS
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Conclusions and Recommendations', margin, yPosition);
  yPosition += 12;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Findings', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const conclusions = [
    `The simulation demonstrates ${strategicAdvantage > 0 ? 'NATO\'s strategic superiority' : 'Russian strategic advantage'} with a final deterrence differential of ${Math.abs(strategicAdvantage)} points.`,
    
    'Multi-dimensional competition reveals the importance of balanced capability development across all strategic domains.',
    
    'Resource allocation patterns indicate that sustained investment in permanent capabilities provides long-term strategic advantages.',
    
    'Turn-based analysis shows that early strategic decisions have compounding effects on final outcomes.'
  ];
  
  conclusions.forEach(conclusion => {
    const lines = pdf.splitTextToSize(`• ${conclusion}`, contentWidth - 10);
    lines.forEach((line: string, index: number) => {
      checkPage(6);
      pdf.text(index === 0 ? line : `  ${line}`, margin + 5, yPosition);
      yPosition += 5.5;
    });
    yPosition += 3;
  });
  
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategic Recommendations', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const recommendations = [
    'Maintain balanced investment across all five strategic dimensions to prevent capability gaps.',
    
    'Prioritize permanent capability acquisition early in strategic planning cycles for maximum benefit.',
    
    'Monitor opponent strategic patterns and adapt resource allocation accordingly.',
    
    'Conduct regular strategic assessments to evaluate dimensional performance and adjust tactics.'
  ];
  
  recommendations.forEach(recommendation => {
    const lines = pdf.splitTextToSize(`• ${recommendation}`, contentWidth - 10);
    lines.forEach((line: string, index: number) => {
      checkPage(6);
      pdf.text(index === 0 ? line : `  ${line}`, margin + 5, yPosition);
      yPosition += 5.5;
    });
    yPosition += 3;
  });
  
  // Final footer
  addFooter();
  
  // Save the PDF with academic naming
  const sessionNameClean = (data.sessionInfo.sessionName || 'MDDS_Session').replace(/[^a-zA-Z0-9]/g, '_');
  const dateString = new Date().toISOString().split('T')[0];
  pdf.save(`MDDS_Strategic_Analysis_${sessionNameClean}_${dateString}.pdf`);
};