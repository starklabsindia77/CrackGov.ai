# Quick Start Guide

This guide helps you get started with all the new features and improvements.

## Related Documentation

- [Deployment Guide](../deployment/deployment-guide.md) - Production deployment
- [Implementation Summary](../implementation/implementation-summary.md) - Implementation details

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in required values:
```bash
cp .env.example .env
```

### 3. Start Services
```bash
# Start Redis (if not using Docker)
docker run -d -p 6379:6379 redis:latest

# Start database migrations
npx prisma generate
npx prisma db push

# Start workers (in separate terminal)
npm run workers

# Start development server
npm run dev
```

## 🔒 Security Features

### Security Headers
Security headers are automatically applied via middleware. No configuration needed.

### CSRF Protection
CSRF tokens are available via `src/lib/csrf.ts`:
```typescript
import { createCsrfToken, verifyCsrfToken } from "@/lib/csrf";

// Generate token
const token = createCsrfToken();

// Verify token
const isValid = verifyCsrfToken(token);
```

### Input Sanitization
```typescript
import { sanitizeInput, sanitizeEmail, sanitizeUrl } from "@/lib/sanitize";

const clean = sanitizeInput(userInput);
const email = sanitizeEmail(userEmail);
const url = sanitizeUrl(userUrl);
```

## 📧 Email Service

### Setup Resend
1. Get API key from [Resend](https://resend.com)
2. Add to `.env`:
   ```env
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### Setup SendGrid
1. Get API key from [SendGrid](https://sendgrid.com)
2. Add to `.env`:
   ```env
   SENDGRID_API_KEY=SG.xxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

### Usage
```typescript
import { sendEmail } from "@/lib/email-service";

await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Welcome</h1>",
});
```

## 💾 File Storage

### Setup AWS S3
```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

### Setup Cloudflare R2
```env
STORAGE_PROVIDER=r2
AWS_ACCESS_KEY_ID=your-r2-key
AWS_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET=your-bucket
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

### Usage
```typescript
import { uploadFile, getFileUrl, deleteFile } from "@/lib/storage";

// Upload
const url = await uploadFile("path/to/file.pdf", buffer, "application/pdf");

// Get URL
const fileUrl = await getFileUrl("path/to/file.pdf");

// Delete
await deleteFile("path/to/file.pdf");
```

## 🔍 Search

### Universal Search API
```bash
GET /api/search?query=math&type=question&exam=UPSC&limit=20
```

### Client-side Usage
```typescript
import { universalSearch } from "@/lib/search";

const results = await universalSearch({
  query: "mathematics",
  type: "question",
  exam: "UPSC",
  limit: 20,
});
```

## 📊 Analytics

### Track Events
```typescript
import { trackEvent, trackPageView, trackFeatureUsage } from "@/lib/analytics";

// Track custom event
trackEvent("button_clicked", { button: "submit" });

// Track page view
trackPageView("/app/dashboard");

// Track feature usage
trackFeatureUsage("ai_doubt_chat", { exam: "UPSC" });
```

## 🌐 Internationalization

### Usage
```typescript
import { t, formatDate, formatCurrency } from "@/lib/i18n";

const welcome = t("welcome", "hi"); // "स्वागत है"
const date = formatDate(new Date(), "hi");
const price = formatCurrency(199, "hi");
```

## ♿ Accessibility

### Focus Management
```typescript
import { FocusManager } from "@/lib/accessibility";

// Trap focus in modal
const cleanup = FocusManager.trapFocus(modalElement);

// Restore focus
FocusManager.restoreFocus(previousElement);
```

### Screen Reader Announcements
```typescript
import { announceToScreenReader } from "@/lib/accessibility";

announceToScreenReader("Form submitted successfully");
```

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -t crackgov-ai .
docker run -p 3000:3000 --env-file .env crackgov-ai
```

## 🔄 CI/CD

GitHub Actions workflow is configured in `.github/workflows/ci.yml`.

It runs:
- Linting
- Type checking
- Tests
- Build verification
- Security scanning

## 📚 API Documentation

View API docs:
- OpenAPI spec: `openapi.yaml`
- Use Swagger UI or similar tool to view

## 🏥 Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## 📱 PWA

The app is now a Progressive Web App:
- Installable on mobile devices
- Offline support
- Service Worker for caching

## 🐛 Error Handling

Error boundaries are automatically set up. Errors are:
- Logged to console (development)
- Sent to Sentry (production)
- Displayed to users with recovery options

## 📝 Next Steps

1. **Configure Email Service**: Set up Resend or SendGrid
2. **Configure File Storage**: Set up S3 or R2
3. **Set Up CI/CD**: Configure deployment in GitHub Actions
4. **Add Translations**: Expand i18n translations
5. **Expand Tests**: Add more test coverage

For detailed information, see:
- `IMPLEMENTATION_SUMMARY.md` - All improvements
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `SCALABILITY_IMPLEMENTATION.md` - Scalability features

