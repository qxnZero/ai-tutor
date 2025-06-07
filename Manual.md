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

2. Test the database connection by running the application.

## Running the Application

### Build the Application

```bash
# Install dependencies
bun install

# Generate Prisma client and build Next.js
bunx prisma generate
bun --bun next build
```

### Running the Application

```bash
# Start in production mode
bun run start

# OR start in development mode
bun run dev
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
tmux kill-session -t ai-tutor
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

### Additional Next.js Endpoints

- `/api/notes` - Manage user notes (GET, POST, DELETE)
- `/api/bookmarks` - Manage user bookmarks (GET, POST, DELETE)
- `/api/user-progress` - Track user progress (GET, POST)
- `/api/course-statistics` - Get course and user statistics (GET)
- `/api/user-activity` - Track and retrieve user activity (GET, POST)
- `/api/knowledge-test` - Generate knowledge tests (POST)
- `/api/subscriptions` - Handle subscription management (GET, POST)

## API Documentation

### User Progress API

- **URL**: `/api/user-progress`
- **Methods**: GET, POST
- **Description**: Track user progress in courses
- **Parameters**:
  - GET: `courseId` (query parameter)
  - POST: `courseId`, `progress`, `lastLesson` (optional) (JSON body)
- **Response Example**:
  ```json
  {
    "progress": {
      "id": "progress-123",
      "courseId": "course-1",
      "userId": "user-1",
      "progress": 75,
      "lastLesson": "lesson-3",
      "createdAt": "2025-04-22T10:00:00Z",
      "updatedAt": "2025-04-22T10:00:00Z"
    }
  }
  ```

### Course Statistics API

- **URL**: `/api/course-statistics`
- **Method**: GET
- **Description**: Get statistics about courses and user learning
- **Parameters**:
  - `courseId` (optional query parameter) - If provided, returns statistics for a specific course
- **Response Example (Course)**:
  ```json
  {
    "statistics": {
      "courseId": "course-1",
      "title": "Introduction to AI",
      "totalLessons": 24,
      "completedLessons": 18,
      "averageProgress": 75.5,
      "userCount": 12,
      "bookmarkCount": 8
    }
  }
  ```
- **Response Example (Overall)**:
  ```json
  {
    "statistics": {
      "courseCount": 5,
      "averageProgress": 68.2,
      "bookmarkCount": 15,
      "noteCount": 23,
      "topCourses": [
        {
          "courseId": "course-2",
          "title": "Machine Learning Basics",
          "progress": 90
        },
        {
          "courseId": "course-1",
          "title": "Introduction to AI",
          "progress": 75
        }
      ]
    }
  }
  ```

### User Activity API

- **URL**: `/api/user-activity`
- **Methods**: GET, POST
- **Description**: Track and retrieve user learning activities
- **Parameters**:
  - GET: No parameters required
  - POST: `activityType`, `resourceId` (optional), `resourceType` (optional) (JSON body)
- **Valid Activity Types**:
  - `view_course` - User viewed a course
  - `view_lesson` - User viewed a lesson
  - `complete_lesson` - User completed a lesson
  - `create_note` - User created a note
  - `create_bookmark` - User bookmarked a lesson
  - `search` - User performed a search
- **Response Example (GET)**:
  ```json
  {
    "activities": [
      {
        "id": "activity-123",
        "userId": "user-1",
        "activityType": "view_lesson",
        "resourceId": "lesson-2",
        "resourceType": "lesson",
        "createdAt": "2025-04-22T10:00:00Z"
      },
      {
        "id": "activity-122",
        "userId": "user-1",
        "activityType": "view_course",
        "resourceId": "course-1",
        "resourceType": "course",
        "createdAt": "2025-04-22T09:45:00Z"
      }
    ]
  }
  ```

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

Application includes enhanced logging stored in the `logs` directory.

## Troubleshooting

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

Verify the application is running:

```bash
# Check for running processes
ps aux | grep bun
```

## Accessing the Application

- Application: http://localhost:3000
- All API endpoints: http://localhost:3000/api/*

This will return a success message without requiring authentication, useful for verifying the endpoint is accessible.
