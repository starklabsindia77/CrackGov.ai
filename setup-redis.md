# Redis Setup Guide for Windows

## Option 1: Using WSL2 (Recommended - You have this!)

### Install Redis in WSL2:

1. Open WSL2 terminal (Ubuntu):
```bash
wsl
```

2. Update packages and install Redis:
```bash
sudo apt update
sudo apt install redis-server -y
```

3. Start Redis server:
```bash
sudo service redis-server start
```

4. Verify Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

5. To make Redis start automatically:
```bash
sudo systemctl enable redis-server
```

### Keep Redis Running:
- Redis will run in WSL2 and be accessible from Windows at `localhost:6379`
- To check status: `sudo service redis-server status`
- To stop: `sudo service redis-server stop`
- To restart: `sudo service redis-server restart`

---

## Option 2: Using Docker (Alternative)

If you prefer Docker:

1. Install Docker Desktop for Windows
2. Run Redis container:
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

3. Verify:
```bash
docker ps
```

---

## Option 3: Windows Native (Memurai - Redis Alternative)

1. Download Memurai from: https://www.memurai.com/
2. Install and run as Windows service
3. It will automatically run on port 6379

---

## Quick Start (Recommended):

**Run these commands in PowerShell:**

```powershell
# Open WSL
wsl

# Then in WSL terminal, run:
sudo apt update && sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping

# Keep this terminal open or exit and Redis will keep running
```

## Verify Connection:

After starting Redis, run your Next.js app:
```bash
npm run dev
```

The connection error should be gone!

## Troubleshooting:

If you still get connection errors:

1. Check if Redis is running:
```bash
wsl redis-cli ping
```

2. Check Redis port:
```bash
wsl sudo netstat -tlnp | grep 6379
```

3. Restart Redis:
```bash
wsl sudo service redis-server restart
```
