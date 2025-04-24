<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

error_log("\033[36m[PHP]\033[0m $requestMethod $requestUri");

// Handle static files
$filePath = __DIR__ . parse_url($requestUri, PHP_URL_PATH);
$extension = pathinfo($filePath, PATHINFO_EXTENSION);

// If the file exists and has a valid extension, serve it directly
if (file_exists($filePath) && in_array($extension, ['html', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'json'])) {
    // Set the appropriate content type
    switch ($extension) {
        case 'html':
            header('Content-Type: text/html');
            break;
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'json':
            header('Content-Type: application/json');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
        case 'gif':
            header('Content-Type: image/gif');
            break;
        case 'svg':
            header('Content-Type: image/svg+xml');
            break;
    }

    // Output the file content
    readfile($filePath);
    exit;
}

// For API requests, use the index.php router
require __DIR__ . '/index.php';
