# Guide: Integrating PHP with Next.js

This guide explains how to integrate PHP with your Next.js application. While Next.js is primarily a React framework that uses JavaScript/TypeScript, there are scenarios where you might want to use PHP for certain backend functionality.

## Table of Contents

1. [Understanding the Architecture](#understanding-the-architecture)
2. [Setting Up PHP on Your Server](#setting-up-php-on-your-server)
3. [Creating PHP API Endpoints](#creating-php-api-endpoints)
4. [Calling PHP APIs from Next.js](#calling-php-apis-from-nextjs)
5. [Handling Authentication Between Next.js and PHP](#handling-authentication-between-nextjs-and-php)
6. [Database Access with PHP](#database-access-with-php)
7. [Deployment Considerations](#deployment-considerations)
8. [Example Implementation](#example-implementation)

## Understanding the Architecture

When integrating PHP with Next.js, you'll typically use a hybrid architecture:

- **Next.js (Frontend + Some Backend)**: Handles React components, routing, and potentially some API routes
- **PHP (Backend)**: Handles specific backend functionality, database operations, or legacy code

This approach works best when:
- You have existing PHP code you want to reuse
- You need PHP-specific libraries or functionality
- Your team has PHP expertise you want to leverage

## Setting Up PHP on Your Server

### Prerequisites

- Node.js and npm (for Next.js)
- PHP 7.4+ installed on your server
- A web server like Apache or Nginx
- MySQL or PostgreSQL database (if needed)

### Server Configuration

#### Option 1: Separate Servers

Run Next.js and PHP on separate servers/ports:

1. Next.js on port 3000
2. PHP with Apache/Nginx on port 80/443

#### Option 2: Same Server with Proxy

Run both on the same server with a proxy configuration:

```nginx
# Nginx configuration example
server {
    listen 80;
    server_name yourdomain.com;

    # Serve Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve PHP files
    location /api/php/ {
        alias /var/www/html/php-api/;
        try_files $uri $uri/ /index.php?$query_string;
        
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }
}
```

## Creating PHP API Endpoints

Create a directory for your PHP API files:

```
/var/www/html/php-api/
```

### Example PHP API Endpoint

Create a file `api.php`:

```php
<?php
// Set headers to allow cross-origin requests and specify JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get the HTTP method and endpoint from the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
$endpoint = $request[0] ?? '';

// Connect to database
$conn = new mysqli("localhost", "username", "password", "database");
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Handle different endpoints
switch ($endpoint) {
    case 'courses':
        handleCourses($method, $request, $conn);
        break;
    case 'users':
        handleUsers($method, $request, $conn);
        break;
    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
        break;
}

// Close database connection
$conn->close();

// Function to handle courses endpoint
function handleCourses($method, $request, $conn) {
    $id = $request[1] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific course
                $stmt = $conn->prepare("SELECT * FROM courses WHERE id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $course = $result->fetch_assoc();
                echo json_encode($course);
            } else {
                // Get all courses
                $result = $conn->query("SELECT * FROM courses");
                $courses = [];
                while ($row = $result->fetch_assoc()) {
                    $courses[] = $row;
                }
                echo json_encode($courses);
            }
            break;
            
        case 'POST':
            // Create new course
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $conn->prepare("INSERT INTO courses (title, description, difficulty, topic, userId) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssi", $data->title, $data->description, $data->difficulty, $data->topic, $data->userId);
            if ($stmt->execute()) {
                $data->id = $conn->insert_id;
                echo json_encode($data);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to create course"]);
            }
            break;
            
        // Add PUT and DELETE methods as needed
            
        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
    }
}

// Function to handle users endpoint
function handleUsers($method, $request, $conn) {
    // Similar implementation as handleCourses
    // ...
}
?>
```

## Calling PHP APIs from Next.js

Replace your TypeScript API calls with calls to your PHP endpoints:

```typescript
// Before (TypeScript API route)
// app/api/courses/route.ts
async function getCourses() {
  const courses = await prisma.course.findMany();
  return courses;
}

// After (calling PHP API)
// app/courses/page.tsx
"use client";
import { useState, useEffect } from 'react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/php/api.php/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourses();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {courses.map(course => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Handling Authentication Between Next.js and PHP

### Option 1: JWT Authentication

1. Use NextAuth.js for authentication in your Next.js app
2. Pass the JWT token to your PHP API
3. Verify the token in PHP

```php
<?php
// PHP code to verify JWT token
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Get token from Authorization header
$headers = getallheaders();
$auth = $headers['Authorization'] ?? '';

if (preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
    $jwt = $matches[1];
    
    try {
        // Verify token
        $decoded = JWT::decode($jwt, new Key('your_secret_key', 'HS256'));
        
        // Token is valid, proceed with the request
        // $decoded->sub contains the user ID
        
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: " . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized: No token provided"]);
    exit;
}
?>
```

### Option 2: Session-Based Authentication

1. Use PHP sessions
2. Share the session cookie between Next.js and PHP

## Database Access with PHP

### Using PDO for Database Access

```php
<?php
// Connect to PostgreSQL database
try {
    $dsn = "pgsql:host=localhost;port=5432;dbname=aitutor;user=aitutoruser;password=your_password";
    $pdo = new PDO($dsn);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Query example
    $stmt = $pdo->prepare("SELECT * FROM courses WHERE user_id = ?");
    $stmt->execute([$userId]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($courses);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
```

## Deployment Considerations

### Deploying to Azure VPS

1. Install both Node.js and PHP on your Azure VPS
2. Set up Nginx to serve both Next.js and PHP
3. Configure environment variables for both environments

```bash
# Install PHP and required extensions
sudo apt update
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-pgsql php8.1-mbstring php8.1-xml php8.1-curl

# Start and enable PHP-FPM
sudo systemctl start php8.1-fpm
sudo systemctl enable php8.1-fpm

# Configure Nginx (see configuration example above)
```

### Security Considerations

1. Use HTTPS for all communications
2. Implement proper authentication and authorization
3. Validate and sanitize all inputs in PHP
4. Use prepared statements for database queries
5. Set appropriate CORS headers

## Example Implementation

### Directory Structure

```
/var/www/ai-tutor/           # Next.js application
  ├── app/                   # Next.js app directory
  ├── components/            # React components
  ├── public/                # Static assets
  └── ...

/var/www/html/php-api/       # PHP API directory
  ├── api.php                # Main API handler
  ├── config.php             # Database configuration
  ├── auth.php               # Authentication functions
  ├── models/                # PHP model classes
  │   ├── Course.php
  │   ├── User.php
  │   └── ...
  └── vendor/                # Composer dependencies
```

### Example PHP Model Class

```php
<?php
// models/Course.php
class Course {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getAll() {
        $query = "SELECT * FROM courses ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
    
    public function getById($id) {
        $query = "SELECT * FROM courses WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function create($data) {
        $query = "INSERT INTO courses (title, description, difficulty, topic, user_id) 
                  VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ssssi", 
            $data->title, 
            $data->description, 
            $data->difficulty, 
            $data->topic, 
            $data->userId
        );
        
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    // Add update and delete methods
}
?>
```

### Migrating from TypeScript to PHP

1. Identify TypeScript API routes to replace
2. Create equivalent PHP endpoints
3. Update frontend code to call PHP APIs
4. Test thoroughly to ensure compatibility

## Conclusion

Integrating PHP with Next.js allows you to leverage the strengths of both technologies. While this hybrid approach adds some complexity, it can be beneficial when:

- You need to integrate with existing PHP systems
- Your team has strong PHP expertise
- You require PHP-specific libraries or functionality

Remember that this approach works best when you have a clear separation of concerns between your Next.js frontend and PHP backend.
