/**
 * Performance Monitoring for Chat Interface
 *
 * Measures and reports performance metrics for the chat interface
 * including response times, rendering performance, and user interactions.
 */

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  timestamp: number;
  operation: string;
  metadata?: Record<string, any>;
}

class ChatPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private static instance: ChatPerformanceMonitor;

  private constructor() {}

  public static getInstance(): ChatPerformanceMonitor {
    if (!ChatPerformanceMonitor.instance) {
      ChatPerformanceMonitor.instance = new ChatPerformanceMonitor();
    }
    return ChatPerformanceMonitor.instance;
  }

  /**
   * Start measuring a performance metric
   * @param operation - The operation being measured
   * @param metadata - Additional metadata to associate with the measurement
   * @returns A unique ID for the measurement
   */
  start(operation: string, metadata?: Record<string, any>): string {
    const id = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const metric: PerformanceMetrics = {
      startTime: performance.now(),
      timestamp: Date.now(),
      operation,
      metadata
    };

    this.metrics.push(metric);

    return id;
  }

  /**
   * End measuring a performance metric
   * @param id - The ID returned by start()
   */
  end(id: string): void {
    const metric = this.metrics.find(m => m.startTime.toString() === id.split('_')[1]);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;

      // Log performance if it exceeds threshold (e.g., 500ms)
      if (metric.duration > 500) {
        console.warn(`Performance warning: ${metric.operation} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
      }
    }
  }

  /**
   * Measure a function execution
   * @param operation - The operation name
   * @param fn - The function to measure
   * @param metadata - Additional metadata
   */
  async measure<T>(operation: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const id = this.start(operation, metadata);
    try {
      const result = await fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id);
      throw error;
    }
  }

  /**
   * Get average duration for an operation
   * @param operation - The operation name
   */
  getAverageDuration(operation: string): number {
    const opMetrics = this.metrics.filter(m => m.operation === operation && m.duration !== undefined);
    if (opMetrics.length === 0) return 0;

    const total = opMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return total / opMetrics.length;
  }

  /**
   * Get recent metrics
   * @param limit - Number of recent metrics to return
   */
  getRecentMetrics(limit: number = 10): PerformanceMetrics[] {
    return [...this.metrics].reverse().slice(0, limit);
  }

  /**
   * Clear all stored metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Report performance summary
   */
  report(): void {
    const operations = [...new Set(this.metrics.map(m => m.operation))];

    console.group('Chat Performance Report');
    operations.forEach(op => {
      const opMetrics = this.metrics.filter(m => m.operation === op && m.duration !== undefined);
      if (opMetrics.length > 0) {
        const durations = opMetrics.map(m => m.duration || 0);
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        console.log(`${op}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms (n=${opMetrics.length})`);
      }
    });
    console.groupEnd();
  }
}

// Create a singleton instance
export const chatPerformanceMonitor = ChatPerformanceMonitor.getInstance();

/**
 * Performance marker for response time measurement
 */
export const measureResponseTime = (startTime: number): number => {
  return performance.now() - startTime;
};

/**
 * Hook for performance monitoring in React components
 */
export const useChatPerformance = () => {
  const startMeasurement = (operation: string, metadata?: Record<string, any>) => {
    return chatPerformanceMonitor.start(operation, metadata);
  };

  const endMeasurement = (id: string) => {
    chatPerformanceMonitor.end(id);
  };

  const measureFunction = async <T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return chatPerformanceMonitor.measure(operation, fn, metadata);
  };

  return {
    startMeasurement,
    endMeasurement,
    measureFunction,
    getAverageDuration: chatPerformanceMonitor.getAverageDuration.bind(chatPerformanceMonitor),
    getRecentMetrics: chatPerformanceMonitor.getRecentMetrics.bind(chatPerformanceMonitor),
    report: chatPerformanceMonitor.report.bind(chatPerformanceMonitor)
  };
};