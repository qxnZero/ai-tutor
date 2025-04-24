<?php
/**
 * Utility functions for the PHP backend
 */

/**
 * Load environment variables from .env file
 */
function loadEnvVariables() {
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
 * Get a database connection
 * Returns a PDO instance connected to the PostgreSQL database
 * Falls back to a mock connection if the real connection fails
 */
function getDbConnection() {
    // Load environment variables if not already loaded
    loadEnvVariables();

    // Get database connection string from environment
    $databaseUrl = getenv('DATABASE_URL');

    if (!$databaseUrl) {
        throw new Exception('DATABASE_URL environment variable is not set');
    }

    try {
        // Check if pgsql driver is available
        $availableDrivers = PDO::getAvailableDrivers();

        // Check for both pgsql and pdo_pgsql drivers
        $pgsqlAvailable = in_array('pgsql', $availableDrivers);
        $pdoPgsqlAvailable = in_array('pgsql', $availableDrivers) || extension_loaded('pdo_pgsql');

        if (!$pgsqlAvailable && !$pdoPgsqlAvailable) {
            error_log("[PHP] PostgreSQL drivers not available. Available PDO drivers: " . implode(', ', $availableDrivers));
            error_log("[PHP] Loaded extensions: " . implode(', ', get_loaded_extensions()));

            // Try to use fallback mode instead of throwing an exception immediately
            $fallbackFile = __DIR__ . '/fallback.php';
            if (file_exists($fallbackFile)) {
                require_once $fallbackFile;
                if (function_exists('getFallbackDbConnection')) {
                    error_log("[PHP] Using fallback database connection due to missing PostgreSQL drivers");
                    return getFallbackDbConnection();
                }
            }

            throw new PDOException("PostgreSQL driver not available. Available drivers: " . implode(', ', $availableDrivers));
        }

        // Parse the database URL
        $dbParams = parse_url($databaseUrl);

        $host = $dbParams['host'];
        $port = $dbParams['port'] ?? 5432;
        $dbname = ltrim($dbParams['path'], '/');
        $username = $dbParams['user'];
        $password = $dbParams['pass'];

        // Set connection string - try to use sslmode=prefer instead of require for local development
        $sslmode = (strpos($host, 'localhost') !== false || $host === '127.0.0.1') ? 'prefer' : 'require';
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=$sslmode";

        // Set PDO options
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5 // 5 seconds timeout
        ];

        // Create and return the connection
        return new PDO($dsn, $username, $password, $options);

    } catch (PDOException $e) {
        // Log error information
        error_log("[PHP] Database connection error: " . $e->getMessage() .
                  " (Available drivers: " . implode(', ', $availableDrivers) . ")");

        // If fallback.php is available, try to use it
        $fallbackFile = __DIR__ . '/fallback.php';
        if (file_exists($fallbackFile)) {
            require_once $fallbackFile;
            if (function_exists('getFallbackDbConnection')) {
                return getFallbackDbConnection();
            }
        }

        // If we get here, we can't recover
        throw new Exception('Database connection failed: ' . $e->getMessage());
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
