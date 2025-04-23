<?php
/**
 * Test script to verify database connection
 * Run this script to check if PHP can connect to the Neon DB
 */

// Display all errors for better debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "\n===== PHP DATABASE CONNECTION TEST =====\n\n";

// Check PHP version
echo "PHP Version: " . PHP_VERSION . "\n";

// Check for PostgreSQL extension
if (!extension_loaded('pgsql') && !extension_loaded('pdo_pgsql')) {
    echo "ERROR: PostgreSQL extension is not installed!\n\n";
    echo "SOLUTION: Install the PostgreSQL extension with one of these commands:\n";
    echo "  For Ubuntu/Debian: sudo apt install php-pgsql\n";
    echo "  For CentOS/RHEL: sudo yum install php-pgsql\n";
    echo "  For Arch Linux: sudo pacman -S php-pgsql\n\n";
    echo "After installing, restart your web server if applicable.\n";
    exit(1);
}

// Include utility functions
require_once __DIR__ . '/includes/utils.php';

echo "Testing connection to Neon DB...\n";

// Check if .env file exists and DATABASE_URL is set
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    echo "ERROR: .env file not found at $envFile\n";
    echo "SOLUTION: Create a .env file with your database credentials\n";
    exit(1);
}

// Load environment variables manually to verify
loadEnvVariables();
$databaseUrl = getenv('DATABASE_URL');
if (!$databaseUrl) {
    echo "ERROR: DATABASE_URL environment variable is not set\n";
    echo "SOLUTION: Add DATABASE_URL to your .env file\n";
    echo "Example: DATABASE_URL='postgresql://username:password@host:port/dbname?sslmode=require'\n";
    exit(1);
}

echo "DATABASE_URL is set. Attempting connection...\n";

try {
    // Get database connection
    $pdo = getDbConnection();

    // Run a simple query
    $stmt = $pdo->query('SELECT 1 as test');
    $result = $stmt->fetch();

    if ($result && isset($result['test']) && $result['test'] == 1) {
        echo "\n✅ SUCCESS: Connected to the database successfully!\n\n";

        // Get PostgreSQL version
        $stmt = $pdo->query('SELECT version()');
        $version = $stmt->fetchColumn();
        echo "Database version: $version\n";

        // Test a query against the User table
        try {
            $stmt = $pdo->query('SELECT COUNT(*) FROM "User"');
            $count = $stmt->fetchColumn();
            echo "Number of users in database: $count\n";
        } catch (PDOException $e) {
            echo "Could not query User table: " . $e->getMessage() . "\n";
        }
    } else {
        echo "ERROR: Connection test failed. Query did not return expected result.\n";
    }
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n\n";

    // Check if PostgreSQL driver is available
    $drivers = PDO::getAvailableDrivers();
    echo "Available PDO drivers: " . implode(', ', $drivers) . "\n";

    if (!in_array('pgsql', $drivers)) {
        echo "SOLUTION: PostgreSQL driver is not installed or not enabled. Install it with:\n";
        echo "  sudo apt install php-pgsql\n\n";
        echo "After installing, you may need to restart PHP or your web server.\n";
        echo "To verify installation: php -m | grep pgsql\n";
    }

    // Parse and validate the DATABASE_URL
    if ($databaseUrl) {
        echo "\nValidating DATABASE_URL format...\n";
        $dbParams = parse_url($databaseUrl);

        if (!$dbParams || !isset($dbParams['scheme']) || !isset($dbParams['host']) ||
            !isset($dbParams['user']) || !isset($dbParams['pass']) || !isset($dbParams['path'])) {
            echo "ERROR: Invalid DATABASE_URL format\n";
            echo "Correct format: postgresql://username:password@host:port/dbname?sslmode=require\n";
        } else {
            echo "DATABASE_URL format appears valid.\n";
            echo "Make sure your credentials are correct and the database server is accessible.\n";
        }
    }
}

echo "\n===== TEST COMPLETE =====\n";

