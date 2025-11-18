# Deployment Guide

Complete guide for deploying CrackGov.ai to production.

## Related Documentation

- [Quick Start Guide](../getting-started/quick-start.md) - Development setup
- [Scalability Implementation](../implementation/scalability.md) - Scalability features

## Prerequisites

1. **Redis Instance**
   - Local: `docker run -d -p 6379:6379 redis:latest`
   - Production: Redis Cloud, AWS ElastiCache, or similar

2. **PostgreSQL Database**
   - Primary database
   - Read replica (optional but recommended)

3. **Environment Variables**
   - See `.env.example` for all required variables

## Step-by-Step Deployment

### 1. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes (includes new indexes)
npx prisma db push

# Or use migrations in production
npx prisma migrate deploy
```

### 2. Redis Setup

```bash
# Local development
docker run -d -p 6379:6379 --name redis redis:latest

# Production - use managed Redis service
# Update REDIS_URL in environment variables
```

### 3. Start Workers

Workers must run as separate processes:

```bash
# Development
tsx scripts/start-workers.ts

# Production with PM2
pm2 start scripts/start-workers.ts --name workers
pm2 save
pm2 startup
```

### 4. Configure Monitoring

#### Sentry Setup:
1. Create account at sentry.io
2. Create a new project
3. Copy DSN to environment variables:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
   SENTRY_DSN=your-dsn-here
   ```

#### Prometheus Setup:
1. Configure Prometheus to scrape `/api/metrics`
2. Add to `prometheus.yml`:
   ```yaml
   scrape_configs:
     - job_name: 'crackgov'
       static_configs:
         - targets: ['your-app-url:3000']
       metrics_path: '/api/metrics'
   ```

### 5. Environment Variables

Create `.env.production`:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_READ_REPLICA_URL=postgresql://user:pass@replica:5432/db

# Redis
REDIS_URL=redis://host:6379
# Or for Redis Cloud:
# REDIS_URL=rediss://username:password@host:port

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_DSN=your-dsn

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret

# Encryption
ENCRYPTION_KEY=your-32-byte-key
```

### 6. Build and Deploy

```bash
# Build application
npm run build

# Start application
npm start

# Or deploy to Vercel/Railway/etc.
```

## Monitoring

### Metrics Endpoint
- Access metrics at: `https://your-domain.com/api/metrics`
- Prometheus format, ready for scraping

### Key Metrics to Monitor:
- `http_request_duration_seconds` - API response times
- `cache_hits_total` / `cache_misses_total` - Cache performance
- `queue_jobs_active` - Background job queue depth
- `rate_limit_hits_total` - Rate limiting activity
- `errors_total` - Error rates by type

### Grafana Dashboards

Create dashboards for:
1. **API Performance**: Request duration, throughput, error rates
2. **Cache Performance**: Hit rates, miss rates by cache key
3. **Queue Health**: Active jobs, waiting jobs, job duration
4. **Database Performance**: Query duration, query counts
5. **AI Usage**: Request counts, duration, costs

## Scaling Configuration

### Horizontal Scaling
- Deploy multiple Next.js instances behind load balancer
- All instances share Redis (for cache and rate limiting)
- Workers can run on separate instances

### Auto-scaling Triggers
- CPU > 70% for 5 minutes
- Memory > 80% for 5 minutes
- Queue depth > 1000 jobs
- Response time > 2 seconds (p95)

### Database Scaling
- Use connection pooling (PgBouncer)
- Set up read replicas for read-heavy operations
- Monitor connection pool usage

## Troubleshooting

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
```

### Worker Not Processing Jobs
1. Check worker logs: `pm2 logs workers`
2. Verify Redis connection
3. Check queue status in Redis: `redis-cli KEYS "bull:*"`

### High Cache Miss Rate
1. Check Redis memory usage
2. Verify TTL settings
3. Review cache key patterns

### Rate Limiting Too Strict
- Adjust limits in `src/lib/rate-limit-redis.ts`
- Check Redis for rate limit keys: `redis-cli KEYS "ratelimit:*"`

## Performance Tuning

### Cache TTL Optimization
- Question Bank: 5 minutes (current)
- Leaderboard: 5 minutes (current)
- Notifications: 30 seconds (current)
- Adjust based on update frequency

### Queue Concurrency
- AI Queue: 10 concurrent (current)
- Email Queue: 5 concurrent (current)
- Leaderboard Queue: 20 concurrent (current)
- Adjust based on server capacity

### Database Connection Pool
- Default: 10 connections
- Increase for high traffic
- Monitor with: `SELECT count(*) FROM pg_stat_activity;`

## Security Considerations

1. **Redis Security**:
   - Use password authentication
   - Enable TLS in production
   - Restrict network access

2. **Rate Limiting**:
   - Per-user limits prevent abuse
   - Per-IP limits for unauthenticated requests

3. **Metrics Endpoint**:
   - Restrict access to monitoring systems
   - Don't expose publicly

4. **Sentry**:
   - Configure data scrubbing
   - Set up alert rules

## Cost Optimization

1. **Cache Strategy**:
   - Longer TTL for static data
   - Shorter TTL for frequently updated data

2. **Queue Processing**:
   - Batch similar jobs
   - Use priority queues

3. **Database**:
   - Use read replicas for expensive queries
   - Optimize slow queries

4. **AI Costs**:
   - Cache AI responses when possible
   - Use cheaper models for simple tasks
   - Monitor costs via metrics

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Review metrics: `/api/metrics`
3. Check Sentry for errors
4. Review Redis keys: `redis-cli KEYS "*"`

