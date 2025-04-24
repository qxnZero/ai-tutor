<?php
/**
 * Enhanced logging functionality for the PHP backend
 */

// Define log levels
define('LOG_LEVEL_DEBUG', 100);
define('LOG_LEVEL_INFO', 200);
define('LOG_LEVEL_WARNING', 300);
define('LOG_LEVEL_ERROR', 400);
define('LOG_LEVEL_CRITICAL', 500);

// Get the configured log level from environment or use default
$configuredLogLevel = getenv('PHP_LOG_LEVEL') ?: 'INFO';
$currentLogLevel = getLogLevelValue($configuredLogLevel);

// Log file path
$logDir = __DIR__ . '/../../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
$logFile = $logDir . '/php-backend.log';

/**
 * Convert log level string to numeric value
 *
 * @param string $level Log level name
 * @return int Log level value
 */
function getLogLevelValue($level) {
    switch (strtoupper($level)) {
        case 'DEBUG':
            return LOG_LEVEL_DEBUG;
        case 'INFO':
            return LOG_LEVEL_INFO;
        case 'WARNING':
            return LOG_LEVEL_WARNING;
        case 'ERROR':
            return LOG_LEVEL_ERROR;
        case 'CRITICAL':
            return LOG_LEVEL_CRITICAL;
        default:
            return LOG_LEVEL_INFO; // Default to INFO
    }
}

/**
 * Log a message with the specified level
 *
 * @param string $message Log message
 * @param string $level Log level
 * @param array $context Additional context data
 */
function logMessage($message, $level = 'INFO', $context = []) {
    global $currentLogLevel, $logFile;

    $levelValue = getLogLevelValue($level);

    // Only log if the level is greater than or equal to the configured level
    if ($levelValue < $currentLogLevel) {
        return;
    }

    // Format timestamp
    $timestamp = date('Y-m-d H:i:s');

    // Get request information
    $requestId = $_SERVER['HTTP_X_REQUEST_ID'] ?? uniqid();
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
    $requestUri = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN';
    $requestIp = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $userId = isset($context['userId']) ? $context['userId'] : 'anonymous';

    // Format context as JSON if not empty
    $contextJson = !empty($context) ? ' ' . json_encode($context) : '';

    // Format log entry
    $logEntry = sprintf(
        "[%s] [%s] [%s] [%s %s] [%s] [%s] %s%s\n",
        $timestamp,
        $level,
        $requestId,
        $requestMethod,
        $requestUri,
        $requestIp,
        $userId,
        $message,
        $contextJson
    );

    // Write to log file
    file_put_contents($logFile, $logEntry, FILE_APPEND);

    // Also write to error_log for server logs
    error_log("[PHP] $level: $message");
}

/**
 * Log a debug message
 *
 * @param string $message Log message
 * @param array $context Additional context data
 */
function logDebug($message, $context = []) {
    logMessage($message, 'DEBUG', $context);
}

/**
 * Log an info message
 *
 * @param string $message Log message
 * @param array $context Additional context data
 */
function logInfo($message, $context = []) {
    logMessage($message, 'INFO', $context);
}

/**
 * Log a warning message
 *
 * @param string $message Log message
 * @param array $context Additional context data
 */
function logWarning($message, $context = []) {
    logMessage($message, 'WARNING', $context);
}

/**
 * Log an error message
 *
 * @param string $message Log message
 * @param array $context Additional context data
 */
function logError($message, $context = []) {
    logMessage($message, 'ERROR', $context);
}

/**
 * Log a critical message
 *
 * @param string $message Log message
 * @param array $context Additional context data
 */
function logCritical($message, $context = []) {
    logMessage($message, 'CRITICAL', $context);
}

/**
 * Log API request details
 *
 * @param array $additionalContext Additional context data to include in the log
 */
function logApiRequest($additionalContext = []) {
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
    $requestUri = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN';
    $requestIp = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';

    $context = [
        'method' => $requestMethod,
        'uri' => $requestUri,
        'ip' => $requestIp,
        'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN',
        'server' => 'PHP-FPM', // Indicate this is running on PHP-FPM
        'requestId' => uniqid('php-fpm-')
    ];

    // Merge additional context if provided
    if (!empty($additionalContext)) {
        $context = array_merge($context, $additionalContext);
    }

    logInfo("API Request received", $context);

    // Also output a colored indicator to the error log for easy identification
    error_log("\033[36m[PHP]\033[0m $requestMethod $requestUri");
}

/**
 * Log API response details
 *
 * @param int $statusCode HTTP status code
 * @param mixed $responseData Response data
 */
function logApiResponse($statusCode, $responseData = null) {
    $context = [
        'statusCode' => $statusCode
    ];

    // Only include response data for errors to avoid logging sensitive information
    if ($statusCode >= 400 && $responseData) {
        $context['response'] = $responseData;
    }

    logInfo("API Response sent", $context);
}

// Initialize logging
logInfo("PHP Backend Logger initialized", [
    'logLevel' => $configuredLogLevel,
    'logFile' => $logFile
]);
