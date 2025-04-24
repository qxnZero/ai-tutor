<?php
/**
 * Router script for PHP-FPM
 * This script is used by the PHP-FPM server to route requests to the appropriate handler
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$requestTime = date('Y-m-d H:i:s');
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$requestIp = $_SERVER['REMOTE_ADDR'];

// Log request to error log
error_log("[PHP-FPM] $requestTime - $requestMethod $requestUri - $requestIp");

// Handle static files
if (preg_match('/\.(?:png|jpg|jpeg|gif|css|js)$/', $_SERVER["REQUEST_URI"])) {
    $file = __DIR__ . $_SERVER["REQUEST_URI"];
    if (file_exists($file)) {
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        switch ($extension) {
            case 'css':
                header('Content-Type: text/css');
                break;
            case 'js':
                header('Content-Type: application/javascript');
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
        }
        readfile($file);
        exit;
    } else {
        header('HTTP/1.0 404 Not Found');
        exit;
    }
}

// Route all other requests to index.php
require __DIR__ . '/index.php';
