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
  HeadingLevel
} from 'docx';

export interface StatisticsTable {
  variable: string;
  n: number;
  mean: string;
  sd: string;
  min: string;
  max: string;
  range: string;
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
  
  children.push(
    new Paragraph({
      text: 'RESULTS',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );
  
  children.push(
    new Paragraph({
      text: 'Descriptive Statistics',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `This analysis examined ${sessionCount} strategy session${sessionCount > 1 ? 's' : ''} across ${variableNames.length} dependent variable${variableNames.length > 1 ? 's' : ''}. The variables analyzed were: ${variableNames.join(', ')}. Table 1 presents descriptive statistics including means, standard deviations, and ranges for all variables.`
        })
      ],
      spacing: { after: 200 }
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
            width: { size: 25, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'N', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 10, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Mean', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'SD', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Min', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Max', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Range', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 13, type: WidthType.PERCENTAGE }
          })
        ],
        tableHeader: true
      }),
      ...descriptiveStats.map(stat =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(stat.variable)] }),
            new TableCell({ children: [new Paragraph({ text: String(stat.n), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: stat.mean, alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: stat.sd, alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: stat.min, alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: stat.max, alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: stat.range, alignment: AlignmentType.CENTER })] })
          ]
        })
      )
    ],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
  
  children.push(descriptiveTable);
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Note. ', italics: true }),
        new TextRun({ text: 'N = sample size; SD = standard deviation.', italics: true })
      ],
      spacing: { before: 100, after: 300 }
    })
  );
  
  if (descriptiveStats.length > 0) {
    const natoStat = descriptiveStats.find(s => s.variable.includes('NATO Total'));
    const russiaStat = descriptiveStats.find(s => s.variable.includes('Russia Total'));
    
    let narrative = 'The data showed considerable variation across sessions. ';
    
    if (natoStat) {
      narrative += `For NATO Total Deterrence, scores ranged from ${natoStat.min} to ${natoStat.max} (M = ${natoStat.mean}, SD = ${natoStat.sd}), indicating ${parseFloat(natoStat.sd) > parseFloat(natoStat.mean) * 0.3 ? 'substantial' : 'moderate'} variability in strategic outcomes. `;
    }
    
    if (russiaStat) {
      narrative += `Similarly, Russia Total Deterrence values ranged from ${russiaStat.min} to ${russiaStat.max} (M = ${russiaStat.mean}, SD = ${russiaStat.sd}). `;
    }
    
    narrative += 'These descriptive patterns provide the foundation for the inferential analyses reported below.';
    
    children.push(
      new Paragraph({
        text: narrative,
        spacing: { after: 400 }
      })
    );
  }
  
  children.push(
    new Paragraph({
      text: `Inferential Analysis: ${methodology}`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    })
  );
  
  children.push(...generateInferentialSection(methodology, inferentialData, chartBuffers));
  
  children.push(
    new Paragraph({
      text: 'Summary and Interpretation',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    })
  );
  
  children.push(
    new Paragraph({
      text: `The ${methodology} revealed patterns in strategic deterrence across the ${sessionCount} analyzed sessions. These findings contribute to our understanding of multi-dimensional deterrence strategy dynamics and provide empirical evidence for the effectiveness of different strategic approaches across the ${variableNames.length > 1 ? 'multiple domains' : 'examined domain'}.`,
      spacing: { after: 400 }
    })
  );
  
  const doc = new Document({
    creator: 'MDDS Research System',
    title: `Statistical Analysis Report - ${methodology}`,
    description: 'Scientific Results Section',
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
  charts: { title: string; buffer: Buffer }[]
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
          text: `A ${methodology} was conducted to analyze the relationship between the selected variables. Detailed statistical results follow below.`,
          spacing: { after: 200 }
        })
      );
  }
  
  return items;
}

function generateTTestSection(data: any, charts: { title: string; buffer: Buffer }[]): Paragraph[] {
  const items: Paragraph[] = [];
  
  items.push(
    new Paragraph({
      text: `An independent samples t-test was conducted to compare the dependent variable between two groups. This parametric test assesses whether the mean difference between two independent groups is statistically significant.`,
      spacing: { after: 200 }
    })
  );
  
  if (data && data.tStatistic !== undefined) {
    items.push(
      new Paragraph({
        text: `The analysis revealed ${data.significant ? 'a statistically significant' : 'no statistically significant'} difference between groups, t(${data.degreesOfFreedom}) = ${data.tStatistic.toFixed(3)}, p ${data.significant ? '<' : '>'} .05, Cohen's d = ${data.cohensD.toFixed(2)}. Group 1 (M = ${data.mean1.toFixed(2)}, SD = ${data.sd1.toFixed(2)}, n = ${data.n1}) ${data.mean1 > data.mean2 ? 'showed higher scores than' : 'showed lower scores than'} Group 2 (M = ${data.mean2.toFixed(2)}, SD = ${data.sd2.toFixed(2)}, n = ${data.n2}).`,
        spacing: { after: 200 }
      })
    );
    
    const effectSize = data.cohensD < 0.2 ? 'negligible' : data.cohensD < 0.5 ? 'small' : data.cohensD < 0.8 ? 'medium' : 'large';
    items.push(
      new Paragraph({
        text: `The effect size (Cohen's d = ${data.cohensD.toFixed(2)}) indicates a ${effectSize} practical difference between groups, ${data.significant ? 'supporting' : 'not supporting'} the hypothesis of a meaningful group difference with practical implications for strategic planning in multi-dimensional deterrence scenarios.`,
        spacing: { after: 300 }
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
          new TextRun({ text: 'Error bars represent 95% confidence intervals.', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );
  }
  
  return items;
}

function generateANOVASection(data: any, charts: { title: string; buffer: Buffer }[]): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];
  
  items.push(
    new Paragraph({
      text: 'A one-way analysis of variance (ANOVA) was performed to compare the dependent variable across three or more independent groups. ANOVA extends the t-test logic to scenarios with multiple groups.',
      spacing: { after: 200 }
    })
  );
  
  if (data && data.fStatistic !== undefined) {
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
          new TextRun({ text: 'ANOVA Summary Table', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
    
    const anovaTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Source', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SS', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'df', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'MS', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'F', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'p', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'η²', bold: true })], alignment: AlignmentType.CENTER })] })
          ],
          tableHeader: true
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Between Groups')] }),
            new TableCell({ children: [new Paragraph({ text: data.betweenGroupsSS.toFixed(2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(data.betweenGroupsDF), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: (data.betweenGroupsSS / data.betweenGroupsDF).toFixed(2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.fStatistic.toFixed(3), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.pValue < 0.001 ? '< .001' : data.pValue.toFixed(3), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: data.etaSquared.toFixed(3), alignment: AlignmentType.CENTER })] })
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
            new TableCell({ children: [new Paragraph('Total')] }),
            new TableCell({ children: [new Paragraph({ text: data.totalSS.toFixed(2), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(data.betweenGroupsDF + data.withinGroupsDF), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: '—', alignment: AlignmentType.CENTER })] })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE }
    });
    
    items.push(anovaTable);
    
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Note. ', italics: true }),
          new TextRun({ text: 'SS = sum of squares; df = degrees of freedom; MS = mean square; η² = eta squared.', italics: true })
        ],
        spacing: { before: 100, after: 300 }
      })
    );
    
    items.push(
      new Paragraph({
        text: `The omnibus F-test was ${data.significant ? '' : 'not '}statistically significant, F(${data.betweenGroupsDF}, ${data.withinGroupsDF}) = ${data.fStatistic.toFixed(3)}, p ${data.significant ? '<' : '>'} .05, η² = ${data.etaSquared.toFixed(3)}. ${data.significant ? 'Post-hoc pairwise comparisons would identify which specific groups differ from one another.' : 'No further post-hoc tests are warranted.'}`,
        spacing: { after: 300 }
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
          new TextRun({ text: 'Error bars represent standard errors.', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );
  }
  
  return items;
}

function generateCorrelationSection(data: any, charts: { title: string; buffer: Buffer }[]): Paragraph[] {
  const items: Paragraph[] = [];
  
  items.push(
    new Paragraph({
      text: 'Correlation analysis examined the linear relationship between the selected variables. Pearson\'s r assesses linear association strength and direction.',
      spacing: { after: 200 }
    })
  );
  
  if (data && data.coefficient !== undefined) {
    items.push(
      new Paragraph({
        text: `The correlation analysis revealed a ${data.interpretation} correlation between the variables, r(${data.n - 2}) = ${data.coefficient.toFixed(3)}, p ${data.significant ? '<' : '>'} .05. This ${data.significant ? 'statistically significant' : 'non-significant'} correlation suggests ${data.interpretation.includes('strong') ? 'a robust' : data.interpretation.includes('moderate') ? 'a moderate' : 'a weak'} ${data.coefficient > 0 ? 'positive' : 'negative'} relationship between the measures.`,
        spacing: { after: 300 }
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
          new TextRun({ text: 'Each point represents one session. The trend line indicates the direction and strength of the relationship.', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );
  }
  
  return items;
}

function generateRegressionSection(data: any, charts: { title: string; buffer: Buffer }[]): Paragraph[] {
  const items: Paragraph[] = [];
  
  items.push(
    new Paragraph({
      text: 'Multiple regression analysis was conducted to evaluate the collective and unique contribution of predictors to explaining variance in the outcome variable.',
      spacing: { after: 200 }
    })
  );
  
  if (data && data.rSquared !== undefined) {
    items.push(
      new Paragraph({
        text: `The overall model accounted for ${(data.rSquared * 100).toFixed(1)}% of variance in the dependent variable, F(1, ${data.n - 2}) = ${data.fStatistic.toFixed(3)}, p ${data.significant ? '<' : '>'} .05. The regression equation is: Y = ${data.intercept.toFixed(3)} + ${data.slope.toFixed(3)}X, with a standard error of estimate of ${data.standardError.toFixed(3)}.`,
        spacing: { after: 300 }
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
          new TextRun({ text: 'The regression line shows the predicted relationship between predictor and outcome.', italics: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );
  }
  
  return items;
}
