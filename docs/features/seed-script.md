# Seed Script Documentation

## Related Documentation

- [Quick Start Guide](../getting-started/quick-start.md) - Development setup

## Overview

This script populates your database with comprehensive dummy data for testing and development.

## Features

The seed script creates:

### Users (14 total)
- **1 Admin User**: `admin@crackgov.ai` / `admin123`
- **5 Free Plan Users**: `free1@example.com` to `free5@example.com` / `password123`
- **5 Pro Plan Users**: `pro1@example.com` to `pro5@example.com` / `password123`
- **3 Topper Plan Users**: `topper1@example.com` to `topper3@example.com` / `password123`

### Data Created
- **200 Questions** in Question Bank across different exams, subjects, and topics
- **100 Previous Year Questions** (PYQ) for various exams and years
- **Tests & Test Attempts**: 3-10 tests per user with realistic scores and analytics
- **Study Plans**: Personalized study plans for each user
- **Flashcards**: 10-40 flashcards per pro/topper user
- **Daily Tasks**: 7 days of tasks per user (some completed, some pending)
- **Study Streaks**: 1-15 day streaks for each user
- **Leaderboard Entries**: Daily, weekly, monthly, and all-time entries
- **Notifications**: 2-7 notifications per user
- **Bookmarks**: 3-13 bookmarks per user
- **Notes**: 2-10 notes per user
- **Subscription Usage**: Current month usage data for all users
- **PYQ Analysis**: Analysis data for pro/topper users
- **Study Reminders**: Reminders for upcoming exams
- **Question Attempts**: Practice attempts on question bank

## Usage

### Prerequisites
1. Make sure your database is set up and migrations are applied:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. Install dependencies (if tsx is not installed):
   ```bash
   npm install
   ```

### Run the Seed Script

```bash
npm run seed
```

Or directly with Prisma:
```bash
npx prisma db seed
```

### What the Script Does

1. **Cleans existing data** (optional - you can comment out the cleanup section if you want to keep existing data)
2. Creates users with different subscription plans
3. Generates question bank with diverse questions
4. Creates previous year questions
5. Generates tests and test attempts with realistic scores
6. Creates study plans, flashcards, tasks, and other user data
7. Populates analytics and tracking data

## Login Credentials

After running the seed script, you can login with:

| User Type | Email | Password |
|-----------|-------|----------|
| Admin | `admin@crackgov.ai` | `admin123` |
| Free User | `free1@example.com` | `password123` |
| Pro User | `pro1@example.com` | `password123` |
| Topper User | `topper1@example.com` | `password123` |

## Customization

You can modify the seed script (`prisma/seed.ts`) to:
- Change the number of users created
- Adjust the amount of data generated
- Modify question templates
- Change exam types, subjects, or topics
- Adjust date ranges for historical data

## Notes

- The script uses realistic data distributions
- Free users have limited data (1 study plan, fewer tests)
- Pro/Topper users have more comprehensive data
- All passwords are hashed using bcrypt
- Dates are randomized within the last 30-60 days for realistic timelines

## Troubleshooting

If you encounter errors:
1. Make sure your database is running
2. Check that all migrations are applied
3. Verify your `DATABASE_URL` in `.env` is correct
4. Ensure Prisma client is generated: `npx prisma generate`

