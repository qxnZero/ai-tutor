# AI Tutor API Documentation

This document provides a comprehensive overview of all API endpoints in the AI Tutor application, specifying which backend (Next.js or PHP) handles each endpoint.

## Authentication

All authenticated endpoints use NextAuth for authentication. The token is passed via cookies:
- `next-auth.session-token` (in development)
- `__Secure-next-auth.session-token` (in production)

## API Endpoints Overview

| Endpoint | Method | Backend | Description | Authentication |
|----------|--------|---------|-------------|----------------|
| `/api/auth/*` | Various | Next.js | Authentication endpoints | Varies |
| `/api/courses` | GET | Next.js | List all courses | Required |
| `/api/courses/:id` | GET | Next.js | Get course details | Required |
| `/api/courses/generate` | POST | Next.js | Generate a new course | Required |
| `/api/notes` | GET, POST, DELETE | PHP | Manage user notes | Required |
| `/api/bookmarks` | GET, POST, DELETE | PHP | Manage user bookmarks | Required |
| `/api/user-progress` | GET, POST | PHP | Track user progress | Required |
| `/api/knowledge-test` | POST | PHP | Generate knowledge tests | Required |
| `/api/course-generator` | POST | PHP | Generate course content | Required |
| `/api/teaching-assistant` | POST | Next.js | Get teaching assistant responses | Required |
| `/api/health` | GET | Both | Health check endpoint | Not Required |
| `/api/test` | GET | PHP | Test PHP backend connectivity | Not Required |

## Detailed Endpoint Documentation

### Next.js Backend Endpoints

#### Authentication Endpoints

**Base URL**: `/api/auth/*`

NextAuth.js handles these endpoints. See [NextAuth.js documentation](https://next-auth.js.org/getting-started/rest-api) for details.

#### Courses Endpoints

**List Courses**
- **URL**: `/api/courses`
- **Method**: GET
- **Authentication**: Required
- **Response**: Array of course objects
- **Example Response**:
```json
[
  {
    "id": "course123",
    "title": "Introduction to JavaScript",
    "description": "Learn the basics of JavaScript programming",
    "difficulty": "Beginner",
    "progress": 25,
    "modules": [...]
  }
]
```

**Get Course Details**
- **URL**: `/api/courses/:id`
- **Method**: GET
- **Authentication**: Required
- **URL Parameters**: `id` - Course ID
- **Response**: Course object with modules and lessons
- **Example Response**:
```json
{
  "id": "course123",
  "title": "Introduction to JavaScript",
  "description": "Learn the basics of JavaScript programming",
  "difficulty": "Beginner",
  "modules": [
    {
      "id": "module456",
      "title": "JavaScript Fundamentals",
      "lessons": [...]
    }
  ]
}
```

**Generate Course**
- **URL**: `/api/courses/generate`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
```json
{
  "topic": "JavaScript",
  "difficulty": "Beginner",
  "additionalDetails": true,
  "details": "Focus on modern ES6+ features"
}
```
- **Response**: Generated course object
- **Example Response**:
```json
{
  "id": "newcourse123",
  "title": "Modern JavaScript",
  "description": "A comprehensive course on JavaScript with ES6+ features",
  "modules": [...]
}
```

**Teaching Assistant**
- **URL**: `/api/teaching-assistant`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
```json
{
  "message": "Explain closures in JavaScript",
  "courseId": "course123",
  "lessonId": "lesson789",
  "moduleName": "JavaScript Fundamentals",
  "lessonName": "Advanced Concepts"
}
```
- **Response**: AI-generated response
- **Example Response**:
```json
{
  "response": "Closures in JavaScript are...",
  "sources": [...]
}
```

### PHP Backend Endpoints

#### Notes API

**Get Note**
- **URL**: `/api/notes`
- **Method**: GET
- **Authentication**: Required
- **Query Parameters**: `lessonId` - Lesson ID
- **Response**: Note object or null
- **Example Response**:
```json
{
  "note": {
    "id": "note123",
    "content": "This is my note for the lesson",
    "lessonId": "lesson789",
    "userId": "user456",
    "createdAt": "2023-04-22T10:30:00Z",
    "updatedAt": "2023-04-22T10:30:00Z"
  }
}
```

**Create/Update Note**
- **URL**: `/api/notes`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
```json
{
  "lessonId": "lesson789",
  "content": "This is my note for the lesson"
}
```
- **Response**: Created or updated note
- **Example Response**:
```json
{
  "message": "Note created successfully",
  "note": {
    "id": "note123",
    "content": "This is my note for the lesson",
    "lessonId": "lesson789",
    "userId": "user456",
    "createdAt": "2023-04-22T10:30:00Z",
    "updatedAt": "2023-04-22T10:30:00Z"
  }
}
```

#### Bookmarks API

**Get Bookmark**
- **URL**: `/api/bookmarks`
- **Method**: GET
- **Authentication**: Required
- **Query Parameters**: `lessonId` - Lesson ID
- **Response**: Bookmark object or null
- **Example Response**:
```json
{
  "bookmark": {
    "id": "bookmark123",
    "lessonId": "lesson789",
    "userId": "user456",
    "createdAt": "2023-04-22T10:30:00Z"
  }
}
```

**Create Bookmark**
- **URL**: `/api/bookmarks`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
```json
{
  "lessonId": "lesson789"
}
```
- **Response**: Created bookmark
- **Example Response**:
```json
{
  "message": "Lesson bookmarked successfully",
  "bookmark": {
    "id": "bookmark123",
    "lessonId": "lesson789",
    "userId": "user456",
    "createdAt": "2023-04-22T10:30:00Z"
  }
}
```

**Delete Bookmark**
- **URL**: `/api/bookmarks`
- **Method**: DELETE
- **Authentication**: Required
- **Query Parameters**: `id` - Bookmark ID
- **Response**: Success message
- **Example Response**:
```json
{
  "message": "Bookmark removed successfully"
}
```

#### User Progress API

**Get Progress**
- **URL**: `/api/user-progress`
- **Method**: GET
- **Authentication**: Required
- **Query Parameters**: `courseId` - Course ID
- **Response**: Progress object or null
- **Example Response**:
```json
{
  "progress": {
    "id": "progress123",
    "courseId": "course123",
    "userId": "user456",
    "progress": 25,
    "lastLesson": "lesson789",
    "createdAt": "2023-04-22T10:30:00Z",
    "updatedAt": "2023-04-22T10:30:00Z"
  }
}
```

**Update Progress**
- **URL**: `/api/user-progress`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
```json
{
  "courseId": "course123",
  "progress": 50,
  "lastLesson": "lesson790"
}
```
- **Response**: Updated progress
- **Example Response**:
```json
{
  "progress": {
    "id": "progress123",
    "courseId": "course123",
    "userId": "user456",
    "progress": 50,
    "lastLesson": "lesson790",
    "createdAt": "2023-04-22T10:30:00Z",
    "updatedAt": "2023-04-22T11:15:00Z"
  }
}
```

#### Knowledge Test API

**Generate Test**
- **URL**: `/api/knowledge-test`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
```json
{
  "lessonId": "lesson789"
}
```
- **Response**: Array of test questions
- **Example Response**:
```json
{
  "questions": [
    {
      "id": "1",
      "question": "What is JavaScript?",
      "options": [
        "A programming language",
        "A markup language",
        "A database system",
        "An operating system"
      ],
      "correctAnswer": 0
    },
    {
      "id": "2",
      "question": "Which keyword is used to declare variables in JavaScript?",
      "options": [
        "var",
        "int",
        "string",
        "declare"
      ],
      "correctAnswer": 0
    }
  ]
}
```

#### Course Generator API

**Generate Course Content**
- **URL**: `/api/course-generator`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
```json
{
  "topic": "JavaScript",
  "difficulty": "Beginner",
  "additionalDetails": true,
  "details": "Focus on modern ES6+ features"
}
```
- **Response**: Generated course content
- **Example Response**:
```json
{
  "status": "success",
  "data": {
    "title": "Modern JavaScript for Beginners",
    "description": "A comprehensive course on JavaScript with ES6+ features",
    "modules": [...]
  }
}
```

### Health Check Endpoint

**Check System Health**
- **URL**: `/api/health`
- **Method**: GET
- **Authentication**: Not Required
- **Response**: Health status of all system components
- **Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2023-04-22T11:30:00Z",
  "components": {
    "nextjs": {
      "status": "healthy",
      "version": "15.2.4"
    },
    "php": {
      "status": "healthy",
      "version": "8.4.6"
    },
    "database": {
      "status": "healthy",
      "responseTime": 5
    }
  }
}
```

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

## Testing Endpoints

You can test PHP backend endpoints without authentication by adding the `test=1` query parameter:

```
GET /api/notes?test=1
```

This will return a success message without requiring authentication, useful for verifying the endpoint is accessible.
