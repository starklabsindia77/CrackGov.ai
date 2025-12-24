# Quick Fix: Disable Redis for Development

## The Issue
Your app is trying to connect to Redis at `localhost:6379` but Redis isn't running.

## Solution 1: Disable Redis (Quickest - Recommended for now)

Add this line to your `.env` file:

```env
DISABLE_REDIS=true
```

This will make the app work without Redis. Some caching features will be disabled but the app will run fine.

## Solution 2: Install Redis via Docker

### Prerequisites:
1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop

### Run Redis:
```bash
docker run -d --name redis-crackgov -p 6379:6379 --restart unless-stopped redis:alpine
```

### Verify:
```bash
docker ps
```

### Stop Redis:
```bash
docker stop redis-crackgov
```

### Start Redis again:
```bash
docker start redis-crackgov
```

## Solution 3: Install WSL2 + Ubuntu + Redis

### Step 1: Install Ubuntu on WSL2
```powershell
wsl --install -d Ubuntu
```

### Step 2: After Ubuntu installs, open Ubuntu terminal and run:
```bash
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
```

### Step 3: Verify:
```bash
redis-cli ping
# Should return: PONG
```

## Solution 4: Use Memurai (Windows Native Redis Alternative)

1. Download from: https://www.memurai.com/get-memurai
2. Install (it's free for development)
3. It automatically runs on port 6379

## Recommended Approach for Now:

**Add to your `.env` file:**
```env
DISABLE_REDIS=true
```

Then restart your dev server:
```bash
npm run dev
```

Your app should start without Redis errors!

## When to Enable Redis:

Redis is useful for:
- Caching API responses
- Rate limiting
- Session storage
- Queue management

For development, you can work without it. Enable it later when you need these features.

## Environment Variables:

Your `.env` file should have:

```env
# Disable Redis for local development
DISABLE_REDIS=true

# OR if you have Redis running:
# REDIS_URL=redis://localhost:6379

# Other required variables
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```
