// src/utils/performance.ts
import React from 'react';

interface WebVitalMetrics {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
}

interface PerformanceResourceWithSize extends PerformanceResourceTiming {
  transferSize: number;
}

interface NetworkConnection {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: WebVitalMetrics = {};

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Core Web Vitals 측정
  measureWebVitals(): void {
    // FCP (First Contentful Paint)
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
        if (fcp) {
          this.metrics.fcp = fcp.startTime;
          console.log(`FCP: ${fcp.startTime.toFixed(2)}ms`);
          this.reportMetric('FCP', fcp.startTime);
        }
      }).observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP measurement not supported:', error);
    }

    // LCP (Largest Contentful Paint)
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        if (lcp) {
          this.metrics.lcp = lcp.startTime;
          console.log(`LCP: ${lcp.startTime.toFixed(2)}ms`);
          this.reportMetric('LCP', lcp.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP measurement not supported:', error);
    }

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value: number;
          };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        });
        this.metrics.cls = clsValue;
        console.log(`CLS: ${clsValue.toFixed(4)}`);
        this.reportMetric('CLS', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS measurement not supported:', error);
    }

    // FID (First Input Delay)
    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart: number;
            startTime: number;
          };
          const fid = fidEntry.processingStart - fidEntry.startTime;
          this.metrics.fid = fid;
          console.log(`⚡ FID: ${fid.toFixed(2)}ms`);
          this.reportMetric('FID', fid);
        });
      }).observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID measurement not supported:', error);
    }
  }

  // 네트워크 상태 모니터링
  monitorNetworkStatus(): void {
    try {
      const nav = navigator as NavigatorWithConnection;
      if ('connection' in nav && nav.connection) {
        const connection = nav.connection;
        console.log(`Network Type: ${connection.effectiveType}`);
        console.log(`Downlink: ${connection.downlink}Mbps`);
        console.log(`RTT: ${connection.rtt}ms`);
      }
    } catch (error) {
      console.warn('Network monitoring not supported:', error);
    }
  }

  // 리소스 타이밍 분석
  analyzeResourceTiming(): void {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      const analysis = {
        totalResources: resources.length,
        scripts: resources.filter((r) => r.name.includes('.js')).length,
        styles: resources.filter((r) => r.name.includes('.css')).length,
        images: resources.filter((r) => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)).length,
        fonts: resources.filter((r) => r.name.match(/\.(woff|woff2|ttf|otf)$/)).length,
      };

      // 가장 큰 리소스들 찾기
      const largestResources = resources
        .filter(
          (r): r is PerformanceResourceWithSize =>
            'transferSize' in r && (r as PerformanceResourceWithSize).transferSize > 0,
        )
        .sort((a, b) => b.transferSize - a.transferSize)
        .slice(0, 5)
        .map((r) => ({
          name: r.name.split('/').pop() || 'unknown',
          size: `${(r.transferSize / 1024).toFixed(2)}KB`,
          duration: `${r.duration.toFixed(2)}ms`,
        }));

      console.log('Resource Analysis:', analysis);
      console.log('Largest Resources:', largestResources);
    } catch (error) {
      console.warn('Resource timing analysis failed:', error);
    }
  }

  // 메트릭 보고
  private reportMetric(name: string, value: number): void {
    // 실제 환경에서는 Analytics로 전송
    try {
      console.log(`Reporting metric: ${name} = ${value}`);
    } catch (error) {
      console.warn('Failed to report metric:', error);
    }
  }

  // 성능 요약 보고서
  getPerformanceSummary(): {
    metrics: WebVitalMetrics;
    timestamp: string;
    userAgent: string;
    url: string;
  } {
    return {
      metrics: this.metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }
}

// React Hook
export const usePerformanceMonitor = (): PerformanceMonitor => {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    monitor.measureWebVitals();
    monitor.monitorNetworkStatus();

    // 페이지 로드 완료 후 리소스 분석
    const handleLoad = (): void => {
      setTimeout(() => {
        monitor.analyzeResourceTiming();
      }, 1000);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [monitor]);

  return monitor;
};
