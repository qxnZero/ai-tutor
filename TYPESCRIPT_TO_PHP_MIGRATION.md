# Migrating from TypeScript to PHP in AI Tutor

This guide provides step-by-step instructions for replacing TypeScript API routes with PHP in your AI Tutor Next.js application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setting Up the PHP Environment](#setting-up-the-php-environment)
4. [Migrating API Routes](#migrating-api-routes)
5. [Database Access](#database-access)
6. [Authentication](#authentication)
7. [Deployment](#deployment)
8. [Testing](#testing)

## Overview

The AI Tutor application currently uses TypeScript for both frontend and backend (API routes). This migration will:

1. Keep the Next.js frontend intact
2. Replace TypeScript API routes with PHP endpoints
3. Maintain the same database schema and functionality

## Prerequisites

- PHP 8.0+ installed
- Composer (PHP package manager)
- PostgreSQL database (same as current setup)
- Apache or Nginx web server
- Basic knowledge of PHP and Next.js

## Setting Up the PHP Environment

### 1. Create PHP API Directory

```bash
# Create a directory for PHP API files
mkdir -p php-api
cd php-api

# Initialize Composer
composer init --no-interaction
```

### 2. Install Required PHP Packages

```bash
composer require firebase/php-jwt vlucas/phpdotenv guzzlehttp/guzzle
```

### 3. Create Environment Configuration

Create a `.env` file in the PHP API directory:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aitutor
DB_USER=aitutoruser
DB_PASS=your_secure_password

# Authentication
JWT_SECRET=gHbp01lqTxukNxjXvmZzih8f1qGcEik3yLy136MGSIo=

# Google OAuth
GOOGLE_CLIENT_ID=100562476342-efpkst839mi912d9v495b9g7qkuortlq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Gemini API
GEMINI_API_KEY=AIzaSyCI8YMBO2m6MK8pnfLRMB0ZPl8s0Of70wE
```

### 4. Create Database Connection Class

Create a file `config/Database.php`:

```php
<?php
namespace Config;

class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = $_ENV['DB_HOST'];
        $this->port = $_ENV['DB_PORT'];
        $this->db_name = $_ENV['DB_NAME'];
        $this->username = $_ENV['DB_USER'];
        $this->password = $_ENV['DB_PASS'];
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->db_name}";
            $this->conn = new \PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch(\PDOException $e) {
            echo "Connection error: " . $e->getMessage();
        }

        return $this->conn;
    }
}
```

## Migrating API Routes

### 1. Create Base API Structure

Create an `index.php` file to handle all API requests:

```php
<?php
// Load environment variables
require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse request URI
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));

// Remove 'api' and 'php' from the path if present
$uri_parts = array_values(array_filter($uri_parts, function($part) {
    return $part !== 'api' && $part !== 'php';
}));

// Get the endpoint and ID if provided
$endpoint = $uri_parts[0] ?? '';
$id = $uri_parts[1] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

// Route the request to the appropriate controller
switch ($endpoint) {
    case 'courses':
        require_once 'controllers/CourseController.php';
        $controller = new \Controllers\CourseController();
        break;
    case 'auth':
        require_once 'controllers/AuthController.php';
        $controller = new \Controllers\AuthController();
        break;
    case 'users':
        require_once 'controllers/UserController.php';
        $controller = new \Controllers\UserController();
        break;
    case 'notes':
        require_once 'controllers/NoteController.php';
        $controller = new \Controllers\NoteController();
        break;
    case 'bookmarks':
        require_once 'controllers/BookmarkController.php';
        $controller = new \Controllers\BookmarkController();
        break;
    case 'ai-instructor':
        require_once 'controllers/AIInstructorController.php';
        $controller = new \Controllers\AIInstructorController();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        exit;
}

// Call the appropriate method based on HTTP method
switch ($method) {
    case 'GET':
        if ($id) {
            $controller->getOne($id);
        } else {
            $controller->getAll();
        }
        break;
    case 'POST':
        $controller->create();
        break;
    case 'PUT':
        $controller->update($id);
        break;
    case 'DELETE':
        $controller->delete($id);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
```

### 2. Migrate Course API

Let's migrate the course API as an example:

#### TypeScript Version (Current)

```typescript
// app/api/courses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    const courses = await prisma.course.findMany({
      where: {
        userId: user.id,
      },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
```

#### PHP Version (New)

Create a file `controllers/CourseController.php`:

```php
<?php
namespace Controllers;

require_once 'models/Course.php';
require_once 'middleware/Auth.php';

use Models\Course;
use Middleware\Auth;

class CourseController {
    private $course;
    private $auth;
    private $db;

    public function __construct() {
        // Initialize database connection
        require_once 'config/Database.php';
        $database = new \Config\Database();
        $this->db = $database->getConnection();
        
        // Initialize course model
        $this->course = new Course($this->db);
        
        // Initialize auth middleware
        $this->auth = new Auth();
    }

    public function getAll() {
        try {
            // Verify authentication
            $user = $this->auth->validateToken();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized. Please sign in.']);
                return;
            }

            // Get courses for the user
            $courses = $this->course->getAllForUser($user['id']);
            
            // Return courses as JSON
            echo json_encode($courses);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch courses: ' . $e->getMessage()]);
        }
    }

    public function getOne($id) {
        try {
            // Verify authentication
            $user = $this->auth->validateToken();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized. Please sign in.']);
                return;
            }

            // Get course by ID
            $course = $this->course->getById($id, $user['id']);
            
            if (!$course) {
                http_response_code(404);
                echo json_encode(['error' => 'Course not found']);
                return;
            }
            
            // Return course as JSON
            echo json_encode($course);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch course: ' . $e->getMessage()]);
        }
    }

    public function create() {
        try {
            // Verify authentication
            $user = $this->auth->validateToken();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized. Please sign in.']);
                return;
            }

            // Get request body
            $data = json_decode(file_get_contents("php://input"));
            
            // Validate required fields
            if (!isset($data->title) || !isset($data->difficulty) || !isset($data->topic)) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                return;
            }
            
            // Add user ID to data
            $data->userId = $user['id'];
            
            // Create course
            $courseId = $this->course->create($data);
            
            if ($courseId) {
                http_response_code(201);
                echo json_encode([
                    'id' => $courseId,
                    'title' => $data->title,
                    'description' => $data->description ?? null,
                    'difficulty' => $data->difficulty,
                    'topic' => $data->topic,
                    'userId' => $user['id'],
                    'message' => 'Course created successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create course']);
            }
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create course: ' . $e->getMessage()]);
        }
    }

    // Implement update and delete methods similarly
}
```

Create a file `models/Course.php`:

```php
<?php
namespace Models;

class Course {
    private $conn;
    private $table = 'course';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllForUser($userId) {
        try {
            // Prepare query to get courses with modules and lessons
            $query = "
                SELECT 
                    c.id, c.title, c.description, c.difficulty, c.topic, c.created_at, c.updated_at,
                    m.id as module_id, m.title as module_title, m.description as module_description, m.order as module_order,
                    l.id as lesson_id, l.title as lesson_title, l.description as lesson_description, 
                    l.content as lesson_content, l.exercises as lesson_exercises, l.order as lesson_order, l.completed as lesson_completed
                FROM 
                    {$this->table} c
                LEFT JOIN 
                    module m ON c.id = m.course_id
                LEFT JOIN 
                    lesson l ON m.id = l.module_id
                WHERE 
                    c.user_id = :userId
                ORDER BY 
                    c.updated_at DESC, m.order ASC, l.order ASC
            ";

            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            $stmt->bindParam(':userId', $userId);
            
            // Execute query
            $stmt->execute();
            
            // Process results into nested structure
            $courses = [];
            $courseMap = [];
            $moduleMap = [];
            
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $courseId = $row['id'];
                
                // Add course if not already added
                if (!isset($courseMap[$courseId])) {
                    $course = [
                        'id' => $courseId,
                        'title' => $row['title'],
                        'description' => $row['description'],
                        'difficulty' => $row['difficulty'],
                        'topic' => $row['topic'],
                        'createdAt' => $row['created_at'],
                        'updatedAt' => $row['updated_at'],
                        'modules' => []
                    ];
                    
                    $courseMap[$courseId] = count($courses);
                    $courses[] = $course;
                }
                
                // Skip if no modules
                if ($row['module_id'] === null) continue;
                
                $moduleId = $row['module_id'];
                $courseIndex = $courseMap[$courseId];
                
                // Add module if not already added
                if (!isset($moduleMap[$moduleId])) {
                    $module = [
                        'id' => $moduleId,
                        'title' => $row['module_title'],
                        'description' => $row['module_description'],
                        'order' => $row['module_order'],
                        'courseId' => $courseId,
                        'lessons' => []
                    ];
                    
                    $moduleMap[$moduleId] = [
                        'courseIndex' => $courseIndex,
                        'moduleIndex' => count($courses[$courseIndex]['modules'])
                    ];
                    
                    $courses[$courseIndex]['modules'][] = $module;
                }
                
                // Skip if no lessons
                if ($row['lesson_id'] === null) continue;
                
                $indices = $moduleMap[$moduleId];
                
                // Add lesson
                $lesson = [
                    'id' => $row['lesson_id'],
                    'title' => $row['lesson_title'],
                    'description' => $row['lesson_description'],
                    'content' => $row['lesson_content'],
                    'exercises' => json_decode($row['lesson_exercises']),
                    'order' => $row['lesson_order'],
                    'completed' => (bool)$row['lesson_completed'],
                    'moduleId' => $moduleId
                ];
                
                $courses[$indices['courseIndex']]['modules'][$indices['moduleIndex']]['lessons'][] = $lesson;
            }
            
            return $courses;
            
        } catch (\PDOException $e) {
            throw new \Exception("Database error: " . $e->getMessage());
        }
    }

    // Implement getById, create, update, and delete methods
}
```

### 3. Create Authentication Middleware

Create a file `middleware/Auth.php`:

```php
<?php
namespace Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private $secret;

    public function __construct() {
        $this->secret = $_ENV['JWT_SECRET'];
    }

    public function validateToken() {
        // Get authorization header
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? '';

        // Check if token exists
        if (!preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
            return null;
        }

        $jwt = $matches[1];

        try {
            // Decode token
            $decoded = JWT::decode($jwt, new Key($this->secret, 'HS256'));
            
            // Return user data from token
            return [
                'id' => $decoded->sub,
                'email' => $decoded->email,
                'name' => $decoded->name
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    public function generateToken($user) {
        $issuedAt = time();
        $expiresAt = $issuedAt + 60 * 60 * 24 * 30; // 30 days

        $payload = [
            'sub' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'iat' => $issuedAt,
            'exp' => $expiresAt
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }
}
```

## Database Access

### Create Models for Each Entity

Create model files for each entity in your database:

1. `models/User.php`
2. `models/Module.php`
3. `models/Lesson.php`
4. `models/Note.php`
5. `models/Bookmark.php`
6. `models/UserProgress.php`

Each model should follow the same pattern as the Course model, with methods for CRUD operations.

## Authentication

### 1. Create Auth Controller

Create a file `controllers/AuthController.php`:

```php
<?php
namespace Controllers;

require_once 'models/User.php';
require_once 'middleware/Auth.php';

use Models\User;
use Middleware\Auth;
use GuzzleHttp\Client;

class AuthController {
    private $user;
    private $auth;
    private $db;

    public function __construct() {
        // Initialize database connection
        require_once 'config/Database.php';
        $database = new \Config\Database();
        $this->db = $database->getConnection();
        
        // Initialize user model
        $this->user = new User($this->db);
        
        // Initialize auth middleware
        $this->auth = new Auth();
    }

    public function signin() {
        try {
            // Get request body
            $data = json_decode(file_get_contents("php://input"));
            
            // Validate required fields
            if (!isset($data->email) || !isset($data->password)) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password are required']);
                return;
            }
            
            // Find user by email
            $user = $this->user->findByEmail($data->email);
            
            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                return;
            }
            
            // Verify password
            if (!password_verify($data->password, $user['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                return;
            }
            
            // Generate token
            $token = $this->auth->generateToken($user);
            
            // Return user and token
            echo json_encode([
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'image' => $user['image']
                ],
                'token' => $token
            ]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Authentication failed: ' . $e->getMessage()]);
        }
    }

    public function googleAuth() {
        try {
            // Get request body
            $data = json_decode(file_get_contents("php://input"));
            
            // Validate required fields
            if (!isset($data->code)) {
                http_response_code(400);
                echo json_encode(['error' => 'Authorization code is required']);
                return;
            }
            
            // Exchange code for token
            $client = new Client();
            $response = $client->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'code' => $data->code,
                    'client_id' => $_ENV['GOOGLE_CLIENT_ID'],
                    'client_secret' => $_ENV['GOOGLE_CLIENT_SECRET'],
                    'redirect_uri' => $data->redirectUri ?? 'http://localhost:3000/api/auth/callback/google',
                    'grant_type' => 'authorization_code'
                ]
            ]);
            
            $tokens = json_decode($response->getBody()->getContents(), true);
            
            // Get user info
            $userInfo = $client->get('https://www.googleapis.com/oauth2/v3/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $tokens['access_token']
                ]
            ]);
            
            $googleUser = json_decode($userInfo->getBody()->getContents(), true);
            
            // Find or create user
            $user = $this->user->findByEmail($googleUser['email']);
            
            if (!$user) {
                // Create new user
                $userId = $this->user->create([
                    'name' => $googleUser['name'],
                    'email' => $googleUser['email'],
                    'image' => $googleUser['picture'],
                    'provider' => 'google',
                    'providerAccountId' => $googleUser['sub']
                ]);
                
                $user = $this->user->findById($userId);
            } else {
                // Update user with Google info
                $this->user->update($user['id'], [
                    'name' => $googleUser['name'],
                    'image' => $googleUser['picture'],
                    'provider' => 'google',
                    'providerAccountId' => $googleUser['sub']
                ]);
            }
            
            // Generate token
            $token = $this->auth->generateToken($user);
            
            // Return user and token
            echo json_encode([
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'image' => $user['image']
                ],
                'token' => $token
            ]);
            
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Google authentication failed: ' . $e->getMessage()]);
        }
    }

    // Implement signup, signout, and session methods
}
```

### 2. Update Frontend to Use PHP Authentication

Modify your Next.js authentication code to use the PHP endpoints:

```typescript
// app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// ...other imports

export default function SignInPage() {
  // ...existing code

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Call PHP API instead of using NextAuth
      const response = await fetch("/api/php/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }
      
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);
      
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect to dashboard
      router.push("/dashboard");
      
    } catch (error) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // ...rest of the component
}
```

## Deployment

### 1. Update Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve PHP API
    location /api/php/ {
        alias /var/www/html/php-api/;
        try_files $uri $uri/ /index.php?$query_string;
        
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        }
    }
}
```

### 2. Deploy PHP API

```bash
# Copy PHP files to server
scp -r ./php-api/* username@your-azure-vps-ip:/var/www/html/php-api/

# Set permissions
ssh username@your-azure-vps-ip "chmod -R 755 /var/www/html/php-api"
```

## Testing

### 1. Test Authentication

```bash
# Test signin endpoint
curl -X POST http://localhost/api/php/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Course API

```bash
# Get all courses
curl -X GET http://localhost/api/php/courses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a course
curl -X POST http://localhost/api/php/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"PHP Course","description":"Learn PHP","difficulty":"Beginner","topic":"Programming"}'
```

## Conclusion

This guide provides a framework for migrating your AI Tutor application from TypeScript to PHP for the backend API. The frontend Next.js application remains unchanged, but now communicates with PHP endpoints instead of TypeScript API routes.

Remember to:

1. Test thoroughly after migration
2. Update all frontend code that calls API endpoints
3. Implement proper error handling
4. Secure your PHP endpoints with proper authentication
5. Optimize database queries for performance

By following this guide, you can leverage PHP's strengths while maintaining the modern React frontend of your Next.js application.
