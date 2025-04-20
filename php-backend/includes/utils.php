<?php
/**
 * Utility functions for the PHP backend
 */

/**
 * Get a database connection
 * Returns a PDO instance connected to the PostgreSQL database
 */
function getDbConnection() {
    static $pdo = null;
    
    if ($pdo !== null) {
        return $pdo;
    }
    
    // Load environment variables from .env file
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
    $user = $dbParams['user'];
    $password = $dbParams['pass'];
    
    // Create PDO connection
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$password";
    
    try {
        $pdo = new PDO($dsn);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        error_log("[PHP] Database connection error: " . $e->getMessage());
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
    echo json_encode($data);
    exit;
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
        sendJsonResponse(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
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
        sendJsonResponse([
            'error' => 'Missing required fields',
            'fields' => $missing
        ], 400);
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
