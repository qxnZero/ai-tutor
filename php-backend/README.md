# AI Tutor PHP Backend

This is a simple PHP backend for the AI Tutor application. It provides a set of API endpoints that can be used alongside the existing Next.js backend.

## Setup

1. Make sure PHP 8.0+ is installed on your system
2. Configure your database connection in the `.env` file
3. Start the PHP server:

```bash
cd /path/to/AI-Tutor/php-backend
php -S localhost:8000 router.php
```

## API Endpoints

The following API endpoints are available:

### Test Endpoint

- **URL**: `/api/test`
- **Method**: GET
- **Description**: A simple test endpoint to verify the PHP backend is working

### Notes API

- **URL**: `/api/notes`
- **Methods**: GET, POST
- **Description**: Manage user notes for lessons
- **Parameters**:
  - GET: `lessonId` (query parameter)
  - POST: `lessonId`, `content` (JSON body)

### Bookmarks API

- **URL**: `/api/bookmarks`
- **Methods**: GET, POST, DELETE
- **Description**: Manage user bookmarks for lessons
- **Parameters**:
  - GET: None (returns all bookmarks for the user)
  - POST: `lessonId` (JSON body)
  - DELETE: `lessonId` (query parameter)

### User Progress API

- **URL**: `/api/user-progress`
- **Methods**: GET, POST
- **Description**: Track user progress in courses
- **Parameters**:
  - GET: `courseId` (query parameter)
  - POST: `courseId`, `progress`, `lastLesson` (optional) (JSON body)

### Knowledge Test API

- **URL**: `/api/knowledge-test`
- **Method**: POST
- **Description**: Generate knowledge tests based on lesson content
- **Parameters**:
  - POST: `lessonId` (JSON body)

## Authentication

The API uses the same authentication system as the Next.js backend. It reads the NextAuth session token from cookies and validates it against the database.

## Testing

You can test the API endpoints without authentication by adding the `test=1` query parameter:

```bash
curl http://localhost:8000/api/notes?test=1
```

## Integration with Next.js

To integrate this PHP backend with your Next.js application, configure your web server (Nginx, Apache, etc.) to route specific API requests to the PHP backend while routing all other requests to the Next.js application.

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PHP backend for specific endpoints
    location ~ ^/api/(notes|bookmarks|user-progress|knowledge-test)$ {
        root /path/to/AI-Tutor/php-backend;
        try_files $uri $uri/ /index.php?$query_string;
        
        # PHP-FPM configuration
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```
