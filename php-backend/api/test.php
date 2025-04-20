<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'PHP backend API test endpoint is working!',
    'time' => date('Y-m-d H:i:s'),
    'php_version' => phpversion()
]);
