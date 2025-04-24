<?php
// Simple test script for PHP-FPM
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'PHP-FPM is working!',
    'time' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'extensions' => get_loaded_extensions(),
    'pdo_drivers' => PDO::getAvailableDrivers()
]);
