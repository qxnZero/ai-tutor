<?php
/**
 * Utility functions for the PHP backend
 */

/**
 * Database connection pool
 * Manages a pool of PDO connections to the PostgreSQL database
 */
class DbConnectionPool {
    private static $instance = null;
    private $connections = [];
    private $maxConnections = 10;
    private $idleTimeout = 60; // seconds
    private $dsn;
    private $username;
    private $password;
    private $options;
    private $lastCleanup = 0;

    /**
     * Private constructor to enforce singleton pattern
     */
    private function __construct() {
        // Load environment variables from .env file
        $this->loadEnvVariables();

        // Get database connection string from environment
        $databaseUrl = getenv('DATABASE_URL');

        if (!$databaseUrl) {
            throw new Exception('DATABASE_URL environment variable is not set');
        }

        // Parse the database URL
        $dbParams = parse_url($databaseUrl);

        $host = $dbParams['host'];
        $port = $dbParams['port'] ?? 5432;
        $dbname = ltrim($dbParams['path'], '/');
        $this->username = $dbParams['user'];
        $this->password = $dbParams['pass'];

        // Set connection string
        $this->dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

        // Set PDO options
        $this->options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5, // 5 seconds timeout
            PDO::ATTR_PERSISTENT => false // Non-persistent connections for better control
        ];

        // Get pool configuration from environment variables
        $this->maxConnections = (int)getenv('DB_MAX_CONNECTIONS') ?: 10;
        $this->idleTimeout = (int)getenv('DB_IDLE_TIMEOUT') ?: 60;

        // Log pool initialization
        if (function_exists('logInfo')) {
            logInfo("Database connection pool initialized", [
                'maxConnections' => $this->maxConnections,
                'idleTimeout' => $this->idleTimeout
            ]);
        }
    }

    /**
     * Load environment variables from .env file
     */
    private function loadEnvVariables() {
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);

                    // Remove quotes if present
                    if (preg_match('/^"(.+)"$/', $value, $matches)) {
                        $value = $matches[1];
                    } elseif (preg_match("/^'(.+)'$/", $value, $matches)) {
                        $value = $matches[1];
                    }

                    $_ENV[$key] = $value;
                    putenv("$key=$value");
                }
            }
        }
    }

    /**
     * Get the singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Get a connection from the pool
     */
    public function getConnection() {
        // Clean up idle connections periodically
        $this->cleanupIdleConnections();

        // Check for available connections in the pool
        foreach ($this->connections as $key => $connInfo) {
            if (!$connInfo['in_use']) {
                // Mark connection as in use
                $this->connections[$key]['in_use'] = true;
                $this->connections[$key]['last_used'] = time();

                // Test connection and return if valid
                try {
                    $conn = $this->connections[$key]['connection'];
                    $conn->query('SELECT 1'); // Test query
                    return $conn;
                } catch (PDOException $e) {
                    // Connection is stale, remove it
                    unset($this->connections[$key]);
                    // Continue to create a new connection
                }
            }
        }

        // Create a new connection if pool is not full
        if (count($this->connections) < $this->maxConnections) {
            try {
                // Check if pgsql driver is available
                $availableDrivers = PDO::getAvailableDrivers();
                if (!in_array('pgsql', $availableDrivers)) {
                    throw new PDOException("PostgreSQL driver not available. Available drivers: " . implode(', ', $availableDrivers));
                }

                $conn = new PDO($this->dsn, $this->username, $this->password, $this->options);
                $key = spl_object_hash($conn);
                $this->connections[$key] = [
                    'connection' => $conn,
                    'in_use' => true,
                    'created' => time(),
                    'last_used' => time()
                ];
                return $conn;
            } catch (PDOException $e) {
                // Log more detailed error information
                if (function_exists('logError')) {
                    logError("Failed to create database connection: " . $e->getMessage(), [
                        'code' => $e->getCode(),
                        'dsn' => $this->dsn,
                        'availableDrivers' => PDO::getAvailableDrivers()
                    ]);
                } else {
                    error_log("[PHP] Database connection error: " . $e->getMessage() .
                              " (Available drivers: " . implode(', ', PDO::getAvailableDrivers()) . ")");
                }
                throw new Exception('Database connection failed: ' . $e->getMessage());
            }
        }

        // If we reach here, the pool is full with all connections in use
        if (function_exists('logWarning')) {
            logWarning("Database connection pool is full", [
                'poolSize' => count($this->connections),
                'maxConnections' => $this->maxConnections
            ]);
        }

        // Wait for a connection to become available
        usleep(100000); // 100ms
        return $this->getConnection(); // Recursive call, be careful with stack overflow
    }

    /**
     * Release a connection back to the pool
     */
    public function releaseConnection($conn) {
        $key = spl_object_hash($conn);
        if (isset($this->connections[$key])) {
            $this->connections[$key]['in_use'] = false;
            $this->connections[$key]['last_used'] = time();
        }
    }

    /**
     * Clean up idle connections
     */
    private function cleanupIdleConnections() {
        $now = time();

        // Only run cleanup every minute
        if ($now - $this->lastCleanup < 60) {
            return;
        }

        $this->lastCleanup = $now;
        $idleTimeout = $this->idleTimeout;

        foreach ($this->connections as $key => $connInfo) {
            // Remove connections that have been idle for too long
            if (!$connInfo['in_use'] && ($now - $connInfo['last_used'] > $idleTimeout)) {
                unset($this->connections[$key]);
            }
        }

        if (function_exists('logDebug')) {
            logDebug("Cleaned up idle database connections", [
                'poolSize' => count($this->connections),
                'maxConnections' => $this->maxConnections
            ]);
        }
    }

    /**
     * Get pool statistics
     */
    public function getStats() {
        $activeCount = 0;
        $idleCount = 0;

        foreach ($this->connections as $connInfo) {
            if ($connInfo['in_use']) {
                $activeCount++;
            } else {
                $idleCount++;
            }
        }

        return [
            'total' => count($this->connections),
            'active' => $activeCount,
            'idle' => $idleCount,
            'max' => $this->maxConnections
        ];
    }
}

/**
 * Get a database connection
 * Returns a PDO instance connected to the PostgreSQL database
 * Falls back to a mock connection if the real connection fails
 */
function getDbConnection() {
    // Check if we should use fallback mode
    if (function_exists('isFallbackMode') && isFallbackMode()) {
        return getMockDbConnection();
    }

    // Try to use the connection pool
    try {
        static $pool = null;

        if ($pool === null) {
            $pool = DbConnectionPool::getInstance();
        }

        return $pool->getConnection();
    } catch (Exception $e) {
        // If fallback.php is available, try to use it
        $fallbackFile = __DIR__ . '/fallback.php';
        if (file_exists($fallbackFile)) {
            require_once $fallbackFile;
            if (function_exists('getFallbackDbConnection')) {
                return getFallbackDbConnection();
            }
        }

        // If we get here, we can't recover
        throw $e;
    }
}

/**
 * Send a JSON response
 *
 * @param mixed $data The data to send
 * @param int $statusCode HTTP status code
 */
function sendJsonResponse($data, $statusCode = 200) {
    header('Content-Type: application/json');
    http_response_code($statusCode);

    // Log the response
    if (function_exists('logApiResponse')) {
        logApiResponse($statusCode, $data);
    }

    echo json_encode($data);
    exit;
}

/**
 * Send a standardized error response
 *
 * @param string $message Error message
 * @param int $statusCode HTTP status code
 * @param string|null $details Additional error details
 * @param string|null $errorCode Custom error code
 */
function sendErrorResponse($message, $statusCode = 400, $details = null, $errorCode = null) {
    $response = [
        'status' => 'error',
        'code' => $statusCode,
        'message' => $message
    ];

    if ($details) {
        $response['details'] = $details;
    }

    if ($errorCode) {
        $response['errorCode'] = $errorCode;
    }

    // Log the error with enhanced logging
    $requestUri = $_SERVER['REQUEST_URI'] ?? 'unknown';
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'unknown';

    if (function_exists('logError')) {
        logError("Error response: $message", [
            'statusCode' => $statusCode,
            'details' => $details,
            'errorCode' => $errorCode,
            'method' => $requestMethod,
            'uri' => $requestUri
        ]);
    } else {
        error_log("[PHP] Error response ($statusCode): $message - $requestMethod $requestUri");
    }

    sendJsonResponse($response, $statusCode);
}

/**
 * Get the request body as an associative array
 *
 * @return array The request body
 */
function getRequestBody() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorResponse(
            'Invalid JSON in request body',
            400,
            json_last_error_msg(),
            'INVALID_JSON'
        );
    }

    return $data;
}

/**
 * Validate required fields in the request data
 *
 * @param array $data The request data
 * @param array $requiredFields List of required field names
 */
function validateRequired($data, $requiredFields) {
    $missing = [];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }

    if (!empty($missing)) {
        sendErrorResponse(
            'Missing required fields',
            400,
            'The following fields are required: ' . implode(', ', $missing),
            'VALIDATION_ERROR'
        );
    }
}

/**
 * Generate a unique ID for database records
 *
 * @return string A unique ID
 */
function generateId() {
    return bin2hex(random_bytes(12));
}
