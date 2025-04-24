<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = ltrim($uri, '/');

if (strpos($uri, 'api/') === 0) {
    // URI already starts with api/
} elseif (strpos($uri, '/api/') === 0) {
    $uri = substr($uri, 1);
} elseif (preg_match('#^/index\.php/api/#', $uri)) {
    $uri = substr($uri, 10);
}

if ($uri === 'api/notes' || $uri === 'api/notes.php') {
    if (file_exists(__DIR__ . '/api/notes.php')) {
        require __DIR__ . '/api/notes.php';
        exit;
    }
} elseif ($uri === 'api/bookmarks' || $uri === 'api/bookmarks.php') {
    if (file_exists(__DIR__ . '/api/bookmarks.php')) {
        require __DIR__ . '/api/bookmarks.php';
        exit;
    }
} elseif ($uri === 'api/user-progress' || $uri === 'api/user-progress.php') {
    if (file_exists(__DIR__ . '/api/user-progress.php')) {
        require __DIR__ . '/api/user-progress.php';
        exit;
    }
} elseif ($uri === 'api/course-statistics' || $uri === 'api/course-statistics.php') {
    if (file_exists(__DIR__ . '/api/course-statistics.php')) {
        require __DIR__ . '/api/course-statistics.php';
        exit;
    }
} elseif ($uri === 'api/user-activity' || $uri === 'api/user-activity.php') {
    if (file_exists(__DIR__ . '/api/user-activity.php')) {
        require __DIR__ . '/api/user-activity.php';
        exit;
    }
} elseif ($uri === 'api/health' || $uri === 'api/health.php') {
    if (file_exists(__DIR__ . '/api/health.php')) {
        require __DIR__ . '/api/health.php';
        exit;
    }
} elseif ($uri === 'api/knowledge-test' || $uri === 'api/knowledge-test.php') {
    if (file_exists(__DIR__ . '/api/knowledge-test.php')) {
        require __DIR__ . '/api/knowledge-test.php';
        exit;
    }
} elseif ($uri === '' || $uri === 'index.php') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'PHP Backend API',
        'endpoints' => [
            '/api/notes',
            '/api/bookmarks',
            '/api/user-progress',
            '/api/course-statistics',
            '/api/user-activity'
        ]
    ]);
    exit;
} elseif (strpos($uri, 'api/') === 0 || $uri === '' || $uri === 'index.php') {
    // Only return 404 for API requests or root requests
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
    exit;
}
