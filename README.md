# SDG Knowledge System - Deployment Guide

This guide provides instructions for deploying the SDG Knowledge System locally on both Windows and macOS/Linux systems. You can choose between automated setup scripts, manual installation, or Docker deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Quick Start (Automated Setup)](#quick-start-automated-setup)
  - [For Windows Users](#for-windows-users)
  - [For macOS/Linux Users](#for-macoslinux-users)
- [Docker Deployment](#docker-deployment)
  - [Prerequisites for Docker](#prerequisites-for-docker)
  - [Docker Setup Steps](#docker-setup-steps)
  - [Managing Docker Services](#managing-docker-services)
- [Manual Setup Instructions](#manual-setup-instructions)
  - [Step 1: Database Setup](#step-1-database-setup)
  - [Step 2: Environment Configuration](#step-2-environment-configuration)
  - [Step 3: Backend Setup](#step-3-backend-setup)
  - [Step 4: Redis Setup](#step-4-redis-setup)
  - [Step 5: Frontend Setup](#step-5-frontend-setup)
- [Testing Guide](#testing-guide)
  - [Backend Testing (Django)](#backend-testing-django)
  - [Frontend Testing (React + Jest)](#frontend-testing-react--jest)
- [Starting the Application](#starting-the-application)
- [Accessing the Application](#accessing-the-application)
- [Troubleshooting](#troubleshooting)
- [Development Notes](#development-notes)
- [Additional Configuration](#additional-configuration)
- [Support](#support)

## Prerequisites

Before starting the deployment, ensure you have the following software installed:

### Required Software
- **Python 3.8+** - [Download from python.org](https://python.org)
- **Node.js 14+** - [Download from nodejs.org](https://nodejs.org)
- **MySQL 8.0+** - [Download from mysql.com](https://mysql.com)
- **Redis** - [Download from redis.io](https://redis.io)
- **Docker** - Required for Meilisearch search engine

### Optional Tools
- **Git** - For version control
- **Meilisearch** - Can be installed directly instead of using Docker

## Project Structure

Understanding the project structure will help you navigate the codebase and locate configuration files:

```
sdg-knowledge-system/
├── backend/                    # Django backend application
│   ├── apps/                  # Django apps
│   │   ├── analytics/         # Analytics module
│   │   ├── actions/           # Actions module
│   │   ├── education/         # Education module
│   │   ├── authentication/    # Authentication module
│   │   └── team/             # Team module
│   ├── sdg_backend/          # Django project settings
│   ├── static/               # Static files
│   ├── templates/            # Django templates
│   ├── venv/                 # Python virtual environment (created during setup)
│   ├── .env                  # Backend environment variables (copied from root .env.example)
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py            # Django management script
│   └── Dockerfile           # Backend Docker configuration
├── frontend/                  # React frontend application
│   ├── src/                  # React source code
│   ├── public/               # Public assets
│   ├── node_modules/         # NPM dependencies (created during setup)
│   ├── .env                  # Frontend environment variables (copied from root .env.example)
│   ├── package.json          # NPM dependencies and scripts
│   ├── jest.config.js        # Jest testing configuration
│   └── Dockerfile           # Frontend Docker configuration
├── database/                  # Database initialization files (created during setup)
│   └── init.sql              # Database schema and initial data
├── docs/                     # Documentation
├── logs/                     # Application logs
├── media/                    # User uploaded files
├── init.zip                  # Database initialization archive
├── .env.example              # Environment variables template (for both backend and frontend)
├── docker-compose.yml        # Docker Compose configuration
├── setup-windows.bat         # Windows automated setup script
├── setup-macos.sh           # macOS/Linux automated setup script
└── README.md                # This file
```

### Key Configuration Files

- **`.env.example`** - Environment variables template (in project root)
- **`backend/.env`** - Backend environment configuration (copied from .env.example)
- **`frontend/.env`** - Frontend environment configuration (copied from .env.example)
- **`docker-compose.yml`** - Multi-container Docker application definition
- **`backend/requirements.txt`** - Python package dependencies
- **`frontend/package.json`** - Node.js package dependencies and scripts

## Quick Start (Automated Setup)

### For Windows Users

1. **Download and extract** the project files to your desired directory
2. **Open Command Prompt in vscode or other IDE**
3. Change the **DB_PASSWORD** field in the **setup script** and **.env.example**, use your local MySQL database password. (The default value is 12345, which may conflict with your local database settings.)
4. **Run the setup script:**
   ```cmd
   setup-windows.bat
   ```
5. **Follow the prompts** and enter your MySQL root password when requested
6. **Wait** for the setup to complete automatically

### For macOS/Linux Users

1. **Download and extract** the project files to your desired directory
2. **Open Terminal in vscode or other IDE**
3. Change the **DB_PASSWORD** field in the **setup script** and **.env.example**, use your local MySQL database password. (The default value is 12345, which may conflict with your local database settings.)
4. **Make the script executable and run it:**
   ```bash
   chmod +x setup-macos.sh
   ./setup-macos.sh
   ```
5. **Follow the prompts** and enter your MySQL root password when requested
6. **Wait** for the setup to complete automatically

If the script runs successfully and you want to run the project directly instead of deploying it in Docker, please jump to [Starting the Application](#starting-the-application)

## Docker Deployment

Docker deployment is the easiest and most consistent way to run the SDG project. All necessary services (MySQL, Redis, Backend, Frontend) are containerized and orchestrated using Docker Compose.

### Prerequisites for Docker

- **Docker Desktop** - [Download from docker.com](https://docker.com/get-started)
- **Docker Compose** (included with Docker Desktop)

### Docker Setup Steps

1. **Download and extract** the project files to your desired directory

2. **Configure environment variables for Docker:**
   
   Navigate to both `backend/.env` and `frontend/.env` files and modify them:
   
   **In `backend/.env` and `frontend/.env`:**
   ```bash
   # Comment out the Local development environment variables
   # DB_NAME=sdg_local
   # DB_USER=root
   # DB_PASSWORD=12345
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   
   # EMAIL_HOST=smtp.gmail.com
   # EMAIL_PORT=587
   # EMAIL_USE_TLS=True
   # EMAIL_USE_SSL=False
   # EMAIL_HOST_USER=sdghub9900@gmail.com
   # EMAIL_HOST_PASSWORD=aawagowdasvlnjn
   # DEFAULT_FROM_EMAIL=SDG Knowledge System <sdghub9900@gmail.com>
   
   # REACT_APP_API_URL=http://localhost:8000
   # REACT_APP_WS_URL=ws://localhost:8000
   
   # Uncomment the Docker development environment variables
   DB_NAME=sdg_local
   DB_USER=sdg_user
   DB_PASSWORD=12345
   DB_HOST=db
   DB_PORT=3306
   DEBUG=False
   
   MYSQL_ROOT_PASSWORD=12345
   MYSQL_DATABASE=sdg_local
   MYSQL_USER=sdg_user
   MYSQL_PASSWORD=12345
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_USE_SSL=False
   EMAIL_HOST_USER=sdghub9900@gmail.com
   EMAIL_HOST_PASSWORD=aawagowdasvlnjn
   DEFAULT_FROM_EMAIL=SDG Knowledge System <sdghub9900@gmail.com>
   
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000
   ```

3. **Extract database initialization file: (If it doesn't exist)**
   ```bash
   # Create database directory if it doesn't exist
   mkdir -p database
   
   # Extract init.sql from init.zip
   unzip init.zip -d database/
   ```

4. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   
   This command will:
   - Pull all required Docker images
   - Build the backend and frontend containers
   - Start MySQL, Redis, Backend, and Frontend services
   - Set up the database with initial data
   - Configure networking between containers

5. **Wait for all services to start** (usually takes 2-3 minutes for the first run)

6. **Check service status:**
   ```bash
   docker-compose ps
   ```
   
   All services should show as "Up" or "running"

### Managing Docker Services

**View logs:**
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
docker-compose logs redis
```

**Stop all services:**
```bash
docker-compose down
```

**Stop and remove all data (complete reset):**
```bash
docker-compose down -v
```

**Rebuild containers after code changes:**
```bash
docker-compose up -d --build
```

**Access running containers:**
```bash
# Access backend container
docker-compose exec backend bash

# Access database
docker-compose exec db mysql -u sdg_user -p sdg_local
```

### Docker Deployment Advantages

- ✅ **Consistent Environment:** Same setup across all machines
- ✅ **No Local Dependencies:** No need to install Python, Node.js, MySQL, Redis
- ✅ **Easy Cleanup:** Complete removal with single command
- ✅ **Isolated:** Doesn't interfere with other local services
- ✅ **Production-Ready:** Similar to production deployment

## Manual Setup Instructions

If you prefer to set up the project manually or encounter issues with the automated scripts, follow these detailed steps:

### Step 1: Database Setup

1. **Extract the database initialization file:**
   ```bash
   # Create database directory
   mkdir database
   
   # Extract init.sql from init.zip
   unzip init.zip -d database/
   ```

2. **Create MySQL database:**
   ```sql
   mysql -u root -p
   CREATE DATABASE sdg_local;
   USE sdg_local;
   SOURCE database/init.sql;
   ```

3. **Create database user:**
   ```sql
   CREATE USER 'root'@'localhost' IDENTIFIED BY '12345';
   GRANT ALL PRIVILEGES ON sdg_local.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Step 2: Environment Configuration

1. **Copy environment files:**
   ```bash
   # For backend (copy from project root)
   cp .env.example backend/.env
   
   # For frontend (copy from project root)
   cp .env.example frontend/.env
   ```

2. **Edit the .env files** if necessary to match your local configuration

### Step 3: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate Python virtual environment:**
   
   **Windows:**
   ```cmd
   python -m venv venv
   venv\Scripts\activate.bat
   ```
   
   **macOS/Linux:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

### Step 4: Redis Setup

Choose one of the following options:

**Option A - Local Redis Installation:**
```bash
# macOS (with Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows (download from GitHub releases)
# Download and install Redis for Windows
```

**Option B - Docker Redis:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Step 5: Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## Testing Guide

This project includes comprehensive testing for both Django backend and React/TypeScript frontend components.

### Testing Tools

- **Backend**: Django unittest + DRF APIClient with SQLite test database (configured in `sdg_backend/settings_test.py`)
- **Frontend**: Jest + ts-jest with React Testing Library support

### Backend Testing (Django)

#### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### 2. Test Configuration

The test configuration is located in `sdg_backend/settings_test.py` and includes:

- SQLite in-memory database for testing
- Only loads required apps (analytics, actions, education, authentication, team)
- Independent URLConf (`sdg_backend/urls_test.py`) for test-specific API endpoints

**Example `urls_test.py`:**
```python
from django.urls import path, include
from apps.authentication.profile import views as profile_views

urlpatterns = [
    path("api/track/", include("apps.analytics.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/education/", include("apps.education.urls")),
    path("api/actions/", include("apps.actions.urls")),
    path("api/team/", include("apps.team.urls")),
    path("api/authentication/", include("apps.authentication.urls")),
    path("profile/", profile_views.user_profile, name='user_profile'),
    path("profile/update/", profile_views.update_profile, name='update_profile'),
]
```

#### 3. Running Backend Tests

**Run all backend tests:**
```bash
python manage.py test --settings=sdg_backend.settings_test
```

**Run individual modules:**
```bash
# Analytics module only
python manage.py test apps.analytics --settings=sdg_backend.settings_test -v 2

# Actions module only
python manage.py test apps.actions --settings=sdg_backend.settings_test -v 2

# Education module only
python manage.py test apps.education --settings=sdg_backend.settings_test -v 2

# Authentication module only
python manage.py test apps.authentication --settings=sdg_backend.settings_test -v 2

# Team module only
python manage.py test apps.team --settings=sdg_backend.settings_test -v 2
```

**Run specific test files:**
```bash
python manage.py test apps.analytics.tests.test_click_api --settings=sdg_backend.settings_test
```

#### 4. Test Isolation

- Test database is automatically created and destroyed during test runs
- No contamination of production data
- Only includes necessary apps in `INSTALLED_APPS` to reduce startup time
- Uses `TEST_RUNNER` and environment variables for module-specific testing

### Frontend Testing (React + Jest)

#### 1. Install Dependencies

```bash
cd frontend
npm ci  # or npm install
```

#### 2. Running Frontend Tests

**Run all frontend tests:**
```bash
npm test
```

**Run specific test files:**
```bash
npx jest src/services/tests/tracker.test.ts
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

#### 3. Jest Configuration

The Jest configuration is located in `frontend/jest.config.js`:

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(test).[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
```

### Running Tests for Team Development

For team members who clone the repository:

**Backend testing:**
```bash
# Navigate to backend directory
cd backend

# Run tests for specific modules
python manage.py test apps.analytics --settings=sdg_backend.settings_test
python manage.py test apps.actions --settings=sdg_backend.settings_test
python manage.py test apps.education --settings=sdg_backend.settings_test
```

**Frontend testing:**
```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run specific test files
npx jest specific-file.test.ts
```

### Test Database Benefits

- **Isolated Environment**: Tests don't affect production data
- **Fast Execution**: SQLite in-memory database for quick test runs
- **Module-Specific**: Can test individual modules (analytics, actions, education) independently
- **Consistent Setup**: Same test configuration across all development environments

## Starting the Application

After completing the setup (either automated or manual), start the application services:

### 1. Start Redis (if not already running)
```bash
# Local installation
redis-server

# Or Docker
docker run -d -p 6379:6379 redis:alpine
```

### 2. Check the database settings in the .env file to make sure they are consistent with your local database parameters, especially the database password. 

### 3. Start Backend Server
```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Start the server
daphne -p 8000 sdg_backend.asgi:application
```

### 4. Start Frontend Server (in a new terminal)
```bash
cd frontend
npm start
```

## Accessing the Application

Once all services are running, you can access:

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8000

### For Docker Deployment

The same URLs apply for Docker deployment. Docker Compose automatically maps the container ports to your local machine:

- **Frontend (React):** http://localhost:3000
- **Backend (Django):** http://localhost:8000
- **MySQL Database:** localhost:3306 (accessible via MySQL client)
- **Redis:** localhost:6379 (accessible via Redis client)

**Note:** For Docker deployment, the services communicate internally using container names (e.g., `db`, `redis`, `backend`, `frontend`), but are accessible from your host machine via localhost.

## Troubleshooting

### Docker Deployment Issues

1. **Services won't start:**
   ```bash
   # Check service status
   docker-compose ps
   
   # View logs for specific service
   docker-compose logs [service_name]
   
   # Restart all services
   docker-compose restart
   ```

2. **Port already in use:**
   ```bash
   # Check what's using the ports
   # Windows:
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   
   # macOS/Linux:
   lsof -i :3000
   lsof -i :8000
   
   # Kill processes or modify docker-compose.yml ports
   ```

3. **Database connection issues:**
   ```bash
   # Check if database container is running
   docker-compose ps db
   
   # Access database directly
   docker-compose exec db mysql -u sdg_user -p
   
   # Recreate database container
   docker-compose down
   docker-compose up -d
   ```

4. **Permission issues (Linux/macOS):**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   
   # Make sure Docker daemon is running
   sudo systemctl start docker
   ```

5. **Out of disk space:**
   ```bash
   # Clean up Docker resources
   docker system prune -a
   docker volume prune
   ```

### Common Issues

1. **Database setting problem of automatic setup script：**
   - The setup script will try to create a database and user with the default password 12345.
   - When the local database already has a user root and has set your own password, you should manually update the database parameters in .env and change the DB_PASSWORD=12345 field in setup script. This should solve the problem of the system being unable to connect to the database.

2. **MySQL Connection Error:**
   - Ensure MySQL service is running
   - Verify username and password in .env files
   - Check if the database `sdg_local` exists

2. **Python Virtual Environment Issues:**
   - Ensure Python 3.8+ is installed
   - Try using `python3` instead of `python` on macOS/Linux
   - Make sure pip is up to date: `pip install --upgrade pip`

3. **Node.js Dependencies Issues:**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Ensure Node.js version is 14 or higher

4. **Redis Connection Issues:**
   - Check if Redis is running: `redis-cli ping` should return "PONG"
   - Verify Redis is listening on port 6379
   - Check firewall settings

5. **Port Already in Use:**
   - Check if ports 3000, 8000, or 6379 are already in use
   - Kill existing processes or change ports in configuration

### Database Reset

If you need to reset the database:

1. **Drop and recreate the database:**
   ```sql
   mysql -u root -p
   DROP DATABASE sdg_local;
   CREATE DATABASE sdg_local;
   USE sdg_local;
   SOURCE database/init.sql;
   ```

2. **Re-run migrations:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
   python manage.py migrate
   ```

## Development Notes

### Architecture Overview
- The backend uses Django with Daphne as the ASGI server
- The frontend is a React.js application
- Redis is used for caching and session management
- MySQL stores the application data

### Docker Development
- All services are containerized for consistent development environment
- Docker Compose orchestrates the multi-container application
- Hot reloading is enabled for both frontend and backend development
- Database data persists in Docker volumes

### Local Development
- Use automated scripts for quick local setup
- Python virtual environment isolates backend dependencies
- npm manages frontend dependencies

## Additional Configuration

### Environment Variables

You may need to modify the following environment variables in your `.env` files:

**Backend (.env) - Local Development:**
```
DATABASE_NAME=sdg_local
DATABASE_USER=root
DATABASE_PASSWORD=12345
DATABASE_HOST=localhost
DATABASE_PORT=3306
REDIS_URL=redis://localhost:6379
```

**Backend (.env) - Docker Development:**
```
DB_NAME=sdg_local
DB_USER=sdg_user
DB_PASSWORD=12345
DB_HOST=db
DB_PORT=3306
DEBUG=False
MYSQL_ROOT_PASSWORD=12345
MYSQL_DATABASE=sdg_local
MYSQL_USER=sdg_user
MYSQL_PASSWORD=12345
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

### Docker Configuration

**docker-compose.yml** already includes:
- Service definitions for all components
- Network configuration for inter-service communication
- Volume mappings for data persistence
- Environment variable configurations
- Port mappings to localhost

**Dockerfile configurations** are optimized for:
- Multi-stage builds for smaller image sizes
- Production-ready setups
- Proper dependency caching
- Security best practices

## Support

If you encounter any issues during setup or deployment:

1. **Check deployment method specific logs:**
   - **Docker:** `docker-compose logs [service_name]`
   - **Local:** Check console output and service logs
2. Verify all prerequisites are properly installed
3. Ensure all required ports are available
4. Check the troubleshooting section above
5. Review the respective service directories for additional logs

**For Docker-specific issues:**
- Verify Docker Desktop is running
- Check available disk space (`docker system df`)
- Ensure no port conflicts with existing services
- Try rebuilding containers: `docker-compose up -d --build`

For additional support, please refer to the project documentation or contact the development team.