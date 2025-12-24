# Quick Start: Fixing Redis Connection Error

## The Problem
Your app is trying to connect to Redis but it's not running, causing `ECONNREFUSED` errors.

## Quick Fix (30 seconds)

### Step 1: Update your `.env` file

Add this line to your `.env` file:

```env
DISABLE_REDIS=true
```

### Step 2: Restart the dev server

Stop the current server (Ctrl+C) and run:

```bash
npm run dev
```

## Done!

Your app should now start without Redis errors.

## What This Does

- Disables Redis connection attempts
- Uses in-memory fallbacks for caching
- All features work, just without persistent caching

## When You Need Redis

Redis is useful for:
- Persistent caching across server restarts
- Rate limiting
- Session storage
- Background job queues

### To Enable Redis Later:

**Option 1: Docker (Easiest)**
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Option 2: WSL2 + Ubuntu**
```bash
wsl --install -d Ubuntu
# Then in Ubuntu:
sudo apt install redis-server -y
sudo service redis-server start
```

Then remove `DISABLE_REDIS=true` from your `.env` file.

## Troubleshooting

If you still see errors:

1. Make sure `.env` file is in the project root
2. Verify `DISABLE_REDIS=true` is on its own line
3. Restart the dev server completely
4. Check for any `.env.local` file that might override settings

## Need Help?

Check these files:
- `REDIS_SETUP.md` - Detailed Redis setup guide
- `.env.template` - Complete environment variables template
