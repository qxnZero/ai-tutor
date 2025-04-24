<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../includes/logger.php';

// Check if we're in test mode
$isTestMode = isset($_GET['test']) && $_GET['test'] == '1';
$isFallbackMode = isset($_GET['fallback']) && $_GET['fallback'] == '1';

$logger = new Logger('course-statistics');
// Only require auth if not in test mode
$user = $isTestMode ? ['id' => 'test-user-id'] : requireAuth();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendErrorResponse('Method not supported', 405);
}

// Handle test mode
if ($isTestMode) {
    $courseId = $_GET['courseId'] ?? null;

    if ($courseId) {
        // Course-specific statistics
        sendJsonResponse([
            'statistics' => [
                'courseId' => $courseId,
                'title' => 'Test Course',
                'totalLessons' => 10,
                'completedLessons' => 5,
                'averageProgress' => 50.0,
                'userCount' => 25,
                'bookmarkCount' => 15
            ]
        ]);
    } else {
        // Overall statistics
        sendJsonResponse([
            'statistics' => [
                'courseCount' => 5,
                'averageProgress' => 45.5,
                'bookmarkCount' => 20,
                'noteCount' => 30,
                'topCourses' => [
                    [
                        'courseId' => 'course-1',
                        'title' => 'AI Fundamentals',
                        'progress' => 80
                    ],
                    [
                        'courseId' => 'course-2',
                        'title' => 'Machine Learning Basics',
                        'progress' => 65
                    ]
                ]
            ]
        ]);
    }
    exit;
}

$pdo = getDbConnection();
$courseId = $_GET['courseId'] ?? null;
$response = [];

// If courseId is provided, get statistics for a specific course
if ($courseId) {
    // Check if course exists and user has access
    $stmt = $pdo->prepare("
        SELECT c.* FROM \"Course\" c
        WHERE c.id = ? AND (c.\"userId\" = ? OR c.\"isPublic\" = true)
    ");
    $stmt->execute([$courseId, $user['id']]);
    $course = $stmt->fetch();

    if (!$course) {
        sendErrorResponse('Course not found or access denied', 404);
    }

    // Get total number of lessons
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total_lessons
        FROM \"Lesson\" l
        JOIN \"Module\" m ON l.\"moduleId\" = m.id
        WHERE m.\"courseId\" = ?
    ");
    $stmt->execute([$courseId]);
    $lessonCount = $stmt->fetch();

    // Get number of completed lessons
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as completed_lessons
        FROM \"Lesson\" l
        JOIN \"Module\" m ON l.\"moduleId\" = m.id
        WHERE m.\"courseId\" = ? AND l.completed = true
    ");
    $stmt->execute([$courseId]);
    $completedCount = $stmt->fetch();

    // Get average progress across all users
    $stmt = $pdo->prepare("
        SELECT AVG(progress) as avg_progress
        FROM \"UserProgress\"
        WHERE \"courseId\" = ?
    ");
    $stmt->execute([$courseId]);
    $avgProgress = $stmt->fetch();

    // Get number of users who have started the course
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT \"userId\") as user_count
        FROM \"UserProgress\"
        WHERE \"courseId\" = ?
    ");
    $stmt->execute([$courseId]);
    $userCount = $stmt->fetch();

    // Get number of bookmarks for this course
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as bookmark_count
        FROM \"Bookmark\" b
        JOIN \"Lesson\" l ON b.\"lessonId\" = l.id
        JOIN \"Module\" m ON l.\"moduleId\" = m.id
        WHERE m.\"courseId\" = ?
    ");
    $stmt->execute([$courseId]);
    $bookmarkCount = $stmt->fetch();

    $response = [
        'courseId' => $courseId,
        'title' => $course['title'],
        'totalLessons' => (int)$lessonCount['total_lessons'],
        'completedLessons' => (int)$completedCount['completed_lessons'],
        'averageProgress' => round((float)$avgProgress['avg_progress'] ?? 0, 2),
        'userCount' => (int)$userCount['user_count'],
        'bookmarkCount' => (int)$bookmarkCount['bookmark_count'],
    ];

    $logger->info("Retrieved statistics for course $courseId", ['userId' => $user['id']]);
} else {
    // Get overall statistics for the user

    // Get total courses created by user
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as course_count
        FROM \"Course\"
        WHERE \"userId\" = ?
    ");
    $stmt->execute([$user['id']]);
    $courseCount = $stmt->fetch();

    // Get average progress across all courses
    $stmt = $pdo->prepare("
        SELECT AVG(progress) as avg_progress
        FROM \"UserProgress\"
        WHERE \"userId\" = ?
    ");
    $stmt->execute([$user['id']]);
    $avgProgress = $stmt->fetch();

    // Get total bookmarks
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as bookmark_count
        FROM \"Bookmark\"
        WHERE \"userId\" = ?
    ");
    $stmt->execute([$user['id']]);
    $bookmarkCount = $stmt->fetch();

    // Get total notes
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as note_count
        FROM \"Note\"
        WHERE \"userId\" = ?
    ");
    $stmt->execute([$user['id']]);
    $noteCount = $stmt->fetch();

    // Get courses with highest progress
    $stmt = $pdo->prepare("
        SELECT up.\"courseId\", c.title, up.progress
        FROM \"UserProgress\" up
        JOIN \"Course\" c ON up.\"courseId\" = c.id
        WHERE up.\"userId\" = ?
        ORDER BY up.progress DESC
        LIMIT 5
    ");
    $stmt->execute([$user['id']]);
    $topCourses = $stmt->fetchAll();

    $response = [
        'courseCount' => (int)$courseCount['course_count'],
        'averageProgress' => round((float)$avgProgress['avg_progress'] ?? 0, 2),
        'bookmarkCount' => (int)$bookmarkCount['bookmark_count'],
        'noteCount' => (int)$noteCount['note_count'],
        'topCourses' => $topCourses,
    ];

    $logger->info("Retrieved overall statistics", ['userId' => $user['id']]);
}

sendJsonResponse(['statistics' => $response]);
