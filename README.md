# SDG Knowledge System - Deployment Guide

A streamlined guide for deploying the SDG Knowledge System locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Manual Deployment](#manual-deployment)
  - [1. Database Initialization](#1-database-initialization)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
  - [5. Start Redis](#5-start-redis)
  - [6. Start the Application](#6-start-the-application)
- [Accessing the Application](#accessing-the-application)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure you have the following software installed:

- **Python 3.8+** - [Download](https://python.org)
- **Node.js 14+** - [Download](https://nodejs.org)
- **MySQL 8.0+** - [Download](https://mysql.com)
- **Redis** - [Download](https://redis.io)

---

## Project Structure

```
sdg-knowledge-system/
├── backend/                    # Django backend application
|   ├── api/
│   ├── apps/                   # Django apps
|   ├── logs/                  # Need to create this folder yourself
│   ├── sdg_backend/           # Project settings
|   ├── static/                # Need to create this folder yourself
|   ├── templates/
│   ├── requirements.txt       # Python dependencies
│   ├── manage.py             # Django management script
│   └── .env                  # Backend environment variables
├── frontend/                  # React frontend application
│   ├── src/                   # Source code
│   ├── public/                # Public assets
│   ├── package.json          # NPM dependencies
│   └── .env                  # Frontend environment variables
├── database/                  # Database files (to be created)
│   └── init.sql              # Database initialization script
├── init.zip                  # Database initialization archive
├── .env.example              # Environment variables template
└── README.md                 # This file
```

---

## Manual Deployment

### 1. Database Initialization

**Extract the database initialization file:**

```bash
# Create database directory
mkdir database

# Extract init.sql from init.zip
unzip init.zip -d database/
```

**Create MySQL database and import data:**

```bash
# Login to MySQL
mysql -u root -p
```

```sql
-- Create database with UTF-8 encoding
CREATE DATABASE sdg_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Exit MySQL
EXIT;
```

```bash
# Import initial data
mysql -u root -p --default-character-set=utf8mb4 sdg_database < database/init.sql
```

**Note:** The `init.sql` file contains only resource tables (`action_db`, `education_db`, `keyword_resources`, `sdgtargets_references`). Django-related tables will be created automatically during migration.

---

### 2. Environment Configuration

**Copy environment configuration files:**

```bash
# Copy .env.example to backend
cp .env.example backend/.env

# Copy .env.example to frontend
cp .env.example frontend/.env
```

**Edit environment files if needed:**

Make sure the database password in both `.env` files matches your MySQL configuration:

```bash
# In backend/.env and frontend/.env
DB_NAME=sdg_database
DB_USER=root
DB_PASSWORD=12345          # ⚠️ Change this to match your MySQL password
DB_HOST=127.0.0.1
DB_PORT=3306
```

```bash
# You need to create an email account yourself to use for sending registration verification codes. 
# The code shown here and in the .env.example file is for demonstration purposes only and cannot be used.
EMAIL_HOST=smtp-mail.outlook.com 
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=Contactus@sdg.unswzoo.com
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=SDG Knowledge System <Contactus@sdg.unswzoo.com>
```

---

### 3. Backend Setup

**Navigate to backend directory:**

```bash
cd backend
```

**Create Python virtual environment:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate.bat

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Install Python dependencies:**

```bash
pip install -r requirements.txt
```

**Run Django migrations:**

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 4. Frontend Setup

**Navigate to frontend directory:**

```bash
cd ../frontend
```

**Install Node.js dependencies:**

```bash
npm install
```

---

### 5. Start Redis

Choose one of the following options:

**Option A - Local Redis Installation:**

```bash
# macOS (with Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download and install Redis for Windows from GitHub releases
redis-server
```

**Option B - Docker Redis:**

```bash
docker run -d -p 6379:6379 redis:alpine
```

**Verify Redis is running:**

```bash
redis-cli ping
# Should return: PONG
```

---

### 6. Start the Application

**Start Backend Server (in backend directory):**

```bash
cd backend

# Activate virtual environment if not already activated
Windows: venv\Scripts\activate.bat
macOS/Linux: source venv/bin/activate

# Start Django server with Daphne
daphne -p 8000 sdg_backend.asgi:application
```

**Start Frontend Server (in a new terminal):**

```bash
cd frontend
npm start
```

---

## Accessing the Application

Once all services are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

---

## Docker Deployment

For a containerized deployment using Docker, follow these steps:

### Prerequisites

- **Docker Desktop** - [Download](https://docker.com/get-started)
- **Docker Compose** (included with Docker Desktop)

### Setup Steps

**1. Create database directory and extract init.sql:**

```bash
mkdir -p database
unzip init.zip -d database/
```

**2. Configure environment variables for Docker:**

Edit both `backend/.env` and `frontend/.env`:

```bash
# Comment out local development settings
# DB_HOST=127.0.0.1

# Uncomment Docker settings
DB_NAME=sdg_database
DB_USER=sdg_user
DB_PASSWORD=12345
DB_HOST=db                    # Use container name instead of localhost
DB_PORT=3306
DEBUG=False

MYSQL_ROOT_PASSWORD=12345
MYSQL_DATABASE=sdg_database
MYSQL_USER=sdg_user
MYSQL_PASSWORD=12345

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=sdghub9900@gmail.com
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=SDG Knowledge System <sdghub9900@gmail.com>

REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

**3. Start all services:**

```bash
docker-compose up -d
```

This will:
- Build backend and frontend containers
- Start MySQL, Redis, Backend, and Frontend services
- Initialize the database with `init.sql`
- Configure networking between containers

**4. Check service status:**

```bash
docker-compose ps
```

All services should show as "Up" or "running".

### Docker Management Commands

**View logs:**
```bash
docker-compose logs              # All services
docker-compose logs backend      # Specific service
```

**Stop services:**
```bash
docker-compose down
```

**Restart services:**
```bash
docker-compose restart
```

**Rebuild after code changes:**
```bash
docker-compose up -d --build
```

### Accessing Docker Services

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **MySQL:** localhost:3306 (accessible via MySQL client)
- **Redis:** localhost:6379 (accessible via Redis client)

---

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Verify MySQL is running
2. Check database credentials in `.env` files
3. Ensure database `sdg_database` exists
4. Verify the database password matches your MySQL configuration

```bash
# Test MySQL connection
mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use

**Problem:** Port 3000, 8000, or 6379 already in use

**Solution:**

```bash
# Windows - Check port usage
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# macOS/Linux - Check port usage
lsof -i :3000
lsof -i :8000

# Kill process or change port in configuration
```

### Redis Connection Error

**Problem:** Cannot connect to Redis

**Solution:**
1. Check if Redis is running: `redis-cli ping`
2. Start Redis: `redis-server`
3. Check Redis port (default: 6379)

### Python Virtual Environment Issues

**Problem:** Cannot activate virtual environment

**Solution:**

```bash
# Ensure Python 3.8+ is installed
python --version
# or
python3 --version

# Try using python3 explicitly (macOS/Linux)
python3 -m venv venv

# Update pip
pip install --upgrade pip
```

### Node.js Dependencies Issues

**Problem:** npm install fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Ensure Node.js version is 14+
node --version
```

### Docker Issues

**Problem:** Docker containers won't start

**Solution:**

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service_name]

# Restart all services
docker-compose down
docker-compose up -d

# Clean up and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Database Reset

If you need to reset the database:

```sql
mysql -u root -p
DROP DATABASE sdg_database;
CREATE DATABASE sdg_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
mysql -u root -p --default-character-set=utf8mb4 sdg_database < database/init.sql
cd backend
python manage.py migrate
```

---

## Support

For additional help:

1. Check application logs
2. Review error messages carefully
3. Verify all prerequisites are installed correctly
4. Ensure all required ports are available

**For Docker deployment:**
- Verify Docker Desktop is running
- Check disk space: `docker system df`
- Try rebuilding: `docker-compose up -d --build`

For further assistance, please contact the development team.