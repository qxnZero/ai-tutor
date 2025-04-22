<?php
/**
 * Fallback mode for PHP backend
 * Provides mock data when database connection is not available
 */

// Flag to indicate if we're in fallback mode
$GLOBALS['FALLBACK_MODE'] = false;

/**
 * Check if fallback mode is enabled
 *
 * @return bool True if fallback mode is enabled
 */
function isFallbackMode() {
    return $GLOBALS['FALLBACK_MODE'] || isset($_GET['fallback']);
}

/**
 * Enable fallback mode
 */
function enableFallbackMode() {
    $GLOBALS['FALLBACK_MODE'] = true;
    if (function_exists('logWarning')) {
        logWarning("Fallback mode enabled - using mock data instead of database");
    } else {
        error_log("[PHP] Fallback mode enabled - using mock data instead of database");
    }
}

/**
 * Get a mock database connection that returns predefined data
 * This is used when the real database connection fails
 *
 * @return object A mock PDO-like object
 */
function getMockDbConnection() {
    return new class {
        // Mock data storage
        private $mockData = [
            'notes' => [
                [
                    'id' => 'mock-note-1',
                    'content' => 'This is a mock note for testing',
                    'lessonId' => 'lesson-1',
                    'userId' => 'user-1',
                    'createdAt' => '2025-04-22 10:00:00',
                    'updatedAt' => '2025-04-22 10:00:00'
                ]
            ],
            'bookmarks' => [
                [
                    'id' => 'mock-bookmark-1',
                    'lessonId' => 'lesson-1',
                    'userId' => 'user-1',
                    'createdAt' => '2025-04-22 10:00:00'
                ]
            ],
            'userProgress' => [
                [
                    'id' => 'mock-progress-1',
                    'courseId' => 'course-1',
                    'userId' => 'user-1',
                    'progress' => 50,
                    'lastLesson' => 'lesson-2',
                    'createdAt' => '2025-04-22 10:00:00',
                    'updatedAt' => '2025-04-22 10:00:00'
                ]
            ],
            'lessons' => [
                [
                    'id' => 'lesson-1',
                    'title' => 'Mock Lesson 1',
                    'content' => 'This is a mock lesson for testing',
                    'moduleId' => 'module-1'
                ],
                [
                    'id' => 'lesson-2',
                    'title' => 'Mock Lesson 2',
                    'content' => 'This is another mock lesson for testing',
                    'moduleId' => 'module-1'
                ]
            ],
            'modules' => [
                [
                    'id' => 'module-1',
                    'title' => 'Mock Module 1',
                    'courseId' => 'course-1'
                ]
            ],
            'courses' => [
                [
                    'id' => 'course-1',
                    'title' => 'Mock Course 1'
                ]
            ],
            'users' => [
                [
                    'id' => 'user-1',
                    'email' => 'test@example.com',
                    'name' => 'Test User'
                ]
            ]
        ];

        // Last executed query
        private $lastQuery = '';
        private $lastParams = [];

        /**
         * Execute a query
         */
        public function query($query) {
            $this->lastQuery = $query;

            // Return a mock statement
            return new class($this->mockData) {
                private $mockData;
                private $fetchIndex = 0;

                public function __construct($mockData) {
                    $this->mockData = $mockData;
                }

                public function fetch() {
                    // Just return the first item from the appropriate mock data
                    if ($this->fetchIndex === 0) {
                        $this->fetchIndex++;
                        return ['1' => 1]; // For "SELECT 1" queries
                    }
                    return false;
                }

                public function fetchAll() {
                    return [];
                }
            };
        }

        /**
         * Prepare a statement
         */
        public function prepare($query) {
            $this->lastQuery = $query;

            // Return a mock statement
            return new class($this->mockData) {
                private $mockData;
                private $lastParams = [];

                public function __construct($mockData) {
                    $this->mockData = $mockData;
                }

                public function execute($params = []) {
                    $this->lastParams = $params;
                    return true;
                }

                public function fetch() {
                    // Try to determine what type of data to return based on the query
                    if (isset($this->lastParams[0])) {
                        $param = $this->lastParams[0];

                        // Check if it's a lessonId
                        if (is_string($param) && strpos($param, 'lesson') === 0) {
                            // Special case for invalid-id to test error handling
                            if ($param === 'invalid-id') {
                                return null; // Return null to simulate not found
                            }

                            foreach ($this->mockData['notes'] as $note) {
                                if ($note['lessonId'] === $param) {
                                    return $note;
                                }
                            }
                        }

                        // Check if it's a courseId
                        if (is_string($param) && strpos($param, 'course') === 0) {
                            foreach ($this->mockData['userProgress'] as $progress) {
                                if ($progress['courseId'] === $param) {
                                    return $progress;
                                }
                            }
                        }
                    }

                    // Get the query string if available
                    $query = $this->lastQuery ?? '';

                    // Default mock data based on common queries
                    if (strpos($query, 'Note') !== false) {
                        return $this->mockData['notes'][0] ?? null;
                    } elseif (strpos($query, 'Bookmark') !== false) {
                        return $this->mockData['bookmarks'][0] ?? null;
                    } elseif (strpos($query, 'UserProgress') !== false) {
                        return $this->mockData['userProgress'][0] ?? null;
                    } elseif (strpos($query, 'Lesson') !== false) {
                        return $this->mockData['lessons'][0] ?? null;
                    } elseif (strpos($query, 'User') !== false) {
                        return $this->mockData['users'][0] ?? null;
                    }

                    return null;
                }

                public function fetchAll() {
                    // Return all mock data of the appropriate type
                    if (strpos($this->lastQuery, 'Note') !== false) {
                        return $this->mockData['notes'];
                    } elseif (strpos($this->lastQuery, 'Bookmark') !== false) {
                        return $this->mockData['bookmarks'];
                    } elseif (strpos($this->lastQuery, 'UserProgress') !== false) {
                        return $this->mockData['userProgress'];
                    } elseif (strpos($this->lastQuery, 'Lesson') !== false) {
                        return $this->mockData['lessons'];
                    } elseif (strpos($this->lastQuery, 'User') !== false) {
                        return $this->mockData['users'];
                    }

                    return [];
                }
            };
        }

        /**
         * Set an attribute
         */
        public function setAttribute($attribute, $value) {
            // Do nothing
            return true;
        }
    };
}

/**
 * Get a fallback database connection
 * This tries to get a real connection first, and falls back to a mock one if that fails
 *
 * @return object A PDO or mock PDO-like object
 */
function getFallbackDbConnection() {
    // If fallback mode is explicitly requested, return mock connection
    if (isset($_GET['fallback'])) {
        enableFallbackMode();
        return getMockDbConnection();
    }

    // Try to get a real connection
    try {
        // Check if PostgreSQL driver is available
        $availableDrivers = PDO::getAvailableDrivers();
        if (!in_array('pgsql', $availableDrivers)) {
            throw new Exception("PostgreSQL driver not available");
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
        $pdo = new PDO($dsn);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        // Test the connection
        $pdo->query('SELECT 1');

        return $pdo;
    } catch (Exception $e) {
        // Connection failed, enable fallback mode
        enableFallbackMode();

        // Log the error
        if (function_exists('logError')) {
            logError("Database connection failed, using fallback mode: " . $e->getMessage());
        } else {
            error_log("[PHP] Database connection failed, using fallback mode: " . $e->getMessage());
        }

        return getMockDbConnection();
    }
}
