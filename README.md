# CrackGov.ai - AI-Powered Government Exam Preparation

An MVP SaaS web application for AI-powered government exam preparation built with Next.js 14, TypeScript, and OpenAI.

## Features

- 🔐 **Authentication**: User registration and login with NextAuth.js
- 🔑 **Password Reset**: Forgot password and reset functionality
- 📚 **AI Study Plans**: Generate personalized study plans based on exam type, target date, and weak areas
- 💾 **Study Plan Persistence**: Save and manage your study plans
- 📝 **Mock Tests**: Take AI-generated 20-question mock tests with detailed results and topic-wise analysis
- 💬 **AI Doubt Chat**: Ask questions and get step-by-step explanations from an AI tutor
- 📊 **Dashboard**: Overview of study progress and quick access to all features
- 💳 **Subscription**: Stubbed subscription system (ready for Razorpay integration)
- 🛠️ **Admin Panel**: Comprehensive admin system for managing AI providers, API keys, feature configurations, and CMS content
- 📝 **CMS**: Content Management System for managing pages, FAQs, announcements, and banners
- 💳 **Razorpay Integration**: Complete payment gateway integration for subscriptions
- 🔄 **AI Orchestrator**: Central AI service with automatic failover, key rotation, and health tracking
- 🛡️ **Security**: Enterprise-grade security features
  - Security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Input sanitization and validation
  - CSRF protection
  - Secure file uploads with malware scanning
  - Environment variable validation
- 📧 **Email Service**: Integrated with Resend/SendGrid
- 💾 **File Storage**: AWS S3 and Cloudflare R2 support
- 🛡️ **Rate Limiting**: Distributed Redis-based rate limiting
- 📝 **Structured Logging**: Comprehensive error logging and monitoring
- ✅ **Test Suite**: Basic test coverage with Vitest
- 🚀 **Scalability**: Built to handle millions of users
  - Redis caching layer with TTL support
  - Database read replicas for read-heavy operations
  - Message queues for async processing (AI, email, leaderboard)
  - Real-time notifications via Server-Sent Events
  - Distributed rate limiting across instances
  - Comprehensive monitoring (Sentry + Prometheus)
  - DataLoader for batch loading
  - Cursor-based pagination
- 🔍 **Enhanced Search**: Full-text search across content
- 📊 **Analytics**: User behavior and feature usage tracking
- 🌐 **Internationalization**: Multi-language support (EN, HI, MR, TA, TE)
- ♿ **Accessibility**: WCAG-compliant with keyboard navigation
- 📱 **PWA**: Progressive Web App with offline support
- 🐳 **Docker**: Complete containerization support
- 🔄 **CI/CD**: GitHub Actions pipeline
- 📚 **API Docs**: OpenAPI/Swagger documentation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM (with read replicas)
- **Cache**: Redis (distributed caching)
- **Queue**: BullMQ (background job processing)
- **Authentication**: NextAuth.js (Credentials provider)
- **AI**: OpenAI GPT-4o-mini (via AI Orchestrator)
- **Data Fetching**: SWR
- **Testing**: Vitest
- **Rate Limiting**: Redis-based distributed rate limiting
- **Monitoring**: Sentry (error tracking) + Prometheus (metrics)
- **Real-time**: Server-Sent Events (SSE)

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- OpenAI API key (or configure via admin panel)

## Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/crackgov"
   DATABASE_READ_REPLICA_URL="postgresql://user:password@localhost:5432/crackgov" # Optional
   REDIS_URL="redis://localhost:6379"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ENCRYPTION_KEY="your-32-byte-encryption-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   # Sentry (optional, for error tracking)
   NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
   SENTRY_DSN="your-sentry-dsn"
   # Email Service (optional - choose one)
   RESEND_API_KEY="your-resend-api-key"
   # OR
   SENDGRID_API_KEY="your-sendgrid-api-key"
   # File Storage (optional - choose one)
   STORAGE_PROVIDER="s3" # or "r2" or "local"
   AWS_ACCESS_KEY_ID="your-aws-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret"
   AWS_S3_BUCKET="your-bucket-name"
   AWS_REGION="us-east-1"
   # OR for Cloudflare R2
   R2_BUCKET="your-r2-bucket"
   R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
   # Razorpay credentials are optional - configure via Admin Panel > Payment Config
   ```

   Generate secure keys:
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate ENCRYPTION_KEY (for API key encryption)
   openssl rand -base64 32
   ```

3. **Set up Redis** (required for caching and queues):
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 --name redis redis:latest
   
   # Or install Redis locally
   # macOS: brew install redis && brew services start redis
   # Linux: sudo apt-get install redis-server && sudo systemctl start redis
   ```

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start workers** (in a separate terminal, required for background jobs):
   ```bash
   tsx scripts/start-workers.ts
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Docker Deployment

The application includes full Docker support:

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or build and run manually
docker build -t crackgov-ai .
docker run -p 3000:3000 --env-file .env crackgov-ai
```

Docker Compose includes:
- Next.js application
- PostgreSQL database
- Redis cache
- Background workers

## Health Check

Check system health:
```bash
curl http://localhost:3000/api/health
```

## API Documentation

API documentation is available in OpenAPI format:
- File: `openapi.yaml`
- View online: Use Swagger UI or similar tool

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth configuration, password reset
│   │   ├── ai/            # AI endpoints (study-plan, doubt)
│   │   ├── tests/         # Mock test endpoints
│   │   ├── study-plans/   # Study plan management
│   │   ├── subscription/  # Subscription endpoints
│   │   └── admin/         # Admin panel API routes
│   ├── app/               # Protected app routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── study-plan/   # Study plan generator
│   │   ├── tests/         # Mock test pages
│   │   ├── doubts/        # Doubt chat
│   │   └── upgrade/       # Subscription upgrade
│   ├── auth/              # Auth pages (login, register, forgot-password, reset-password)
│   ├── admin/             # Admin panel pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/              # App layout components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── openai.ts           # OpenAI client (legacy)
│   ├── ai-orchestrator.ts  # AI orchestrator with failover
│   ├── auth.ts             # Auth utilities
│   ├── admin-auth.ts       # Admin auth utilities
│   ├── encryption.ts       # API key encryption
│   ├── rate-limit.ts       # Rate limiting
│   ├── logger.ts           # Structured logging
│   ├── email.ts            # Email service (stubbed)
│   └── utils.ts            # Utility functions
├── test/                   # Test setup
└── types/                   # TypeScript type definitions
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### AI Features
- `POST /api/ai/study-plan` - Generate AI study plan
- `POST /api/ai/doubt` - Get AI answer to a doubt

### Study Plans
- `GET /api/study-plans` - List user's study plans
- `GET /api/study-plans/[id]` - Get study plan details
- `DELETE /api/study-plans/[id]` - Delete study plan

### Mock Tests
- `POST /api/tests/generate` - Generate a new mock test
- `GET /api/tests/[testId]` - Get test details
- `POST /api/tests/[testId]/submit` - Submit test answers

### Subscription
- `POST /api/subscription/upgrade` - Upgrade to Pro (stubbed)

### Admin Panel (Admin Only)
- `GET /api/admin/providers` - List all AI providers
- `POST /api/admin/providers` - Create new provider
- `GET /api/admin/providers/[id]` - Get provider details
- `PATCH /api/admin/providers/[id]` - Update provider
- `DELETE /api/admin/providers/[id]` - Delete provider
- `GET /api/admin/providers/[id]/keys` - List provider keys
- `POST /api/admin/providers/[id]/keys` - Add API key
- `PATCH /api/admin/providers/[id]/keys/[keyId]` - Update key
- `DELETE /api/admin/providers/[id]/keys/[keyId]` - Delete key
- `GET /api/admin/features` - List feature configurations
- `POST /api/admin/features` - Update feature configuration
- `GET /api/admin/health` - Get system health status

## Database Schema

- **User**: User accounts with subscription status and role (user/admin)
- **Test**: Generated mock tests
- **TestQuestion**: Questions in a test
- **TestAttempt**: User test attempts with scores and analytics
- **StudyPlan**: Saved study plans with full plan data
- **PasswordResetToken**: Password reset tokens with expiration
- **AiProvider**: AI provider configurations (OpenAI, Gemini, Claude, etc.)
- **AiProviderKey**: Encrypted API keys for providers (up to 10 per provider)
- **AiFeatureConfig**: Feature-level AI provider configuration with primary/secondary failover

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL of your application |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js |
| `ENCRYPTION_KEY` | 32-byte key for encrypting API keys at rest |
| `OPENAI_API_KEY` | OpenAI API key (legacy, now managed via admin panel) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID (optional fallback, now managed via admin panel) |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret (optional fallback, now managed via admin panel) |

**Note:** Razorpay credentials are now managed via the Admin Panel > Payment Config. Environment variables are optional fallback values.

## Development

- **Database Studio**: `npm run db:studio` (opens Prisma Studio)
- **Database Push**: `npm run db:push` (sync schema to database)
- **Generate Prisma Client**: `npm run db:generate`
- **Run Tests**: `npm test`
- **Run Tests with UI**: `npm run test:ui`
- **Test Coverage**: `npm run test:coverage`

## Rate Limiting

The application includes rate limiting to prevent abuse:

- **Auth endpoints**: 5 requests per minute
- **AI endpoints**: 20 requests per minute
- **General API**: 10 requests per minute

Rate limits are based on IP address and use in-memory LRU cache. For production, consider using Redis-based rate limiting.

## Testing

The project includes a basic test suite using Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Current test coverage includes:
- Rate limiting functionality
- Encryption/decryption utilities
- API route validation

## Production Deployment

1. Set up a PostgreSQL database (e.g., on Vercel Postgres, Supabase, or Railway)
2. Update `DATABASE_URL` in your production environment
3. Set all required environment variables
4. Run database migrations: `npx prisma migrate deploy`
5. Deploy to Vercel, Railway, or your preferred platform

## Admin Panel

The admin panel provides comprehensive management of AI providers and configurations:

1. **Access**: Navigate to `/admin/dashboard` (requires admin role)
2. **Create Admin User**: Update a user's role to "admin" in the database:
   ```sql
   UPDATE "User" SET role = 'admin' WHERE email = 'admin@example.com';
   ```

3. **Features**:
   - **Providers**: Manage AI providers (OpenAI, Gemini, Claude, etc.)
   - **API Keys**: Add up to 10 encrypted API keys per provider with priority-based rotation
   - **Feature Config**: Set primary/secondary providers for each feature with automatic failover
   - **Health Monitoring**: Track key health, failures, and system status
   - **Payment Config**: Manage Razorpay payment gateway credentials (encrypted storage)

4. **AI Orchestrator**:
   - All AI calls go through the central orchestrator
   - Automatic failover: Primary → Secondary provider
   - Key rotation: Tries keys in priority order, marks failures
   - Health tracking: Monitors key status and error rates

## Recent Updates (High Priority MVP Blockers)

✅ **Study Plan Persistence**: Study plans are now saved to the database and can be viewed/managed
✅ **Password Reset**: Complete forgot password and reset password flow
✅ **Rate Limiting**: API rate limiting implemented to prevent abuse
✅ **Error Logging**: Structured logging system for better error tracking
✅ **Test Suite**: Basic test coverage with Vitest

## Payment Integration (TODO)

The subscription upgrade is currently stubbed. To integrate real payments:

1. Set up Razorpay account
2. Install Razorpay SDK: `npm install razorpay`
3. Create payment intent in `/api/subscription/upgrade`
4. Handle webhook for payment confirmation
5. Update user subscription status on successful payment

## License

MIT
