# CrackGov.ai - AI-Powered Government Exam Preparation

An MVP SaaS web application for AI-powered government exam preparation built with Next.js 14, TypeScript, and OpenAI.

## Features

- 🔐 **Authentication**: User registration and login with NextAuth.js
- 📚 **AI Study Plans**: Generate personalized study plans based on exam type, target date, and weak areas
- 📝 **Mock Tests**: Take AI-generated 20-question mock tests with detailed results and topic-wise analysis
- 💬 **AI Doubt Chat**: Ask questions and get step-by-step explanations from an AI tutor
- 📊 **Dashboard**: Overview of study progress and quick access to all features
- 💳 **Subscription**: Stubbed subscription system (ready for Razorpay integration)
- 🛠️ **Admin Panel**: Comprehensive admin system for managing AI providers, API keys, and feature configurations
- 🔄 **AI Orchestrator**: Central AI service with automatic failover, key rotation, and health tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript**
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials provider)
- **AI**: OpenAI GPT-4o-mini
- **Data Fetching**: SWR

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- OpenAI API key

## Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory (see `.env.example`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/crackgov"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ENCRYPTION_KEY="your-32-byte-encryption-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

   Generate secure keys:
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate ENCRYPTION_KEY (for API key encryption)
   openssl rand -base64 32
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth configuration
│   │   ├── ai/            # AI endpoints (study-plan, doubt)
│   │   ├── tests/         # Mock test endpoints
│   │   └── subscription/  # Subscription endpoints
│   ├── app/               # Protected app routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── study-plan/   # Study plan generator
│   │   ├── tests/         # Mock test pages
│   │   ├── doubts/        # Doubt chat
│   │   └── upgrade/       # Subscription upgrade
│   ├── auth/              # Auth pages (login, register)
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/              # App layout components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── openai.ts           # OpenAI client
│   ├── auth.ts             # Auth utilities
│   └── utils.ts            # Utility functions
└── types/                   # TypeScript type definitions
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### AI Features
- `POST /api/ai/study-plan` - Generate AI study plan
- `POST /api/ai/doubt` - Get AI answer to a doubt

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

## Development

- **Database Studio**: `npm run db:studio` (opens Prisma Studio)
- **Database Push**: `npm run db:push` (sync schema to database)
- **Generate Prisma Client**: `npm run db:generate`

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

4. **AI Orchestrator**:
   - All AI calls go through the central orchestrator
   - Automatic failover: Primary → Secondary provider
   - Key rotation: Tries keys in priority order, marks failures
   - Health tracking: Monitors key status and error rates

## Payment Integration (TODO)

The subscription upgrade is currently stubbed. To integrate real payments:

1. Set up Razorpay account
2. Install Razorpay SDK: `npm install razorpay`
3. Create payment intent in `/api/subscription/upgrade`
4. Handle webhook for payment confirmation
5. Update user subscription status on successful payment

## License

MIT

