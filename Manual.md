# AI Tutor Manual

This comprehensive manual provides instructions for running and using the AI Tutor application with its dual backend architecture (Next.js and PHP).

## System Architecture

The AI Tutor uses a dual backend architecture:
- **Next.js Backend**: Main application server, handles UI rendering and most API endpoints
- **PHP Backend**: Secondary server handling specific API endpoints
- **Database**: Neon PostgreSQL (cloud-hosted)

## Prerequisites

- Bun runtime (for Next.js and package management)
- PHP 8.0+ with pgsql extension (`sudo apt install php-pgsql`)
- PostgreSQL database (Neon DB)
- tmux (optional, for better terminal management)

> Note: This project uses Bun exclusively for package management and running Next.js. Do not use npm or pnpm.

## Database Setup

1. Make sure your `.env` file has the correct Neon DB connection string:

```
DATABASE_URL='postgresql://neondb_owner:password@your-neon-db-host.aws.neon.tech/neondb?sslmode=require'
```

2. Test the PHP database connection:

```bash
cd php-backend
php test-db.php
```

If you see "SUCCESS: Connected to the database successfully!", the connection is working.

## Running the Application

### Build the Application

```bash
# Install dependencies
bun install

# Generate Prisma client and build Next.js
bunx prisma generate
bun --bun next build
```

### Running Next.js Backend

```bash
# Start Next.js in production mode
bun --bun next start

# OR start Next.js in development mode
bun --bun next dev
```

### Running PHP Backend

#### Development Server (for local development)

```bash
# Start PHP development server
cd php-backend
php -S localhost:8000 router.php
```

#### PHP-FPM (for production)

```bash
# Start PHP-FPM server
php-fpm -F -y ./config/php-fpm.conf

# OR use the script in package.json
bun run php:fpm
```

#### Running Both Next.js and PHP Together

```bash
# Development mode
bun run dev:all

# Production mode
bun run start:all
```

### Using tmux (Recommended for VPS)

#### With PHP Development Server

```bash
# Create a new tmux session for PHP backend
tmux new-session -d -s ai-tutor-php 'cd php-backend && php -S localhost:8000 router.php'

# Create a new tmux session for Next.js backend
tmux new-session -d -s ai-tutor-next 'bun --bun next start'
```

#### With PHP-FPM (Recommended for Production)

```bash
# Create a new tmux session for PHP-FPM backend
tmux new-session -d -s ai-tutor-php-fpm 'php-fpm -F -y ./config/php-fpm.conf'

# Create a new tmux session for Next.js backend
tmux new-session -d -s ai-tutor-next 'bun --bun next start'
```

#### Managing tmux Sessions

To attach to a session:
```bash
tmux attach -t ai-tutor-php
# OR
tmux attach -t ai-tutor-next
# OR
tmux attach -t ai-tutor-php-fpm
```

To detach from a session: Press `Ctrl+B` then `D`

To list all sessions:
```bash
tmux ls
```

To kill a session:
```bash
tmux kill-session -t ai-tutor-php
```

## Database Operations

### Generate Prisma Client

```bash
bunx prisma generate
```

### Create Database Migrations

```bash
bunx prisma migrate dev --name your_migration_name
```

### View Database with Prisma Studio

```bash
bunx prisma studio
```

## API Endpoints

### Next.js Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/courses` - List all courses
- `/api/courses/:id` - Get course details
- `/api/courses/generate` - Generate a new course
- `/api/teaching-assistant` - Get teaching assistant responses
- `/api/health` - Health check endpoint

### PHP Endpoints

- `/api/notes` - Manage user notes (GET, POST, DELETE)
- `/api/bookmarks` - Manage user bookmarks (GET, POST, DELETE)
- `/api/user-progress` - Track user progress (GET, POST)
- `/api/knowledge-test` - Generate knowledge tests (POST)
- `/api/course-generator` - Generate course content (POST)
- `/api/health` - Health check endpoint (GET)
- `/api/test` - Test PHP backend connectivity (GET)

## Authentication

All authenticated endpoints use NextAuth for authentication. The token is passed via cookies:
- `next-auth.session-token` (in development)
- `__Secure-next-auth.session-token` (in production)

## Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "status": "error",
  "code": 404,
  "message": "Resource not found",
  "details": "The requested course with ID 'invalid-id' does not exist"
}
```

Common error codes:
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error

## Logging

Both backends include enhanced logging:
- PHP requests are prefixed with `[PHP]` in the console
- Next.js requests have no prefix
- Logs are stored in the `logs` directory

## Troubleshooting

### PHP PostgreSQL Driver Issues

If you encounter "could not find driver" errors:

```bash
# Install the PostgreSQL driver for PHP
sudo apt install php-pgsql

# Verify installation
php -m | grep pgsql
```

### Database Connection Issues

Ensure your Neon DB connection string is correct and includes `sslmode=require`.

### Next.js Build Errors

If you encounter build errors:

```bash
# Clean the Next.js cache
rm -rf .next

# Rebuild
bunx prisma generate
bun --bun next build
```

### Checking Services

Verify that both services are running:

```bash
# Check for running processes
ps aux | grep php
ps aux | grep bun
```

## Accessing the Application

- Next.js frontend: http://localhost:3000
- PHP backend API: http://localhost:8000/api/test

## Testing API Endpoints

You can test PHP backend endpoints without authentication by adding the `test=1` query parameter:

```
GET /api/notes?test=1
```

This will return a success message without requiring authentication, useful for verifying the endpoint is accessible.
