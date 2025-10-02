import * as ss from 'simple-statistics';

export interface TTestResult {
  tStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  mean1: number;
  mean2: number;
  sd1: number;
  sd2: number;
  n1: number;
  n2: number;
  cohensD: number;
  significant: boolean;
}

export interface CorrelationResult {
  coefficient: number;
  pValue: number;
  n: number;
  significant: boolean;
  interpretation: string;
}

export interface ANOVAResult {
  fStatistic: number;
  pValue: number;
  betweenGroupsDF: number;
  withinGroupsDF: number;
  betweenGroupsSS: number;
  withinGroupsSS: number;
  totalSS: number;
  etaSquared: number;
  significant: boolean;
  groupMeans: { group: string; mean: number; sd: number; n: number }[];
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  fStatistic: number;
  pValue: number;
  standardError: number;
  n: number;
  significant: boolean;
}

export function calculateTTest(group1: number[], group2: number[]): TTestResult {
  // Validate inputs
  if (group1.length < 2 || group2.length < 2) {
    return {
      tStatistic: 0,
      degreesOfFreedom: 0,
      pValue: 1,
      mean1: group1.length > 0 ? ss.mean(group1) || 0 : 0,
      mean2: group2.length > 0 ? ss.mean(group2) || 0 : 0,
      sd1: 0,
      sd2: 0,
      n1: group1.length,
      n2: group2.length,
      cohensD: 0,
      significant: false
    };
  }
  
  const mean1 = ss.mean(group1) || 0;
  const mean2 = ss.mean(group2) || 0;
  const sd1 = ss.standardDeviation(group1) || 0;
  const sd2 = ss.standardDeviation(group2) || 0;
  const n1 = group1.length;
  const n2 = group2.length;
  
  const result = ss.tTestTwoSample(group1, group2) || 0;
  
  const pooledSD = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2));
  const cohensD = pooledSD > 0 ? Math.abs(mean1 - mean2) / pooledSD : 0;
  
  const df = n1 + n2 - 2;
  const pValue = calculateTTestPValue(result, df);
  
  return {
    tStatistic: result,
    degreesOfFreedom: df,
    pValue,
    mean1,
    mean2,
    sd1,
    sd2,
    n1,
    n2,
    cohensD,
    significant: pValue < 0.05
  };
}

function calculateTTestPValue(tStat: number, df: number): number {
  const absTStat = Math.abs(tStat);
  
  if (df < 1) return 1;
  
  const t = absTStat;
  const a = df / (df + t * t);
  
  let p = a;
  if (df > 1) {
    let term = a;
    for (let i = df - 2; i >= 2; i -= 2) {
      term *= a * i / (i + 1);
      p += term;
    }
  }
  
  if (df % 2 === 0) {
    p = 1 - Math.sqrt(a) * p;
  } else {
    p = 1 - (2 / Math.PI) * (Math.atan(t / Math.sqrt(df)) + Math.sqrt(a) * p);
  }
  
  return Math.min(Math.max(p * 2, 0), 1);
}

export function calculateCorrelation(x: number[], y: number[]): CorrelationResult {
  if (x.length !== y.length || x.length < 3) {
    return {
      coefficient: 0,
      pValue: 1,
      n: x.length,
      significant: false,
      interpretation: 'Insufficient data (need at least 3 data points)'
    };
  }
  
  const r = ss.sampleCorrelation(x, y);
  const n = x.length;
  
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const df = n - 2;
  const pValue = calculateTTestPValue(t, df);
  
  let interpretation = '';
  const absR = Math.abs(r);
  if (absR < 0.3) interpretation = 'weak';
  else if (absR < 0.7) interpretation = 'moderate';
  else interpretation = 'strong';
  
  if (r < 0) interpretation += ' negative';
  else interpretation += ' positive';
  
  return {
    coefficient: r,
    pValue,
    n,
    significant: pValue < 0.05,
    interpretation
  };
}

export function calculateANOVA(groups: { name: string; values: number[] }[]): ANOVAResult {
  // Validate inputs - need at least 2 groups with at least 2 values each
  const validGroups = groups.filter(g => g.values.length >= 2);
  if (validGroups.length < 2) {
    return {
      fStatistic: 0,
      pValue: 1,
      betweenGroupsDF: 0,
      withinGroupsDF: 0,
      betweenGroupsSS: 0,
      withinGroupsSS: 0,
      totalSS: 0,
      etaSquared: 0,
      significant: false,
      groupMeans: groups.map(g => ({
        group: g.name,
        mean: g.values.length > 0 ? ss.mean(g.values) || 0 : 0,
        sd: g.values.length > 1 ? ss.standardDeviation(g.values) || 0 : 0,
        n: g.values.length
      }))
    };
  }
  
  const allValues: number[] = [];
  const groupSizes: number[] = [];
  const groupMeans: { group: string; mean: number; sd: number; n: number }[] = [];
  
  validGroups.forEach(group => {
    allValues.push(...group.values);
    groupSizes.push(group.values.length);
    groupMeans.push({
      group: group.name,
      mean: ss.mean(group.values) || 0,
      sd: ss.standardDeviation(group.values) || 0,
      n: group.values.length
    });
  });
  
  const grandMean = ss.mean(allValues) || 0;
  const totalN = allValues.length;
  const k = validGroups.length;
  
  let betweenGroupsSS = 0;
  validGroups.forEach((group, i) => {
    const groupMean = ss.mean(group.values) || 0;
    betweenGroupsSS += groupSizes[i] * Math.pow(groupMean - grandMean, 2);
  });
  
  let withinGroupsSS = 0;
  validGroups.forEach((group) => {
    const groupMean = ss.mean(group.values) || 0;
    group.values.forEach(value => {
      withinGroupsSS += Math.pow(value - groupMean, 2);
    });
  });
  
  const totalSS = betweenGroupsSS + withinGroupsSS;
  
  const betweenGroupsDF = k - 1;
  const withinGroupsDF = totalN - k;
  
  const betweenGroupsMS = betweenGroupsSS / betweenGroupsDF;
  const withinGroupsMS = withinGroupsSS / withinGroupsDF;
  
  const fStatistic = betweenGroupsMS / withinGroupsMS;
  
  const pValue = calculateFTestPValue(fStatistic, betweenGroupsDF, withinGroupsDF);
  
  const etaSquared = betweenGroupsSS / totalSS;
  
  return {
    fStatistic,
    pValue,
    betweenGroupsDF,
    withinGroupsDF,
    betweenGroupsSS,
    withinGroupsSS,
    totalSS,
    etaSquared,
    significant: pValue < 0.05,
    groupMeans
  };
}

function calculateFTestPValue(f: number, df1: number, df2: number): number {
  if (f <= 0 || df1 <= 0 || df2 <= 0) return 1;
  
  const x = df2 / (df2 + df1 * f);
  
  let p = betaIncomplete(x, df2 / 2, df1 / 2);
  
  return Math.min(Math.max(p, 0), 1);
}

function betaIncomplete(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  
  const bt = Math.exp(
    gammaLn(a + b) - gammaLn(a) - gammaLn(b) +
    a * Math.log(x) + b * Math.log(1 - x)
  );
  
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaContinuedFraction(x, a, b) / a;
  } else {
    return 1 - bt * betaContinuedFraction(1 - x, b, a) / b;
  }
}

function betaContinuedFraction(x: number, a: number, b: number): number {
  const maxIterations = 100;
  const epsilon = 3e-7;
  
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  
  if (Math.abs(d) < epsilon) d = epsilon;
  d = 1 / d;
  let h = d;
  
  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < epsilon) d = epsilon;
    c = 1 + aa / c;
    if (Math.abs(c) < epsilon) c = epsilon;
    d = 1 / d;
    h *= d * c;
    
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < epsilon) d = epsilon;
    c = 1 + aa / c;
    if (Math.abs(c) < epsilon) c = epsilon;
    d = 1 / d;
    const del = d * c;
    h *= del;
    
    if (Math.abs(del - 1) < epsilon) break;
  }
  
  return h;
}

function gammaLn(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677,
    24.01409824083091, -1.231739572450155,
    0.001208650973866179, -0.000005395239384953
  ];
  
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  
  for (let j = 0; j < 6; j++) {
    ser += cof[j] / ++y;
  }
  
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

export function calculateRegression(x: number[], y: number[]): RegressionResult {
  if (x.length !== y.length || x.length < 3) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      fStatistic: 0,
      pValue: 1,
      standardError: 0,
      n: x.length,
      significant: false
    };
  }
  
  const n = x.length;
  const regression = ss.linearRegression([x, y]);
  const slope = regression.m;
  const intercept = regression.b;
  
  const yMean = ss.mean(y) || 0;
  let sst = 0;
  let sse = 0;
  
  for (let i = 0; i < n; i++) {
    const yPred = slope * x[i] + intercept;
    sst += Math.pow(y[i] - yMean, 2);
    sse += Math.pow(y[i] - yPred, 2);
  }
  
  const rSquared = 1 - (sse / sst);
  const mse = sse / (n - 2);
  const standardError = Math.sqrt(mse);
  
  const msr = (sst - sse);
  const fStatistic = msr / mse;
  
  const pValue = calculateFTestPValue(fStatistic, 1, n - 2);
  
  return {
    slope,
    intercept,
    rSquared,
    fStatistic,
    pValue,
    standardError,
    n,
    significant: pValue < 0.05
  };
}
