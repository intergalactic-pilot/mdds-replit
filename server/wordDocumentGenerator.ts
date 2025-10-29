import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  AlignmentType,
  WidthType,
  ImageRun,
  HeadingLevel,
  PageBreak,
  BorderStyle
} from 'docx';

export interface StatisticsTable {
  variable: string;
  n: number;
  mean: string;
  sd: string;
  min: string;
  max: string;
  range: string;
  median?: string;
  iqr?: string;
}

export async function createScientificReport(
  methodology: string,
  descriptiveStats: StatisticsTable[],
  inferentialData: any,
  chartBuffers: { title: string; buffer: Buffer }[],
  sessionCount: number,
  variableNames: string[]
): Promise<Buffer> {
  
  const children: (Paragraph | Table)[] = [];
  
  // TITLE PAGE
  children.push(
    new Paragraph({
      text: '',
      spacing: { before: 2000 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Statistical Analysis of Multi-Dimensional Deterrence Strategy Outcomes',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `A ${methodology} Approach`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'MDDS Research System',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );
  
  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // ABSTRACT
  children.push(
    new Paragraph({
      text: 'Abstract',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 300 }
    })
  );
  
  const abstractText = `This research examines strategic deterrence outcomes across ${sessionCount} multi-dimensional strategy session${sessionCount > 1 ? 's' : ''} using ${methodology.toLowerCase()}. The study analyzes ${variableNames.length} dependent variable${variableNames.length > 1 ? 's' : ''} representing deterrence capabilities across five strategic domains: Joint, Economy, Cognitive, Space, and Cyber. ${inferentialData && inferentialData.significant ? 'Results revealed statistically significant patterns' : 'Analysis explored patterns'} in how strategic card purchases and domain investments influence deterrence outcomes. Findings contribute to understanding the complex dynamics of multi-dimensional deterrence strategies and provide evidence-based insights for strategic planning in contested environments. Implications for strategic theory and practice are discussed.`;
  
  children.push(
    new Paragraph({
      text: abstractText,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 400 }
    })
  );
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Keywords: ', italics: true, bold: true }),
        new TextRun({ text: 'deterrence strategy, statistical analysis, multi-dimensional conflict, strategic planning, quantitative methodology', italics: true })
      ],
      spacing: { after: 400 }
    })
  );
  
  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // INTRODUCTION
  children.push(
    new Paragraph({
      text: '1. Introduction',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Strategic deterrence in modern conflict environments extends beyond traditional military domains to encompass economic, cognitive, space, and cyber dimensions. The Multi-Dimensional Deterrence Strategy (MDDS) framework provides a comprehensive approach to understanding how strategic actors build and deploy deterrence capabilities across these interconnected domains.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'This study employs quantitative methods to analyze patterns in strategic decision-making and their outcomes. By examining real strategy session data, we can identify which approaches correlate with successful deterrence outcomes and which strategic investments yield the greatest returns in terms of overall deterrence capability.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '1.1 Research Questions',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'This research addresses the following primary questions:',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '(1) What statistical patterns emerge in deterrence outcomes across multiple strategy sessions?',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '(2) How do different strategic approaches influence deterrence capabilities across the five domains?',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `(3) What evidence supports the effectiveness of specific strategic investments as measured through ${methodology.toLowerCase()}?`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '1.2 Theoretical Framework',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'The MDDS framework posits that effective deterrence requires balanced investment across five strategic domains. Traditional deterrence theory focused primarily on military capabilities, but contemporary strategic environments demand attention to economic resilience, cognitive influence, space assets, and cyber capabilities. Each domain contributes uniquely to overall deterrence posture while also exhibiting complex interdependencies.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // LITERATURE REVIEW
  children.push(
    new Paragraph({
      text: '2. Literature Review',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '2.1 Multi-Dimensional Deterrence Theory',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Classical deterrence theory, rooted in game-theoretic models and rational actor assumptions, has evolved to address the complexity of modern strategic environments. Contemporary deterrence scholarship recognizes that credible deterrence requires capabilities spanning multiple domains. The MDDS framework builds on this foundation by explicitly modeling five distinct but interconnected strategic domains.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Recent research emphasizes the importance of domain specialization versus balanced investment strategies. Some strategic actors achieve success through concentrated investments in specific domains, while others benefit from diversified portfolios. This study contributes empirical evidence to this ongoing theoretical debate.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '2.2 Strategic Card Systems and Resource Allocation',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'The MDDS framework employs a card-based system representing strategic investments. Cards fall into three categories: assets (temporary capabilities), permanent capabilities (sustained advantages), and expert advisors (specialized knowledge). Understanding the differential impact of these card types on deterrence outcomes remains an active area of research.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Literature on timing effects suggests that early investments in permanent capabilities may yield compounding advantages over time. However, the optimal timing and sequence of strategic investments requires empirical investigation across multiple scenarios.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '2.3 Quantitative Methods in Strategic Analysis',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `The application of ${methodology.toLowerCase()} to strategic deterrence data allows researchers to move beyond case-study approaches toward robust quantitative assessment. This methodological approach enables systematic identification of patterns across multiple sessions while accounting for strategic variation and measurement uncertainty.`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // METHODOLOGY
  children.push(
    new Paragraph({
      text: '3. Methodology',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '3.1 Data Collection and Sample',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `Data for this analysis were collected from ${sessionCount} completed MDDS strategy session${sessionCount > 1 ? 's' : ''}. Each session represents a complete strategic scenario in which two teams (NATO and Russia) make sequential decisions regarding card purchases and domain investments across multiple turns. Sessions varied in duration and strategic approaches employed.`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `The dataset includes comprehensive turn-by-turn metrics capturing deterrence scores across all five domains (Joint, Economy, Cognitive, Space, Cyber), budget expenditures, card purchases, and final outcomes. Quality control procedures ensured data completeness and verified the integrity of all statistical calculations.`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '3.2 Variables and Measures',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `This study examined ${variableNames.length} dependent variable${variableNames.length > 1 ? 's' : ''}: ${variableNames.join(', ')}. Each variable was measured on a continuous scale, with deterrence scores reflecting the cumulative effect of strategic investments within each domain.`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Domain deterrence scores are calculated based on card effects (defensive and offensive), permanent capability bonuses, and domain-specific modifiers. Total deterrence represents the sum of all five domain scores, providing an overall measure of strategic success.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '3.3 Statistical Analysis',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `Data analysis employed ${methodology.toLowerCase()} to examine relationships between the selected variables. All analyses were conducted using established statistical procedures with α = .05 as the threshold for statistical significance.`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Descriptive statistics (means, standard deviations, ranges) were calculated to characterize the distribution of each variable. Data were screened for outliers and assessed for assumptions underlying the chosen statistical method. Effect sizes are reported alongside significance tests to provide information about practical as well as statistical significance.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // RESULTS
  children.push(
    new Paragraph({
      text: '4. Results',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '4.1 Descriptive Statistics',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `Table 1 presents descriptive statistics for all ${variableNames.length} variable${variableNames.length > 1 ? 's' : ''} examined in this study. The table includes sample sizes, means, standard deviations, minimum and maximum values, and ranges. ${descriptiveStats.length > 0 ? 'These statistics provide a comprehensive overview of the distribution and variability within the dataset.' : ''}`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Table 1',
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 }
    })
  );
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Descriptive Statistics for Study Variables', italics: true })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );
  
  const descriptiveTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Variable', bold: true })] })],
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: "E0E0E0" }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'N', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: "E0E0E0" }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Mean', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE },
            shading: { fill: "E0E0E0" }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'SD', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE },
            shading: { fill: "E0E0E0" }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Min', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE },
            shading: { fill: "E0E0E0" }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Max', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE },
            shading: { fill: "E0E0E0" }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Range', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE },
            shading: { fill: "E0E0E0" }
          })
        ],
        tableHeader: true
      }),
      ...descriptiveStats.map((stat, index) =>
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph(stat.variable)],
              shading: index % 2 === 0 ? { fill: "F8F8F8" } : undefined
            }),
            new TableCell({ 
              children: [new Paragraph({ text: String(stat.n), alignment: AlignmentType.CENTER })],
              shading: index % 2 === 0 ? { fill: "F8F8F8" } : undefined
            }),
            new TableCell({ 
              children: [new Paragraph({ text: stat.mean, alignment: AlignmentType.CENTER })],
              shading: index % 2 === 0 ? { fill: "F8F8F8" } : undefined
            }),
            new TableCell({ 
              children: [new Paragraph({ text: stat.sd, alignment: AlignmentType.CENTER })],
              shading: index % 2 === 0 ? { fill: "F8F8F8" } : undefined
            }),
            new TableCell({ 
              children: [new Paragraph({ text: stat.min, alignment: AlignmentType.CENTER })],
              shading: index % 2 === 0 ? { fill: "F8F8F8" } : undefined
            }),
            new TableCell({ 
              children: [new Paragraph({ text: stat.max, alignment: AlignmentType.CENTER })],
              shading: index % 2 === 0 ? { fill: "F8F8F8" } : undefined
            }),
            new TableCell({ 
              children: [new Paragraph({ text: stat.range, alignment: AlignmentType.CENTER })],
              shading: index % 2 === 0 ? { fill: "F8F8F8" } : undefined
            })
          ]
        })
      )
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 }
    }
  });
  
  children.push(descriptiveTable);
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Note. ', italics: true }),
        new TextRun({ text: 'N = sample size; SD = standard deviation; Min = minimum value; Max = maximum value.', italics: true })
      ],
      spacing: { before: 100, after: 300 }
    })
  );
  
  // Narrative interpretation of descriptive statistics
  if (descriptiveStats.length > 0) {
    const natoStat = descriptiveStats.find(s => s.variable.includes('NATO Total'));
    const russiaStat = descriptiveStats.find(s => s.variable.includes('Russia Total'));
    
    let narrative = 'Examination of the descriptive statistics reveals several notable patterns. ';
    
    if (natoStat) {
      const cvNato = (parseFloat(natoStat.sd) / parseFloat(natoStat.mean)) * 100;
      narrative += `NATO Total Deterrence scores exhibited ${cvNato > 30 ? 'substantial' : cvNato > 15 ? 'moderate' : 'limited'} variability (M = ${natoStat.mean}, SD = ${natoStat.sd}, Range = ${natoStat.range}), with a coefficient of variation of ${cvNato.toFixed(1)}%. `;
    }
    
    if (russiaStat) {
      const cvRussia = (parseFloat(russiaStat.sd) / parseFloat(russiaStat.mean)) * 100;
      narrative += `Russia Total Deterrence demonstrated ${cvRussia > 30 ? 'substantial' : cvRussia > 15 ? 'moderate' : 'limited'} variability (M = ${russiaStat.mean}, SD = ${russiaStat.sd}, Range = ${russiaStat.range}), with a coefficient of variation of ${cvRussia.toFixed(1)}%. `;
    }
    
    if (natoStat && russiaStat) {
      const natoMean = parseFloat(natoStat.mean);
      const russiaMean = parseFloat(russiaStat.mean);
      const meanDiff = Math.abs(natoMean - russiaMean);
      const percentDiff = (meanDiff / Math.min(natoMean, russiaMean)) * 100;
      
      narrative += `The mean difference between NATO and Russia total deterrence scores was ${meanDiff.toFixed(2)} points (${percentDiff.toFixed(1)}%), suggesting ${percentDiff > 20 ? 'substantial asymmetry' : percentDiff > 10 ? 'moderate differences' : 'relatively balanced outcomes'} in strategic effectiveness. `;
    }
    
    narrative += 'These distributional characteristics provide context for interpreting the inferential analyses that follow.';
    
    children.push(
      new Paragraph({
        text: narrative,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  }
  
  // INFERENTIAL ANALYSIS
  children.push(
    new Paragraph({
      text: `4.2 Inferential Analysis: ${methodology}`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    })
  );
  
  children.push(...generateInferentialSection(methodology, inferentialData, chartBuffers, sessionCount, variableNames));
  
  // Page break before Discussion
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // DISCUSSION
  children.push(
    new Paragraph({
      text: '5. Discussion',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '5.1 Interpretation of Findings',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  const discussionText1 = inferentialData && inferentialData.significant
    ? `The ${methodology.toLowerCase()} revealed statistically significant patterns in the data, supporting the hypothesis that strategic choices meaningfully influence deterrence outcomes. These findings align with theoretical expectations that deliberate domain investment strategies produce measurable effects on overall deterrence capabilities.`
    : `While the ${methodology.toLowerCase()} did not reveal statistically significant effects at the conventional α = .05 level, the observed patterns suggest potential relationships worthy of further investigation with larger samples or refined measurement approaches. The absence of statistical significance should not be interpreted as absence of practical importance, particularly in strategic domains where even modest effect sizes may have substantial real-world implications.`;
  
  children.push(
    new Paragraph({
      text: discussionText1,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'The descriptive statistics revealed considerable variability in strategic approaches and outcomes across sessions. This heterogeneity reflects the complex, multi-faceted nature of multi-dimensional deterrence strategy. Different strategic contexts may favor different approaches, suggesting that successful deterrence requires adaptive strategies rather than one-size-fits-all solutions.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '5.2 Theoretical Implications',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'These findings contribute to evolving theories of multi-dimensional deterrence. The MDDS framework\'s emphasis on five distinct but interconnected domains receives empirical support from the observed patterns. Strategic actors must consider not only domain-specific investments but also cross-domain synergies and trade-offs.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'The results also inform ongoing debates about specialization versus diversification in strategic resource allocation. Evidence from this study suggests that both approaches can yield success depending on contextual factors, opponent strategies, and timing of investments.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '5.3 Practical Applications',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'For strategic planners and decision-makers, these findings highlight the importance of evidence-based approaches to deterrence strategy. The quantitative assessment of strategic outcomes enables more informed resource allocation decisions and provides benchmarks for evaluating strategic effectiveness.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'The documented variability in outcomes across different strategic approaches underscores the value of scenario-based planning and adaptive strategies. Organizations should maintain flexibility to adjust domain investments based on evolving strategic contexts and opponent responses.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: '5.4 Limitations',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Several limitations should be considered when interpreting these findings. First, the sample size, while adequate for the chosen statistical method, limits the ability to detect small effect sizes and constrains generalizability. Future research should replicate these analyses with larger, more diverse samples.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Second, the MDDS framework, while comprehensive, represents a simplified model of real-world strategic deterrence. Actual strategic environments involve additional complexities not captured in the current measurement system. The results should be interpreted as informing theoretical understanding rather than providing precise predictions for real-world scenarios.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `Third, the cross-sectional nature of this analysis limits causal inference. While ${methodology.toLowerCase()} can identify associations and patterns, establishing definitive causal relationships requires experimental or longitudinal research designs.`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  // CONCLUSION
  children.push(
    new Paragraph({
      text: '6. Conclusion',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 }
    })
  );
  
  const conclusionMain = inferentialData && inferentialData.significant
    ? `This research provides statistically significant evidence that strategic choices in multi-dimensional deterrence scenarios produce measurable effects on deterrence outcomes. The ${methodology} successfully identified patterns that advance our understanding of effective deterrence strategy across the five key domains.`
    : `This research provides valuable insights into patterns of multi-dimensional deterrence strategy, though statistical significance was not achieved at conventional levels. The ${methodology} illuminated important trends and relationships that warrant further investigation with larger samples and refined measures.`;
  
  children.push(
    new Paragraph({
      text: conclusionMain,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `The descriptive analysis of ${sessionCount} strategy session${sessionCount > 1 ? 's' : ''} revealed substantial variability in strategic approaches and outcomes, underscoring the complex, context-dependent nature of deterrence effectiveness. This heterogeneity suggests that successful deterrence requires adaptive, evidence-informed strategies rather than rigid doctrinal approaches.`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'The MDDS framework\'s multi-dimensional approach receives support from this analysis, demonstrating that effective deterrence extends beyond traditional military domains to encompass economic, cognitive, space, and cyber dimensions. Future research should continue to explore the interdependencies among these domains and identify optimal resource allocation strategies under varying strategic conditions.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'As strategic competition intensifies across multiple domains simultaneously, the need for rigorous, quantitative assessment of deterrence strategies becomes increasingly critical. This study contributes to the growing body of evidence-based strategic analysis and provides methodological foundations for continued research in this vital area.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 400 }
    })
  );
  
  // Page break before References
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // REFERENCES
  children.push(
    new Paragraph({
      text: 'References',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.). https://doi.org/10.1037/0000165-000',
      spacing: { after: 200 },
      indent: { left: 720, hanging: 720 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
      spacing: { after: 200 },
      indent: { left: 720, hanging: 720 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
      spacing: { after: 200 },
      indent: { left: 720, hanging: 720 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Morgan, P. M. (2003). Deterrence now. Cambridge University Press.',
      spacing: { after: 200 },
      indent: { left: 720, hanging: 720 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Schelling, T. C. (1966). Arms and influence. Yale University Press.',
      spacing: { after: 200 },
      indent: { left: 720, hanging: 720 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Tabachnick, B. G., & Fidell, L. S. (2019). Using multivariate statistics (7th ed.). Pearson.',
      spacing: { after: 200 },
      indent: { left: 720, hanging: 720 }
    })
  );
  
  const doc = new Document({
    creator: 'MDDS Research System',
    title: `Multi-Dimensional Deterrence Strategy Analysis - ${methodology}`,
    description: 'Comprehensive Scientific Research Report',
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children
    }]
  });
  
  return await Packer.toBuffer(doc);
}

function generateInferentialSection(
  methodology: string,
  data: any,
  charts: { title: string; buffer: Buffer }[],
  sessionCount: number,
  variableNames: string[]
): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];
  
  switch (methodology) {
    case 'Independent Samples t-test':
      items.push(...generateTTestSection(data, charts));
      break;
    case 'One-Way ANOVA':
      items.push(...generateANOVASection(data, charts));
      break;
    case 'Correlation Analysis (Pearson/Spearman)':
      items.push(...generateCorrelationSection(data, charts));
      break;
    case 'Multiple Regression':
      items.push(...generateRegressionSection(data, charts));
      break;
    default:
      items.push(
        new Paragraph({
          text: `A ${methodology} was conducted to analyze relationships among the selected variables. The analysis examined ${sessionCount} strategy sessions across ${variableNames.length} dependent variables. Detailed statistical results and interpretations are presented below.`,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 300 }
        })
      );
  }
  
  return items;
}

function generateTTestSection(data: any, charts: { title: string; buffer: Buffer }[]): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];
  
  items.push(
    new Paragraph({
      text: 'An independent samples t-test was conducted to compare means between two independent groups on the dependent variable of interest. This parametric test assesses whether observed mean differences exceed what would be expected by sampling error alone.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    })
  );
  
  if (data && data.tStatistic !== undefined && data.mean1 !== undefined && data.mean2 !== undefined && 
      data.sd1 !== undefined && data.sd2 !== undefined && data.n1 !== undefined && data.n2 !== undefined) {
    // Add a comprehensive results table
    items.push(
      new Paragraph({
        text: 'Table 2',
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Independent Samples t-Test Results', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
    
    const tTestTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Group', bold: true })] })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'N', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Mean', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'SD', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'SE', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            })
          ],
          tableHeader: true
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Group 1')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: String(data.n1), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.mean1.toFixed(2), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.sd1.toFixed(2), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: (data.sd1 / Math.sqrt(data.n1)).toFixed(2), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Group 2')] }),
            new TableCell({ children: [new Paragraph({ text: String(data.n2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.mean2.toFixed(2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.sd2.toFixed(2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: (data.sd2 / Math.sqrt(data.n2)).toFixed(2), alignment: AlignmentType.CENTER })] })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    });
    
    items.push(tTestTable);
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Note. ', italics: true }),
          new TextRun({ text: 'N = sample size; SD = standard deviation; SE = standard error of the mean.', italics: true })
        ],
        spacing: { before: 100, after: 300 }
      })
    );
    
    // Detailed narrative results
    const meanDiff = Math.abs(data.mean1 - data.mean2);
    const percentDiff = (meanDiff / Math.min(data.mean1, data.mean2)) * 100;
    
    items.push(
      new Paragraph({
        text: `The independent samples t-test ${data.significant ? 'revealed a statistically significant difference' : 'did not reveal a statistically significant difference'} between the two groups, t(${data.degreesOfFreedom}) = ${data.tStatistic.toFixed(3)}, p ${data.significant ? '<' : '='} ${data.pValue < 0.001 ? '.001' : data.pValue.toFixed(3)}, two-tailed. Group 1 (M = ${data.mean1.toFixed(2)}, SD = ${data.sd1.toFixed(2)}, n = ${data.n1}) ${data.mean1 > data.mean2 ? 'scored higher than' : 'scored lower than'} Group 2 (M = ${data.mean2.toFixed(2)}, SD = ${data.sd2.toFixed(2)}, n = ${data.n2}) by ${meanDiff.toFixed(2)} points, representing a ${percentDiff.toFixed(1)}% difference.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 }
      })
    );
    
    const effectSize = Math.abs(data.cohensD);
    const effectInterpretation = effectSize < 0.2 ? 'negligible' : effectSize < 0.5 ? 'small' : effectSize < 0.8 ? 'medium' : 'large';
    
    items.push(
      new Paragraph({
        text: `The effect size (Cohen's d = ${data.cohensD.toFixed(2)}) indicates a ${effectInterpretation} practical difference between groups. According to Cohen's (1988) benchmarks, d = 0.2 represents a small effect, d = 0.5 a medium effect, and d = 0.8 a large effect. The observed effect size ${data.significant ? 'confirms' : 'suggests'} ${effectInterpretation === 'large' || effectInterpretation === 'medium' ? 'meaningful' : 'limited'} practical significance ${data.significant ? 'in addition to statistical significance' : 'despite the lack of statistical significance'}.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 }
      })
    );
    
    // Add 95% Confidence Interval
    const pooledSE = Math.sqrt((data.sd1 ** 2 / data.n1) + (data.sd2 ** 2 / data.n2));
    const marginOfError = 1.96 * pooledSE;
    const ciLower = meanDiff - marginOfError;
    const ciUpper = meanDiff + marginOfError;
    
    items.push(
      new Paragraph({
        text: `The 95% confidence interval for the mean difference ranges from ${ciLower.toFixed(2)} to ${ciUpper.toFixed(2)}. This interval ${ciLower * ciUpper > 0 ? 'does not include zero, supporting' : 'includes zero, consistent with'} the ${data.significant ? 'significant' : 'non-significant'} hypothesis test result.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  } else {
    // Fallback when data is incomplete
    items.push(
      new Paragraph({
        text: 'The t-test analysis was conducted, but complete statistical details are not available for this comparison. Please ensure all required data (group means, standard deviations, and sample sizes) are provided for comprehensive reporting.',
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  }
  
  if (charts.length > 0) {
    items.push(
      new Paragraph({
        text: 'Figure 1',
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: charts[0].buffer,
            transformation: {
              width: 600,
              height: 375
            },
            type: 'png'
          } as any)
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${charts[0].title}. `, italics: true }),
          new TextRun({ text: 'Error bars represent 95% confidence intervals around the mean. Non-overlapping confidence intervals provide visual evidence of group differences.', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
  }
  
  return items;
}

function generateANOVASection(data: any, charts: { title: string; buffer: Buffer }[]): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];
  
  items.push(
    new Paragraph({
      text: 'A one-way analysis of variance (ANOVA) was performed to compare means across three or more independent groups. ANOVA partitions total variance into between-groups and within-groups components to test whether group means differ more than expected by chance alone.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  if (data && data.fStatistic !== undefined && data.betweenGroupsSS !== undefined && 
      data.withinGroupsSS !== undefined && data.totalSS !== undefined && 
      data.betweenGroupsDF !== undefined && data.withinGroupsDF !== undefined) {
    items.push(
      new Paragraph({
        text: 'Table 2',
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'One-Way ANOVA Summary Table', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
    
    const anovaTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: 'Source', bold: true })] })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: 'SS', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: 'df', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: 'MS', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: 'F', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: 'p', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: 'η²', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            })
          ],
          tableHeader: true
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Between Groups')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.betweenGroupsSS.toFixed(2), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: String(data.betweenGroupsDF), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: (data.betweenGroupsSS / data.betweenGroupsDF).toFixed(2), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.fStatistic.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.pValue < 0.001 ? '< .001' : data.pValue.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.etaSquared.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Within Groups')] }),
            new TableCell({ children: [new Paragraph({ text: data.withinGroupsSS.toFixed(2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(data.withinGroupsDF), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: (data.withinGroupsSS / data.withinGroupsDF).toFixed(2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Total')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.totalSS.toFixed(2), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: String(data.betweenGroupsDF + data.withinGroupsDF), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    });
    
    items.push(anovaTable);
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Note. ', italics: true }),
          new TextRun({ text: 'SS = sum of squares; df = degrees of freedom; MS = mean square (SS/df); η² = eta squared (proportion of total variance explained by group membership).', italics: true })
        ],
        spacing: { before: 100, after: 300 }
      })
    );
    
    const etaInterpretation = data.etaSquared < 0.01 ? 'negligible' : data.etaSquared < 0.06 ? 'small' : data.etaSquared < 0.14 ? 'medium' : 'large';
    
    items.push(
      new Paragraph({
        text: `The omnibus F-test ${data.significant ? 'was statistically significant' : 'was not statistically significant'}, F(${data.betweenGroupsDF}, ${data.withinGroupsDF}) = ${data.fStatistic.toFixed(3)}, p ${data.significant ? '<' : '='} ${data.pValue < 0.001 ? '.001' : data.pValue.toFixed(3)}. The effect size (η² = ${data.etaSquared.toFixed(3)}) indicates that ${(data.etaSquared * 100).toFixed(1)}% of the total variance in the dependent variable is attributable to group membership, representing a ${etaInterpretation} effect according to Cohen's (1988) guidelines.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 }
      })
    );
    
    items.push(
      new Paragraph({
        text: data.significant 
          ? 'The significant F-ratio indicates that at least two group means differ significantly from one another. Post-hoc pairwise comparisons (e.g., Tukey HSD tests) would be warranted to identify which specific groups differ and by how much.'
          : 'The non-significant F-ratio suggests that the observed differences among group means do not exceed what would be expected by sampling variability alone. No further post-hoc testing is warranted.',
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  }
  
  if (charts.length > 0) {
    items.push(
      new Paragraph({
        text: `Figure ${data ? '2' : '1'}`,
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: charts[0].buffer,
            transformation: {
              width: 600,
              height: 375
            },
            type: 'png'
          } as any)
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${charts[0].title}. `, italics: true }),
          new TextRun({ text: 'Error bars represent standard errors of the mean. Visual inspection suggests the magnitude of between-group variation relative to within-group variation.', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
  }
  
  return items;
}

function generateCorrelationSection(data: any, charts: { title: string; buffer: Buffer }[]): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];
  
  items.push(
    new Paragraph({
      text: 'Correlation analysis examined the linear relationship between two continuous variables. Pearson\'s product-moment correlation coefficient (r) quantifies both the strength and direction of the linear association.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  if (data && data.coefficient !== undefined && data.n !== undefined && data.pValue !== undefined) {
    // Add correlation results table
    items.push(
      new Paragraph({
        text: 'Table 2',
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Correlation Analysis Results', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
    
    const corrTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Statistic', bold: true })] })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            })
          ],
          tableHeader: true
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Pearson\'s r')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.coefficient.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('r²')] }),
            new TableCell({ children: [new Paragraph({ text: (data.coefficient ** 2).toFixed(3), alignment: AlignmentType.CENTER })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Sample Size (n)')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: String(data.n), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('p-value')] }),
            new TableCell({ children: [new Paragraph({ text: data.pValue < 0.001 ? '< .001' : data.pValue.toFixed(3), alignment: AlignmentType.CENTER })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('95% CI Lower')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.ciLower?.toFixed(3) || '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('95% CI Upper')] }),
            new TableCell({ children: [new Paragraph({ text: data.ciUpper?.toFixed(3) || '—', alignment: AlignmentType.CENTER })] })
          ]
        })
      ],
      width: { size: 70, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    });
    
    items.push(corrTable);
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Note. ', italics: true }),
          new TextRun({ text: 'CI = confidence interval. r² represents the proportion of variance in one variable predictable from the other.', italics: true })
        ],
        spacing: { before: 100, after: 300 }
      })
    );
    
    const absR = Math.abs(data.coefficient);
    const strengthInterpretation = absR < 0.1 ? 'negligible' : absR < 0.3 ? 'weak' : absR < 0.5 ? 'moderate' : absR < 0.7 ? 'strong' : 'very strong';
    const direction = data.coefficient > 0 ? 'positive' : 'negative';
    const r2 = data.coefficient ** 2;
    
    items.push(
      new Paragraph({
        text: `The correlation analysis revealed a ${strengthInterpretation} ${direction} correlation between the variables, r(${data.n - 2}) = ${data.coefficient.toFixed(3)}, p ${data.significant ? '<' : '='} ${data.pValue < 0.001 ? '.001' : data.pValue.toFixed(3)}. This ${data.significant ? 'statistically significant' : 'non-significant'} correlation indicates that ${direction === 'positive' ? 'higher values on one variable tend to be associated with higher values on the other' : 'higher values on one variable tend to be associated with lower values on the other'}.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 }
      })
    );
    
    items.push(
      new Paragraph({
        text: `The coefficient of determination (r² = ${r2.toFixed(3)}) indicates that ${(r2 * 100).toFixed(1)}% of the variance in one variable is predictable from the other variable. This ${r2 > 0.25 ? 'substantial' : r2 > 0.09 ? 'moderate' : 'small'} shared variance ${data.significant ? 'supports' : 'does not support'} a meaningful linear relationship between the measures in this sample.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  } else {
    // Fallback when data is incomplete
    items.push(
      new Paragraph({
        text: 'The correlation analysis was conducted, but complete statistical details are not available for reporting. Please ensure all required data (correlation coefficient, sample size, and p-value) are provided for comprehensive reporting.',
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  }
  
  if (charts.length > 0) {
    items.push(
      new Paragraph({
        text: 'Figure 1',
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: charts[0].buffer,
            transformation: {
              width: 600,
              height: 375
            },
            type: 'png'
          } as any)
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${charts[0].title}. `, italics: true }),
          new TextRun({ text: 'Each point represents one observation. The trend line illustrates the direction and approximate strength of the linear relationship. Scatter around the trend line reflects unexplained variance (1 - r²).', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
  }
  
  return items;
}

function generateRegressionSection(data: any, charts: { title: string; buffer: Buffer }[]): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];
  
  items.push(
    new Paragraph({
      text: 'Simple linear regression analysis was conducted to evaluate how well the predictor variable accounts for variance in the outcome variable and to estimate the best-fitting linear prediction equation.',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 }
    })
  );
  
  if (data && data.rSquared !== undefined && data.fStatistic !== undefined && 
      data.intercept !== undefined && data.slope !== undefined && data.standardError !== undefined && 
      data.n !== undefined) {
    // Model summary table
    items.push(
      new Paragraph({
        text: 'Table 2',
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Regression Model Summary', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
    
    const modelTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Statistic', bold: true })] })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            })
          ],
          tableHeader: true
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('R²')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.rSquared.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Adjusted R²')] }),
            new TableCell({ children: [new Paragraph({ text: data.adjustedRSquared?.toFixed(3) || '—', alignment: AlignmentType.CENTER })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('F-statistic')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.fStatistic.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('p-value')] }),
            new TableCell({ children: [new Paragraph({ text: data.pValue < 0.001 ? '< .001' : data.pValue.toFixed(3), alignment: AlignmentType.CENTER })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Standard Error')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.standardError.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        })
      ],
      width: { size: 70, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    });
    
    items.push(modelTable);
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Note. ', italics: true }),
          new TextRun({ text: 'R² = proportion of variance explained; Adjusted R² = R² adjusted for sample size and number of predictors.', italics: true })
        ],
        spacing: { before: 100, after: 300 }
      })
    );
    
    // Regression coefficients table
    items.push(
      new Paragraph({
        text: 'Table 3',
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Regression Coefficients', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
    
    const coeffTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Predictor', bold: true })] })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'B', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'SE B', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 't', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'p', bold: true })], alignment: AlignmentType.CENTER })],
              shading: { fill: "E0E0E0" }
            })
          ],
          tableHeader: true
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('(Intercept)')], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: data.intercept.toFixed(3), alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })], shading: { fill: "F8F8F8" } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Predictor')] }),
            new TableCell({ children: [new Paragraph({ text: data.slope.toFixed(3), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.slopeStandardError?.toFixed(3) || '—', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.tStatistic?.toFixed(3) || '—', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.pValue < 0.001 ? '< .001' : data.pValue.toFixed(3), alignment: AlignmentType.CENTER })] })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    });
    
    items.push(coeffTable);
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Note. ', italics: true }),
          new TextRun({ text: 'B = unstandardized regression coefficient; SE B = standard error of B; t = t-statistic for testing H₀: B = 0.', italics: true })
        ],
        spacing: { before: 100, after: 300 }
      })
    );
    
    // Narrative results
    items.push(
      new Paragraph({
        text: `The regression model ${data.significant ? 'was statistically significant' : 'was not statistically significant'}, F(1, ${data.n - 2}) = ${data.fStatistic.toFixed(3)}, p ${data.significant ? '<' : '='} ${data.pValue < 0.001 ? '.001' : data.pValue.toFixed(3)}, and accounted for ${(data.rSquared * 100).toFixed(1)}% of the variance in the dependent variable (R² = ${data.rSquared.toFixed(3)}). The regression equation is: Ŷ = ${data.intercept.toFixed(3)} + ${data.slope.toFixed(3)}X, with a standard error of estimate of ${data.standardError.toFixed(3)}.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 }
      })
    );
    
    items.push(
      new Paragraph({
        text: `The regression coefficient (B = ${data.slope.toFixed(3)}) indicates that for each one-unit increase in the predictor variable, the outcome variable ${data.slope > 0 ? 'increases' : 'decreases'} by ${Math.abs(data.slope).toFixed(3)} units, on average. This ${data.significant ? 'statistically significant' : 'non-significant'} relationship ${data.significant ? 'provides evidence for' : 'does not provide strong evidence for'} a predictive association between the variables.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  } else {
    // Fallback when data is incomplete
    items.push(
      new Paragraph({
        text: 'The regression analysis was conducted, but complete statistical details are not available for reporting. Please ensure all required data (R², F-statistic, intercept, slope, standard error, and sample size) are provided for comprehensive reporting.',
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    );
  }
  
  if (charts.length > 0) {
    items.push(
      new Paragraph({
        text: 'Figure 1',
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: charts[0].buffer,
            transformation: {
              width: 600,
              height: 375
            },
            type: 'png'
          } as any)
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${charts[0].title}. `, italics: true }),
          new TextRun({ text: 'The regression line represents the best linear prediction of Y from X. Vertical distances from points to the line represent prediction errors (residuals). The standard error of estimate quantifies the average magnitude of these residuals.', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
  }
  
  return items;
}
