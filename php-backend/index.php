<?php
/**
 * Main entry point for the PHP-FPM backend
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set CORS headers to allow cross-origin requests from the Next.js frontend
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include logger and fallback mode
require_once __DIR__ . '/includes/logger.php';
require_once __DIR__ . '/includes/fallback.php';

// Parse the URI from the request
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = ltrim($uri, '/');

// For PHP-FPM, we need to handle the URI differently
// The URI might be something like /api/notes or api/notes
if (strpos($uri, 'api/') === 0) {
    // URI already starts with api/
} elseif (strpos($uri, '/api/') === 0) {
    $uri = substr($uri, 1); // Remove leading slash
} elseif (preg_match('#^/index\.php/api/#', $uri)) {
    $uri = substr($uri, 10); // Remove /index.php/
}

// Log the API request with additional context for PHP-FPM
logApiRequest(['mode' => 'php-fpm', 'parsed_uri' => $uri]);

if ($uri === 'api/test' || $uri === 'api/test.php') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'PHP backend API test endpoint is working!',
        'time' => date('Y-m-d H:i:s'),
        'php_version' => phpversion(),
        'uri' => $uri
    ]);
    exit;
} elseif ($uri === 'api/notes' || $uri === 'api/notes.php') {
    if (isset($_GET['test'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'Notes API is working!',
            'time' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    if (file_exists(__DIR__ . '/api/notes.php')) {
        require __DIR__ . '/api/notes.php';
        exit;
    }
} elseif ($uri === 'api/bookmarks' || $uri === 'api/bookmarks.php') {
    if (isset($_GET['test'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'Bookmarks API is working!',
            'time' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    if (file_exists(__DIR__ . '/api/bookmarks.php')) {
        require __DIR__ . '/api/bookmarks.php';
        exit;
    }
} elseif ($uri === 'api/user-progress' || $uri === 'api/user-progress.php') {
    if (isset($_GET['test'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'User Progress API is working!',
            'time' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    if (file_exists(__DIR__ . '/api/user-progress.php')) {
        require __DIR__ . '/api/user-progress.php';
        exit;
    }
} elseif ($uri === 'api/knowledge-test' || $uri === 'api/knowledge-test.php') {
    if (isset($_GET['test'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'Knowledge Test API is working!',
            'time' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    if (file_exists(__DIR__ . '/api/knowledge-test.php')) {
        require __DIR__ . '/api/knowledge-test.php';
        exit;
    }
} elseif ($uri === 'api/course-generator' || $uri === 'api/course-generator.php') {
    if (isset($_GET['test'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'Course Generator API is working!',
            'time' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    if (file_exists(__DIR__ . '/api/course-generator.php')) {
        require __DIR__ . '/api/course-generator.php';
        exit;
    }
} elseif ($uri === 'api/health' || $uri === 'api/health.php') {
    // Health check endpoint - no authentication required
    if (file_exists(__DIR__ . '/api/health.php')) {
        require __DIR__ . '/api/health.php';
        exit;
    }
} elseif ($uri === 'test.html') {
    // Serve the test HTML page
    header('Content-Type: text/html');
    readfile(__DIR__ . '/test.html');
    exit;
} elseif ($uri === '' || $uri === 'index.php') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'PHP Backend API',
        'endpoints' => [
            '/api/test',
            '/api/notes',
            '/api/bookmarks',
            '/api/user-progress',
            '/api/knowledge-test',
            '/api/course-generator',
            '/api/health'
        ]
    ]);
    exit;
} else {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found: ' . $uri]);
    exit;
}
