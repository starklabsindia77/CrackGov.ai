# CrackGov.ai - Complete Platform Documentation

**Version:** 2.0  
**Last Updated:** November 2024  
**Platform Type:** AI-Powered Government Exam Preparation SaaS

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Core Features](#core-features)
3. [AI Capabilities](#ai-capabilities)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Admin Panel](#admin-panel)
8. [User Features](#user-features)
9. [Setup & Installation](#setup--installation)
10. [Configuration](#configuration)
11. [Security](#security)
12. [Scalability](#scalability)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Monitoring & Logging](#monitoring--logging)

---

## Platform Overview

CrackGov.ai is a comprehensive AI-powered SaaS platform designed for government exam preparation. It provides students with personalized study plans, AI-generated mock tests, full-length exams, doubt solving, notes generation, and comprehensive analytics to help them prepare effectively for various government examinations.

### Key Highlights

- **AI-First Approach**: All content generation powered by advanced AI models (OpenAI, Gemini, Claude)
- **Multi-Provider Support**: Automatic failover between AI providers for reliability
- **Enterprise-Grade**: Built for scale with Redis caching, message queues, and distributed systems
- **Comprehensive Analytics**: Track performance, identify weak areas, and get personalized recommendations
- **Admin Control**: Full administrative control over AI providers, content, and system configuration

---

## Core Features

### 1. Authentication & User Management

- **User Registration**: Email-based registration with email verification
- **Login System**: Secure authentication using NextAuth.js
- **Password Management**: 
  - Forgot password functionality
  - Secure password reset with token-based flow
  - Password change functionality
- **User Roles**: 
  - Regular users (free, pro, topper subscriptions)
  - Admin users (full system access)
- **Onboarding**: User onboarding flow with preference collection

### 2. AI Study Plans

- **Personalized Generation**: Create study plans based on:
  - Exam type (UPSC, SSC, Banking, Railways, State PSC)
  - Target exam date
  - Available hours per day
  - Weak areas identification
- **Plan Structure**: 
  - Weekly breakdown
  - Daily tasks and topics
  - Time allocation
  - Revision schedules
- **Persistence**: Save and manage multiple study plans
- **Progress Tracking**: Track completion status

### 3. Mock Tests

- **AI-Generated Tests**: Generate 20-question mock tests instantly
- **Exam-Specific**: Tests aligned with specific exam patterns
- **Detailed Results**: 
  - Score and accuracy
  - Topic-wise breakdown
  - Question-wise analysis
  - Correct/incorrect answers with explanations
- **Performance Analytics**: Track improvement over time

### 4. AI Exam Generator (NEW)

- **Full-Length Exams**: Generate complete exams following government exam guidelines
- **Exam Templates**: Pre-configured templates for major exams (UPSC Prelims, SSC CGL, Banking PO, etc.)
- **Customizable**: 
  - Total questions
  - Time limits
  - Section-wise distribution
  - Marking schemes (positive/negative marking)
  - Difficulty distribution
- **Real-Time Exam Taking**: 
  - Timer functionality
  - Question navigation
  - Answer saving
  - Auto-submit on expiry
- **Comprehensive Results**: 
  - Score calculation with marking scheme
  - Topic-wise performance
  - Section-wise breakdown
  - AI-generated analysis and recommendations
  - Performance comparison

### 5. AI Doubt Chat

- **Text-Based Doubts**: Ask questions and get step-by-step explanations
- **Image-Based Doubts**: Upload images of questions/problems for analysis (Pro/Topper plans)
- **Exam-Focused**: Answers tailored to specific exam preparation
- **Unlimited Access**: Available for Pro/Topper subscribers

### 6. AI Notes Generator

- **Short Notes**: Concise summaries with key points
- **Long Notes**: Comprehensive notes with multiple sections, examples, and practice questions (Topper plan)
- **Customizable**: 
  - Include/exclude formulas
  - Include/exclude examples
  - Topic-specific generation
- **Markdown Format**: Well-formatted, exam-focused content
- **Save & Organize**: Notes saved to user's library

### 7. Question Bank

- **Comprehensive Library**: Large repository of questions
- **Advanced Filtering**: 
  - By exam type
  - By subject/topic
  - By difficulty level
  - By source (Previous Year, AI Generated)
- **Search Functionality**: Full-text search across questions
- **Practice Mode**: Practice individual questions with instant feedback
- **Performance Tracking**: Track accuracy per question

### 8. Custom Test Builder

- **Flexible Configuration**: 
  - Select number of questions (5-50)
  - Choose difficulty levels
  - Filter by subjects
  - Select specific topics
  - Set time limits
- **Question Bank Integration**: Questions sourced from question bank
- **Instant Generation**: Create tests instantly from available questions

### 9. Previous Year Questions (PYQ)

- **Year-Wise Access**: Access questions by exam year
- **Performance Analysis**: 
  - Topic-wise breakdown
  - Difficulty-wise analysis
  - Weak/strong area identification
- **AI Recommendations**: Personalized improvement suggestions
- **Pro/Topper Feature**: Available in premium plans

### 10. Flashcards

- **Spaced Repetition**: AI-powered spaced repetition algorithm
- **Custom Flashcards**: Create your own flashcards
- **AI-Generated Flashcards**: Generate flashcards from topics
- **Review System**: Smart review scheduling based on performance
- **Progress Tracking**: Track mastery levels

### 11. Study Groups

- **Community Learning**: Join or create study groups
- **Group Posts**: Share questions, notes, and discussions
- **Public/Private Groups**: Control group visibility
- **Member Management**: Admin controls for group management

### 12. Leaderboards

- **Multiple Periods**: Daily, weekly, monthly, all-time leaderboards
- **Exam-Specific**: Leaderboards for specific exams
- **Ranking System**: See your position among peers
- **Performance Metrics**: Points based on tests, accuracy, consistency

### 13. Analytics & Progress Tracking

- **Dashboard Overview**: 
  - Study progress
  - Test performance trends
  - Weak areas identification
  - Streak tracking
- **Detailed Analytics**: 
  - Topic-wise performance
  - Time spent analysis
  - Improvement trends
  - Comparative analysis

### 14. Notifications

- **Real-Time Notifications**: Server-Sent Events (SSE) for instant updates
- **Notification Types**: 
  - Test results
  - Study reminders
  - System announcements
  - Achievement unlocks
- **Notification Center**: Centralized notification management

### 15. Bookmarks & Notes

- **Bookmark System**: Save questions, tests, study plans
- **Personal Notes**: Add notes to any content
- **Organization**: Tag and categorize saved items

### 16. Subscription Management

- **Tiered Plans**: 
  - Free: Basic features
  - Pro: Advanced features, unlimited doubts
  - Topper: All features, priority AI models
- **Razorpay Integration**: Secure payment processing
- **Usage Tracking**: Track feature usage per subscription tier
- **Upgrade/Downgrade**: Flexible plan management

### 17. Content Management System (CMS)

- **Page Management**: Create and manage static pages
- **FAQ Management**: Manage frequently asked questions
- **Announcements**: System-wide announcements
- **Banners**: Marketing banners and promotions
- **Drag-and-Drop**: Intuitive content organization

---

## AI Capabilities

### AI Orchestrator System

The platform uses a centralized AI orchestrator that manages all AI interactions:

#### Supported Providers

1. **OpenAI**
   - Models: GPT-4o-mini, GPT-4, GPT-3.5-turbo
   - Primary use: General AI tasks

2. **Google Gemini**
   - Models: Gemini 2.0 Flash Lite (default), Gemini 1.5 Pro, Gemini Pro
   - Primary use: Text generation, analysis
   - Default: gemini-2.0-flash-lite (fast and cost-effective)

3. **Anthropic Claude**
   - Models: Claude 3 Opus, Claude 3 Sonnet
   - Primary use: Complex reasoning, analysis

#### Features

- **Multi-Provider Support**: Configure multiple providers per feature
- **Automatic Failover**: Primary → Secondary → Tertiary provider fallback
- **Key Rotation**: Up to 10 API keys per provider with priority-based rotation
- **Health Tracking**: 
  - Monitor key health status
  - Track failure rates
  - Automatic retry logic
  - Key status: healthy, failing, disabled
- **Per-Feature Configuration**: Each AI feature can have different provider settings
- **Environment Variable Fallback**: For Gemini, if all database keys fail, automatically falls back to `GEMINI_API_KEY` or `GOOGLE_GEMINI_API_KEY` from `.env` file

#### AI Features

1. **STUDY_PLAN**: Generate personalized study plans
2. **MOCK_TEST**: Generate 20-question mock tests
3. **EXAM_GENERATOR**: Generate full-length exams with guidelines
4. **DOUBT_CHAT**: Answer student doubts with explanations
5. **NOTES_GENERATOR**: Generate study notes (short/long format)

#### Configuration

Configure AI providers via Admin Panel → Features:
- Set primary provider (e.g., Gemini)
- Set secondary provider (e.g., OpenAI)
- Set tertiary provider (e.g., Claude)
- Configure per-feature settings (temperature, max tokens, etc.)

---

## Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (distributed caching)
- **Queue**: BullMQ (background job processing)
- **Authentication**: NextAuth.js
- **Data Fetching**: SWR
- **Testing**: Vitest
- **Monitoring**: Sentry + Prometheus

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Web App    │  │   API Routes │  │  Admin Panel │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  PostgreSQL  │ │    Redis    │ │   BullMQ    │
│   Database   │ │    Cache    │ │   Workers   │
└──────────────┘ └─────────────┘ └─────────────┘
        │
        │
┌───────▼──────────────────────────────────────┐
│         AI Orchestrator                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OpenAI   │  │ Gemini   │  │ Claude   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────────────────────────────────┘
```

### Scalability Features

- **Database Read Replicas**: Separate read/write operations
- **Redis Caching**: Distributed caching layer
- **Message Queues**: Async processing for AI, email, leaderboard updates
- **Rate Limiting**: Distributed Redis-based rate limiting
- **DataLoader**: Batch loading to reduce database queries
- **Cursor-Based Pagination**: Efficient pagination for large datasets
- **Server-Sent Events**: Real-time notifications without polling

---

## Database Schema

### Core Models

#### User
- User accounts with authentication
- Subscription status (free, pro, topper)
- Role (user, admin)
- Preferences and settings

#### Test
- Generated mock tests
- Exam type
- Time limits
- Questions

#### TestQuestion
- Questions in a test
- Options, correct answer
- Explanations
- Topics

#### TestAttempt
- User test attempts
- Scores and accuracy
- Detailed results
- Topic breakdown

#### StudyPlan
- Saved study plans
- Exam type, target date
- Plan structure (JSON)
- Weak topics

#### GeneratedExam (NEW)
- AI-generated full-length exams
- Based on exam templates
- Questions (JSON)
- Status tracking

#### ExamTemplate (NEW)
- Exam configuration templates
- Sections, marking scheme
- Difficulty distribution
- Guidelines and instructions

#### ExamSession (NEW)
- Active exam sessions
- Timer tracking
- Answer state
- Expiry management

#### ExamAttempt (NEW)
- Completed exam attempts
- Comprehensive results
- Topic/section breakdown
- AI analysis

#### QuestionBank
- Centralized question repository
- Metadata (exam, topic, difficulty)
- Usage tracking

#### AiProvider
- AI provider configurations
- Status and settings

#### AiProviderKey
- Encrypted API keys
- Priority-based rotation
- Health tracking

#### AiFeatureConfig
- Feature-level provider configuration
- Primary/secondary/tertiary providers
- Per-feature settings

#### Flashcard
- User flashcards
- Spaced repetition data
- Review scheduling

#### StudyGroup
- Study groups
- Members and posts

#### LeaderboardEntry
- Leaderboard rankings
- Period-based (daily, weekly, monthly)
- Exam-specific

#### Notification
- User notifications
- Real-time updates

#### Bookmark
- Saved items
- Organization

#### Note
- User notes
- Content and tags

#### SubscriptionUsage
- Feature usage tracking
- Monthly limits
- Subscription tiers

#### PyqAnalysis
- Previous year question analysis
- Performance breakdown
- Recommendations

### Relationships

- User → Tests, StudyPlans, GeneratedExams, ExamSessions, ExamAttempts
- GeneratedExam → ExamTemplate
- ExamSession → GeneratedExam, User
- ExamAttempt → GeneratedExam, User
- Test → TestQuestions, TestAttempts
- QuestionBank → QuestionAttempts

---

## API Reference

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP

### AI Features

- `POST /api/ai/study-plan` - Generate study plan
- `POST /api/ai/doubt` - Text-based doubt solving
- `POST /api/ai/doubt/image` - Image-based doubt solving
- `POST /api/ai/notes/generate` - Generate notes

### Exams (NEW)

- `GET /api/exams/templates` - Get available exam templates
- `POST /api/exams/generate` - Generate full-length exam
- `GET /api/exams/[examId]` - Get exam details
- `POST /api/exams/[examId]/start` - Start exam session
- `PATCH /api/exams/[examId]/update` - Update exam session (answers, timer)
- `POST /api/exams/[examId]/submit` - Submit exam
- `GET /api/exams/[examId]/results/[attemptId]` - Get exam results

### Tests

- `POST /api/tests/generate` - Generate mock test
- `GET /api/tests/[testId]` - Get test details
- `POST /api/tests/[testId]/submit` - Submit test
- `POST /api/tests/custom` - Create custom test
- `POST /api/tests/full-length` - Generate full-length test
- `POST /api/tests/section-wise` - Generate section-wise test

### Study Plans

- `GET /api/study-plans` - List user's study plans
- `GET /api/study-plans/[id]` - Get study plan details
- `DELETE /api/study-plans/[id]` - Delete study plan

### Question Bank

- `GET /api/question-bank` - Browse questions (with filters)
- `GET /api/question-bank/[id]` - Get question details
- `POST /api/question-bank/[id]/attempt` - Record attempt

### Flashcards

- `GET /api/flashcards` - List flashcards
- `POST /api/flashcards` - Create flashcard
- `POST /api/flashcards/generate` - Generate flashcards
- `POST /api/flashcards/[id]/review` - Review flashcard

### PYQ Analysis

- `POST /api/pyq/analyze` - Analyze previous year questions

### Notifications

- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/[id]` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/stream` - SSE stream for real-time updates

### Subscription

- `POST /api/subscription/upgrade` - Upgrade subscription
- `POST /api/subscription/create-order` - Create payment order
- `POST /api/subscription/verify-payment` - Verify payment

### Admin Panel

#### Providers
- `GET /api/admin/providers` - List providers
- `POST /api/admin/providers` - Create provider
- `GET /api/admin/providers/[id]` - Get provider
- `PATCH /api/admin/providers/[id]` - Update provider
- `DELETE /api/admin/providers/[id]` - Delete provider
- `GET /api/admin/providers/[id]/keys` - List keys
- `POST /api/admin/providers/[id]/keys` - Add key
- `PATCH /api/admin/providers/[id]/keys/[keyId]` - Update key
- `DELETE /api/admin/providers/[id]/keys/[keyId]` - Delete key

#### Features
- `GET /api/admin/features` - List feature configs
- `POST /api/admin/features` - Update feature config
- `GET /api/admin/features/[featureCode]` - Get feature config
- `PATCH /api/admin/features/[featureCode]` - Update feature config

#### Exam Templates (NEW)
- `GET /api/admin/exam-templates` - List templates
- `POST /api/admin/exam-templates` - Create template
- `GET /api/admin/exam-templates/[id]` - Get template
- `PATCH /api/admin/exam-templates/[id]` - Update template
- `DELETE /api/admin/exam-templates/[id]` - Delete template

#### CMS
- `GET /api/admin/cms/pages` - List pages
- `POST /api/admin/cms/pages` - Create page
- `PATCH /api/admin/cms/pages/[id]` - Update page
- `DELETE /api/admin/cms/pages/[id]` - Delete page
- `POST /api/admin/cms/reorder` - Reorder pages

#### Analytics
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/analytics/revenue` - Revenue analytics

#### Health
- `GET /api/admin/health` - System health status

---

## Admin Panel

### Access

Navigate to `/admin/dashboard` (requires admin role)

### Create Admin User

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'admin@example.com';
```

### Features

#### 1. Providers Management
- Create/edit/delete AI providers
- Configure provider settings
- Manage API keys (up to 10 per provider)
- Set key priorities
- Monitor key health

#### 2. Feature Configuration
- Configure AI providers per feature
- Set primary/secondary/tertiary providers
- Configure per-feature settings (temperature, max tokens)
- Features: STUDY_PLAN, MOCK_TEST, EXAM_GENERATOR, DOUBT_CHAT, NOTES_GENERATOR

#### 3. Exam Templates (NEW)
- Create exam templates for different government exams
- Configure:
  - Total questions
  - Time limits
  - Sections and distribution
  - Marking schemes
  - Difficulty distribution
  - Guidelines and instructions
- Activate/deactivate templates

#### 4. Question Bank Management
- Add/edit/delete questions
- Bulk import
- Manage question metadata

#### 5. CMS Management
- Manage pages (landing, about, terms, privacy)
- Manage FAQs
- Manage announcements
- Manage banners
- Drag-and-drop reordering

#### 6. Payment Configuration
- Manage Razorpay credentials (encrypted)
- Configure payment gateway settings

#### 7. User Management
- View all users
- Manage user roles
- View user activity
- Manage subscriptions

#### 8. Analytics Dashboard
- User metrics
- Revenue analytics
- Feature usage statistics
- System health monitoring

---

## User Features

### Dashboard (`/app/dashboard`)
- Overview of study progress
- Quick access to all features
- Recent activity
- Performance summary

### Study Plan (`/app/study-plan`)
- Generate new study plans
- View saved study plans
- Track progress

### Tests (`/app/tests`)
- Generate mock tests
- Take tests
- View test history
- Performance analysis

### Exams (NEW) (`/app/exams`)
- Browse available exam templates
- Generate full-length exams
- Take exams with timer
- View detailed results
- Performance analysis

### Doubts (`/app/doubts`)
- Ask text-based questions
- Upload images for analysis
- View answer history

### Question Bank (`/app/question-bank`)
- Browse questions
- Practice questions
- Filter and search

### Flashcards (`/app/flashcards`)
- Review flashcards
- Create custom flashcards
- Generate flashcards from topics

### Study Groups (`/app/study-groups`)
- Join/create groups
- Participate in discussions
- Share content

### Leaderboard (`/app/leaderboard`)
- View rankings
- Filter by period
- Exam-specific leaderboards

### Profile (`/app/profile`)
- Update profile
- View subscription
- Manage settings

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- npm/yarn

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd CrackGov.ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/crackgov"
   DATABASE_READ_REPLICA_URL="postgresql://user:password@localhost:5432/crackgov"
   REDIS_URL="redis://localhost:6379"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   ENCRYPTION_KEY="generate-with-openssl-rand-base64-32"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start Redis**
   ```bash
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

6. **Start Workers** (separate terminal)
   ```bash
   tsx scripts/start-workers.ts
   ```

7. **Start Development Server**
   ```bash
   npm run dev
   ```

8. **Access Application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/dashboard

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DATABASE_READ_REPLICA_URL` | Read replica URL (optional) | No |
| `REDIS_URL` | Redis connection string | Yes |
| `NEXTAUTH_URL` | Base URL of application | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `ENCRYPTION_KEY` | 32-byte encryption key | Yes |
| `OPENAI_API_KEY` | OpenAI API key (legacy) | No* |
| `RESEND_API_KEY` | Resend email API key | No |
| `SENDGRID_API_KEY` | SendGrid API key | No |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key | No |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret | No |
| `AWS_S3_BUCKET` | S3 bucket name | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | No |
| `SENTRY_DSN` | Sentry DSN | No |

*AI API keys are now managed via Admin Panel

### Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
openssl rand -base64 32
```

---

## Security

### Security Features

1. **Authentication**
   - NextAuth.js with secure session management
   - Password hashing with bcrypt
   - Token-based password reset

2. **API Security**
   - Rate limiting (Redis-based)
   - CSRF protection
   - Input sanitization and validation
   - SQL injection prevention (Prisma ORM)

3. **Data Protection**
   - API key encryption at rest
   - Secure file uploads
   - Environment variable validation

4. **Headers**
   - Content Security Policy (CSP)
   - HSTS
   - X-Frame-Options
   - X-Content-Type-Options

5. **Access Control**
   - Role-based access control (RBAC)
   - Admin-only endpoints
   - User data isolation

---

## Scalability

### Implemented Features

1. **Database**
   - Read replicas for read-heavy operations
   - Indexes for efficient queries
   - Connection pooling

2. **Caching**
   - Redis distributed cache
   - TTL-based cache invalidation
   - Cache warming strategies

3. **Background Jobs**
   - BullMQ for async processing
   - Worker processes
   - Job retry logic

4. **Rate Limiting**
   - Distributed Redis-based rate limiting
   - Per-endpoint limits
   - IP-based tracking

5. **Pagination**
   - Cursor-based pagination
   - Efficient for large datasets

6. **Real-Time**
   - Server-Sent Events (SSE)
   - No polling required

---

## Deployment

### Docker Deployment

```bash
docker-compose up -d
```

### Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Start Application**
   ```bash
   npm start
   ```

### Production Checklist

- [ ] Set all environment variables
- [ ] Configure database (production)
- [ ] Set up Redis (production)
- [ ] Configure AI providers via Admin Panel
- [ ] Set up monitoring (Sentry)
- [ ] Configure email service
- [ ] Set up file storage (S3/R2)
- [ ] Configure payment gateway
- [ ] Set up SSL certificates
- [ ] Configure CDN (if applicable)
- [ ] Set up backup strategy

---

## Testing

### Test Suite

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

### Test Coverage

- Rate limiting
- Encryption/decryption
- API validation
- Authentication flows

---

## Monitoring & Logging

### Logging

- Structured logging with context
- Error tracking with Sentry
- API error logging
- Performance monitoring

### Health Checks

- `GET /api/health` - System health
- `GET /api/admin/health` - Detailed health (admin only)

### Monitoring

- Sentry for error tracking
- Prometheus for metrics (planned)
- Custom analytics dashboard

---

## Support & Resources

### Documentation

- [Quick Start Guide](./getting-started/quick-start.md)
- [Deployment Guide](./deployment/deployment-guide.md)
- [Implementation Summary](./implementation/implementation-summary.md)
- [Feature Documentation](./features/)

### API Documentation

- OpenAPI spec: `openapi.yaml`
- Swagger UI: Available via OpenAPI viewer

---

## License

MIT License

---

## Changelog

### Version 2.0 (November 2024)

- ✅ Added AI Exam Generator feature
- ✅ Added tertiary provider support
- ✅ Enhanced exam templates system
- ✅ Improved exam session management
- ✅ Added comprehensive exam results analysis

### Version 1.0 (Initial Release)

- ✅ Core authentication
- ✅ AI Study Plans
- ✅ Mock Tests
- ✅ AI Doubt Chat
- ✅ Notes Generator
- ✅ Question Bank
- ✅ Admin Panel
- ✅ CMS System

---

**For questions or support, please refer to the documentation or contact the development team.**

