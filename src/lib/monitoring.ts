import { register, Counter, Histogram, Gauge } from "prom-client";

// Prometheus metrics registry
export const metricsRegistry = register;

// HTTP Request Metrics
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const httpRequestTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

// AI Request Metrics
export const aiRequestCounter = new Counter({
  name: "ai_requests_total",
  help: "Total number of AI requests",
  labelNames: ["feature", "provider", "status"],
});

export const aiRequestDuration = new Histogram({
  name: "ai_request_duration_seconds",
  help: "Duration of AI requests in seconds",
  labelNames: ["feature", "provider"],
  buckets: [1, 2, 5, 10, 30, 60],
});

export const aiRequestCost = new Counter({
  name: "ai_request_cost",
  help: "Estimated cost of AI requests",
  labelNames: ["feature", "provider", "model"],
});

// Database Metrics
export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "model"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const dbQueryTotal = new Counter({
  name: "db_queries_total",
  help: "Total number of database queries",
  labelNames: ["operation", "model", "status"],
});

// Cache Metrics
export const cacheHits = new Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
  labelNames: ["cache_key"],
});

export const cacheMisses = new Counter({
  name: "cache_misses_total",
  help: "Total number of cache misses",
  labelNames: ["cache_key"],
});

export const cacheOperations = new Counter({
  name: "cache_operations_total",
  help: "Total number of cache operations",
  labelNames: ["operation", "status"],
});

// Queue Metrics
export const queueJobsTotal = new Counter({
  name: "queue_jobs_total",
  help: "Total number of queue jobs",
  labelNames: ["queue", "status"],
});

export const queueJobDuration = new Histogram({
  name: "queue_job_duration_seconds",
  help: "Duration of queue jobs in seconds",
  labelNames: ["queue"],
  buckets: [1, 5, 10, 30, 60, 300],
});

export const queueJobsActive = new Gauge({
  name: "queue_jobs_active",
  help: "Number of active queue jobs",
  labelNames: ["queue"],
});

export const queueJobsWaiting = new Gauge({
  name: "queue_jobs_waiting",
  help: "Number of waiting queue jobs",
  labelNames: ["queue"],
});

// Rate Limit Metrics
export const rateLimitHits = new Counter({
  name: "rate_limit_hits_total",
  help: "Total number of rate limit hits",
  labelNames: ["identifier", "limit_type"],
});

// Error Metrics
export const errorsTotal = new Counter({
  name: "errors_total",
  help: "Total number of errors",
  labelNames: ["type", "severity"],
});

/**
 * Track API request
 */
export function trackApiRequest(
  method: string,
  route: string,
  status: number,
  duration: number
) {
  httpRequestDuration.observe({ method, route, status }, duration);
  httpRequestTotal.inc({ method, route, status });
}

/**
 * Track AI request
 */
export function trackAIRequest(
  feature: string,
  provider: string,
  status: "success" | "error",
  duration: number,
  model?: string
) {
  aiRequestCounter.inc({ feature, provider, status });
  aiRequestDuration.observe({ feature, provider }, duration);
  if (model) {
    // Estimate cost (this would be more accurate with actual pricing)
    const estimatedCost = duration * 0.001; // Placeholder
    aiRequestCost.inc({ feature, provider, model }, estimatedCost);
  }
}

/**
 * Track database query
 */
export function trackDBQuery(
  operation: string,
  model: string,
  status: "success" | "error",
  duration: number
) {
  dbQueryDuration.observe({ operation, model }, duration);
  dbQueryTotal.inc({ operation, model, status });
}

/**
 * Track cache operation
 */
export function trackCacheOperation(
  operation: "hit" | "miss" | "set" | "del",
  cacheKey?: string,
  status: "success" | "error" = "success"
) {
  if (operation === "hit") {
    cacheHits.inc({ cache_key: cacheKey || "unknown" });
  } else if (operation === "miss") {
    cacheMisses.inc({ cache_key: cacheKey || "unknown" });
  }
  cacheOperations.inc({ operation, status });
}

/**
 * Track queue job
 */
export function trackQueueJob(
  queue: string,
  status: "completed" | "failed" | "active" | "waiting",
  duration?: number
) {
  queueJobsTotal.inc({ queue, status });
  if (duration !== undefined) {
    queueJobDuration.observe({ queue }, duration);
  }
  if (status === "active") {
    queueJobsActive.inc({ queue });
  } else if (status === "waiting") {
    queueJobsWaiting.inc({ queue });
  }
}

/**
 * Track error
 */
export function trackError(type: string, severity: "low" | "medium" | "high" | "critical") {
  errorsTotal.inc({ type, severity });
}

/**
 * Get metrics as Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return await metricsRegistry.metrics();
}

