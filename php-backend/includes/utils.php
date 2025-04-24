<?php
function loadEnvVariables() {
    $envFile = __DIR__ . '/../../.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

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

function getDbConnection() {
    loadEnvVariables();
    $databaseUrl = getenv('DATABASE_URL');

    if (!$databaseUrl) {
        throw new Exception('DATABASE_URL not set');
    }

    try {
        $dbParams = parse_url($databaseUrl);

        $host = $dbParams['host'];
        $port = $dbParams['port'] ?? 5432;
        $dbname = ltrim($dbParams['path'], '/');
        $username = $dbParams['user'];
        $password = $dbParams['pass'];

        $sslmode = (strpos($host, 'localhost') !== false || $host === '127.0.0.1') ? 'prefer' : 'require';
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=$sslmode";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ];

        return new PDO($dsn, $username, $password, $options);
    } catch (PDOException $e) {
        error_log("[PHP] DB error: " . $e->getMessage());
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
}

function sendJsonResponse($data, $statusCode = 200) {
    header('Content-Type: application/json');
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

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

    error_log("[PHP] Error: $message");
    sendJsonResponse($response, $statusCode);
}

function getRequestBody() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorResponse('Invalid JSON', 400);
    }

    return $data;
}

function validateRequired($data, $requiredFields) {
    $missing = [];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }

    if (!empty($missing)) {
        sendErrorResponse('Missing fields: ' . implode(', ', $missing), 400);
    }
}

function generateId() {
    return bin2hex(random_bytes(12));
}
