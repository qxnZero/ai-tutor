<?php
require_once __DIR__ . '/../includes/utils.php';

// No authentication required for health check
$method = $_SERVER['REQUEST_METHOD'];
$isFallback = isset($_GET['fallback']) && $_GET['fallback'] == '1';

if ($method !== 'GET') {
    sendErrorResponse('Method not supported', 405);
}

// If fallback mode is requested, return a simple response
if ($isFallback) {
    sendJsonResponse([
        'status' => 'healthy',
        'message' => 'Fallback health check passed'
    ]);
    exit;
}

// Check database connection
$dbStatus = 'unknown';
$dbError = null;

try {
    $pdo = getDbConnection();
    $stmt = $pdo->query('SELECT 1');
    if ($stmt) {
        $dbStatus = 'healthy';
    } else {
        $dbStatus = 'degraded';
        $dbError = 'Database query failed';
    }
} catch (Exception $e) {
    $dbStatus = 'unhealthy';
    $dbError = $e->getMessage();
}

// Prepare response
$response = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'components' => [
        'php' => [
            'status' => 'healthy',
            'version' => PHP_VERSION
        ],
        'database' => [
            'status' => $dbStatus
        ]
    ]
];

// Add error details if any
if ($dbError) {
    $response['components']['database']['error'] = $dbError;
}

// If any component is unhealthy, mark the overall status as unhealthy
foreach ($response['components'] as $component) {
    if ($component['status'] === 'unhealthy') {
        $response['status'] = 'unhealthy';
        break;
    } else if ($component['status'] === 'degraded' && $response['status'] !== 'unhealthy') {
        $response['status'] = 'degraded';
    }
}

sendJsonResponse($response);
