import jsPDF from 'jspdf';

interface GameSession {
  sessionName: string;
  gameState: {
    turn: number;
    maxTurns: number;
    currentTeam: string;
    phase: string;
  };
  sessionInfo: {
    participants?: string[];
  } | null;
  turnStatistics: Array<{
    turn: number;
    natoDeterrence: number;
    russiaDeterrence: number;
  }> | null;
  lastUpdated: string | null;
  createdAt: string;
}

interface DeterrenceScores {
  nato: number;
  russia: number;
}

export const generateSessionReportPDF = async (
  session: GameSession,
  scores: DeterrenceScores,
  winner: string
) => {
  const pdf = new jsPDF();
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = margin;

  // Helper to check if we need a new page
  const checkPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > 280) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MDDS Session Report', margin, yPosition);
  yPosition += 15;

  // Session Name
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(session.sessionName, margin, yPosition);
  yPosition += 12;

  // Generation Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Session Details Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Session Details', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Created: ${new Date(session.createdAt).toLocaleString()}`, margin + 5, yPosition);
  yPosition += 7;

  if (session.lastUpdated) {
    pdf.text(`Last Updated: ${new Date(session.lastUpdated).toLocaleString()}`, margin + 5, yPosition);
    yPosition += 7;
  }

  pdf.text(`Turn Progress: Turn ${session.gameState.turn} of ${session.gameState.maxTurns}`, margin + 5, yPosition);
  yPosition += 7;

  pdf.text(`Current Phase: ${session.gameState.phase}`, margin + 5, yPosition);
  yPosition += 7;

  pdf.text(`Current Team: ${session.gameState.currentTeam}`, margin + 5, yPosition);
  yPosition += 15;

  // Participants Section
  if (session.sessionInfo?.participants && Array.isArray(session.sessionInfo.participants) && session.sessionInfo.participants.length > 0) {
    checkPage(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Participants', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    session.sessionInfo.participants.forEach((participant) => {
      pdf.text(`• ${participant}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Final Deterrence Scores Section
  checkPage(60);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Final Deterrence Scores', margin, yPosition);
  yPosition += 12;

  // Draw score boxes
  const boxWidth = 70;
  const boxHeight = 30;
  const boxSpacing = 10;

  // NATO Box
  pdf.setFillColor(59, 130, 246); // Blue
  pdf.rect(margin + 5, yPosition, boxWidth, boxHeight, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('NATO', margin + 5 + boxWidth/2, yPosition + 10, { align: 'center' });
  
  pdf.setFontSize(20);
  pdf.text(String(scores.nato), margin + 5 + boxWidth/2, yPosition + 23, { align: 'center' });

  // Russia Box
  pdf.setFillColor(239, 68, 68); // Red
  pdf.rect(margin + 5 + boxWidth + boxSpacing, yPosition, boxWidth, boxHeight, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Russia', margin + 5 + boxWidth + boxSpacing + boxWidth/2, yPosition + 10, { align: 'center' });
  
  pdf.setFontSize(20);
  pdf.text(String(scores.russia), margin + 5 + boxWidth + boxSpacing + boxWidth/2, yPosition + 23, { align: 'center' });

  yPosition += boxHeight + 15;

  // Winner Section
  checkPage(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  
  if (winner === 'Tie') {
    pdf.text('Result: Tie', margin, yPosition);
  } else {
    pdf.text(`Winner: ${winner}`, margin, yPosition);
  }
  yPosition += 20;

  // Turn Statistics Section (if available)
  if (session.turnStatistics && Array.isArray(session.turnStatistics) && session.turnStatistics.length > 0) {
    checkPage(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Turn Statistics', margin, yPosition);
    yPosition += 10;

    // Only draw chart if we have 2+ data points
    if (session.turnStatistics.length < 2) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Turn 1:', margin + 5, yPosition);
      pdf.text(`NATO: ${session.turnStatistics[0].natoDeterrence}`, margin + 10, yPosition + 7);
      pdf.text(`Russia: ${session.turnStatistics[0].russiaDeterrence}`, margin + 10, yPosition + 14);
      yPosition += 25;
    } else {
      // Draw simple chart
      const chartHeight = 60;
      const chartWidth = pageWidth - 2 * margin;
      const maxScore = Math.max(...session.turnStatistics.flatMap(s => [s.natoDeterrence, s.russiaDeterrence]), 1);
      const minScore = Math.min(...session.turnStatistics.flatMap(s => [s.natoDeterrence, s.russiaDeterrence]), 0);
      const scoreRange = Math.max(maxScore - minScore, 1);

      // Draw chart border
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, chartWidth, chartHeight);

      // Draw grid lines
      pdf.setDrawColor(220, 220, 220);
      for (let i = 0; i <= 4; i++) {
        const gridY = yPosition + (i * chartHeight / 4);
        pdf.line(margin, gridY, margin + chartWidth, gridY);
        
        // Y-axis labels
        const value = Math.round(maxScore - (i * scoreRange / 4));
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(String(value), margin - 5, gridY + 2, { align: 'right' });
      }

      // Draw NATO line
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(1.5);
      for (let i = 0; i < session.turnStatistics.length - 1; i++) {
        const x1 = margin + (i * chartWidth / (session.turnStatistics.length - 1));
        const y1 = yPosition + chartHeight - ((session.turnStatistics[i].natoDeterrence - minScore) / scoreRange * chartHeight);
        const x2 = margin + ((i + 1) * chartWidth / (session.turnStatistics.length - 1));
        const y2 = yPosition + chartHeight - ((session.turnStatistics[i + 1].natoDeterrence - minScore) / scoreRange * chartHeight);
        pdf.line(x1, y1, x2, y2);
      }

      // Draw Russia line
      pdf.setDrawColor(239, 68, 68);
      pdf.setLineWidth(1.5);
      for (let i = 0; i < session.turnStatistics.length - 1; i++) {
        const x1 = margin + (i * chartWidth / (session.turnStatistics.length - 1));
        const y1 = yPosition + chartHeight - ((session.turnStatistics[i].russiaDeterrence - minScore) / scoreRange * chartHeight);
        const x2 = margin + ((i + 1) * chartWidth / (session.turnStatistics.length - 1));
        const y2 = yPosition + chartHeight - ((session.turnStatistics[i + 1].russiaDeterrence - minScore) / scoreRange * chartHeight);
        pdf.line(x1, y1, x2, y2);
      }

      // Draw data points
      session.turnStatistics.forEach((stat, index) => {
        const x = margin + (index * chartWidth / (session.turnStatistics.length - 1));
        
        // NATO point
        const natoY = yPosition + chartHeight - ((stat.natoDeterrence - minScore) / scoreRange * chartHeight);
        pdf.setFillColor(59, 130, 246);
        pdf.circle(x, natoY, 1.5, 'F');
        
        // Russia point
        const russiaY = yPosition + chartHeight - ((stat.russiaDeterrence - minScore) / scoreRange * chartHeight);
        pdf.setFillColor(239, 68, 68);
        pdf.circle(x, russiaY, 1.5, 'F');

        // X-axis labels
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`T${stat.turn}`, x, yPosition + chartHeight + 8, { align: 'center' });
      });

      // Legend
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(59, 130, 246);
      pdf.rect(margin, yPosition - 12, 8, 4, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.text('NATO', margin + 10, yPosition - 9);

      pdf.setFillColor(239, 68, 68);
      pdf.rect(margin + 40, yPosition - 12, 8, 4, 'F');
      pdf.text('Russia', margin + 50, yPosition - 9);

      yPosition += chartHeight + 15;
    }
  }

  // Footer
  const sessionNameClean = session.sessionName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateString = new Date().toISOString().split('T')[0];
  
  // Save the PDF
  pdf.save(`MDDS_Session_Report_${sessionNameClean}_${dateString}.pdf`);
};
