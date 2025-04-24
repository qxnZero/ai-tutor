<?php
/**
 * Simple logger class for PHP backend
 */
class Logger {
    private $context;
    private $logFile;
    private $logLevel;
    
    /**
     * Constructor
     * 
     * @param string $context The context/component name
     */
    public function __construct($context) {
        $this->context = $context;
        $this->logFile = __DIR__ . '/../../logs/php-backend.log';
        $this->logLevel = getenv('LOG_LEVEL') ?: 'INFO';
        
        // Create logs directory if it doesn't exist
        $logsDir = dirname($this->logFile);
        if (!is_dir($logsDir)) {
            mkdir($logsDir, 0755, true);
        }
        
        // Initialize logger
        $this->info('PHP Backend Logger initialized', [
            'logLevel' => $this->logLevel,
            'logFile' => $this->logFile
        ]);
    }
    
    /**
     * Log a debug message
     * 
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function debug($message, array $context = []) {
        if (in_array($this->logLevel, ['DEBUG'])) {
            $this->log('DEBUG', $message, $context);
        }
    }
    
    /**
     * Log an info message
     * 
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function info($message, array $context = []) {
        if (in_array($this->logLevel, ['DEBUG', 'INFO'])) {
            $this->log('INFO', $message, $context);
        }
    }
    
    /**
     * Log a warning message
     * 
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function warning($message, array $context = []) {
        if (in_array($this->logLevel, ['DEBUG', 'INFO', 'WARNING'])) {
            $this->log('WARNING', $message, $context);
        }
    }
    
    /**
     * Log an error message
     * 
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function error($message, array $context = []) {
        $this->log('ERROR', $message, $context);
    }
    
    /**
     * Internal log method
     * 
     * @param string $level The log level
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    private function log($level, $message, array $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $requestId = substr(md5(uniqid()), 0, 12);
        $method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $user = isset($_SESSION['user']) ? $_SESSION['user']['email'] : 'anonymous';
        
        $contextJson = !empty($context) ? ' ' . json_encode($context) : '';
        $logMessage = "[$timestamp] [$level] [$requestId] [$method $uri] [$ip] [$user] $message$contextJson" . PHP_EOL;
        
        // Log to file
        file_put_contents($this->logFile, $logMessage, FILE_APPEND);
        
        // Also log to error_log for development
        error_log("[$level] $message");
    }
}
