import * as fs from 'fs';

interface LighthouseReport {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    'best-practices': { score: number };
    seo: { score: number };
  };
  audits: {
    'first-contentful-paint': { numericValue: number };
    'largest-contentful-paint': { numericValue: number };
    'cumulative-layout-shift': { numericValue: number };
    'total-blocking-time': { numericValue: number };
  };
}

interface PerformanceReport {
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    fcp: number;
    lcp: number;
    cls: number;
    tbt: number;
  };
}

function generatePerformanceReport(): PerformanceReport {
  try {
    const lighthouseData: LighthouseReport = JSON.parse(
      fs.readFileSync('./lighthouse-reports/lhr.json', 'utf8'),
    );

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      scores: {
        performance: lighthouseData.categories.performance.score * 100,
        accessibility: lighthouseData.categories.accessibility.score * 100,
        bestPractices: lighthouseData.categories['best-practices'].score * 100,
        seo: lighthouseData.categories.seo.score * 100,
      },
      metrics: {
        fcp: lighthouseData.audits['first-contentful-paint'].numericValue,
        lcp: lighthouseData.audits['largest-contentful-paint'].numericValue,
        cls: lighthouseData.audits['cumulative-layout-shift'].numericValue,
        tbt: lighthouseData.audits['total-blocking-time'].numericValue,
      },
    };

    console.log('Performance Report Generated:', report);
    return report;
  } catch (error) {
    console.error('Failed to generate performance report:', error);
    throw error;
  }
}

export { generatePerformanceReport };
