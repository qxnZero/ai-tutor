<?php
// Enhanced router for PHP backend with logging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log the request with [PHP] prefix
$requestTime = date('Y-m-d H:i:s');
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$requestIp = $_SERVER['REMOTE_ADDR'];

// Print log with [PHP] prefix for easy identification
error_log("[PHP] $requestTime - $requestMethod $requestUri - $requestIp");
echo "\033[36m[PHP]\033[0m $requestMethod $requestUri\n";

// Static files should be served directly
if (preg_match('/\.(?:png|jpg|jpeg|gif|css|js)$/', $_SERVER["REQUEST_URI"])) {
    return false; // Serve the requested file as-is
}

// Route everything else to index.php
require __DIR__ . '/index.php';
