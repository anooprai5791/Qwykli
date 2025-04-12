// config/metrics.js
import promClient from 'prom-client';

// Create a Registry to register metrics
const register = new promClient.Registry();

// Enable default metrics (e.g., CPU, memory, event loop lag)
promClient.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 500], // Define buckets for histogram
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);

export { register, httpRequestDurationMicroseconds };