<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$requestTime = date('Y-m-d H:i:s');
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$requestIp = $_SERVER['REMOTE_ADDR'];

error_log("[PHP] $requestTime - $requestMethod $requestUri - $requestIp");
echo "\033[36m[PHP]\033[0m $requestMethod $requestUri\n";

if (preg_match('/\.(?:png|jpg|jpeg|gif|css|js)$/', $_SERVER["REQUEST_URI"])) {
    return false;
}

require __DIR__ . '/index.php';
