<?php
/**
 * Health Check API
 * Verifies the PHP backend and database connection are working properly
 */

header('Content-Type: application/json');

// Initialize response
$response = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'components' => [
        'php' => [
            'status' => 'healthy',
            'version' => phpversion()
        ],
        'database' => [
            'status' => 'unknown'
        ]
    ]
];

// Check database connection
try {
    require_once __DIR__ . '/../includes/utils.php';

    // Check if PostgreSQL driver is available
    $availableDrivers = PDO::getAvailableDrivers();
    if (!in_array('pgsql', $availableDrivers)) {
        throw new Exception("PostgreSQL driver not available. Available drivers: " . implode(', ', $availableDrivers));
    }

    // Check if DATABASE_URL is set
    $databaseUrl = getenv('DATABASE_URL');
    if (!$databaseUrl) {
        throw new Exception('DATABASE_URL environment variable is not set');
    }

    // Parse the database URL to verify format
    $dbParams = parse_url($databaseUrl);
    if (!isset($dbParams['host']) || !isset($dbParams['path'])) {
        throw new Exception('Invalid DATABASE_URL format. Expected: postgresql://username:password@host:port/dbname');
    }

    // Measure database response time
    $startTime = microtime(true);

    // Get database connection
    $pdo = getDbConnection();

    // Simple query to test connection
    $stmt = $pdo->query('SELECT 1');
    $stmt->fetch();

    // Calculate response time in milliseconds
    $responseTime = round((microtime(true) - $startTime) * 1000);

    // Get connection pool statistics
    $poolStats = [];
    if (class_exists('DbConnectionPool')) {
        $pool = DbConnectionPool::getInstance();
        $poolStats = $pool->getStats();
    }

    // Update database status
    $response['components']['database'] = [
        'status' => 'healthy',
        'responseTime' => $responseTime,
        'connectionPool' => $poolStats,
        'driver' => 'pgsql',
        'availableDrivers' => $availableDrivers
    ];
} catch (Exception $e) {
    // Database connection failed
    $response['status'] = 'degraded';
    $response['components']['database'] = [
        'status' => 'unhealthy',
        'error' => $e->getMessage(),
        'availableDrivers' => PDO::getAvailableDrivers()
    ];

    // Log the error
    if (function_exists('logError')) {
        logError("Health check - Database connection error: " . $e->getMessage(), [
            'availableDrivers' => PDO::getAvailableDrivers(),
            'databaseUrl' => isset($databaseUrl) ? preg_replace('/:[^:@\/]+@/', ':***@', $databaseUrl) : 'not set'
        ]);
    } else {
        error_log("[PHP] Health check - Database connection error: " . $e->getMessage() .
                  " (Available drivers: " . implode(', ', PDO::getAvailableDrivers()) . ")");
    }
}

// Check disk space
$diskTotal = disk_total_space('/');
$diskFree = disk_free_space('/');
$diskUsed = $diskTotal - $diskFree;
$diskUsedPercent = round(($diskUsed / $diskTotal) * 100);

$response['components']['disk'] = [
    'status' => $diskUsedPercent > 90 ? 'warning' : 'healthy',
    'used' => $diskUsedPercent . '%',
    'free' => formatBytes($diskFree)
];

// Check memory usage
if (function_exists('memory_get_usage')) {
    $memoryUsed = memory_get_usage(true);
    $response['components']['memory'] = [
        'status' => 'healthy',
        'used' => formatBytes($memoryUsed)
    ];
}

// Return the health status
echo json_encode($response, JSON_PRETTY_PRINT);

/**
 * Format bytes to human-readable format
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];

    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);

    $bytes /= (1 << (10 * $pow));

    return round($bytes, $precision) . ' ' . $units[$pow];
}
