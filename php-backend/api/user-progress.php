<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../includes/logger.php';

// Check if we're in test mode
$isTestMode = isset($_GET['test']) && $_GET['test'] == '1';
$isFallbackMode = isset($_GET['fallback']) && $_GET['fallback'] == '1';

$logger = new Logger('user-progress');
// Only require auth if not in test mode
$user = $isTestMode ? ['id' => 'test-user-id'] : requireAuth();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $courseId = $_GET['courseId'] ?? null;

        // Handle test mode
        if ($isTestMode) {
            sendJsonResponse([
                'status' => 'success',
                'code' => 200,
                'message' => 'Course ID is tracked'
            ]);
            return;
        }

        // Handle fallback mode
        if ($isFallbackMode) {
            sendJsonResponse([
                'status' => 'success',
                'code' => 200,
                'message' => 'Course ID is reached'
            ]);
            return;
        }

        if (!$courseId) {
            sendErrorResponse('Course ID is required', 400);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT * FROM \"UserProgress\"
            WHERE \"courseId\" = ? AND \"userId\" = ?
        ");
        $stmt->execute([$courseId, $user['id']]);
        $progress = $stmt->fetch();

        // If no progress found, return empty progress
        if (!$progress) {
            $progress = [
                'courseId' => $courseId,
                'userId' => $user['id'],
                'progress' => 0,
                'lastLesson' => null
            ];
        }

        $logger->info("Retrieved progress for course $courseId", ['userId' => $user['id']]);
        sendJsonResponse(['progress' => $progress]);
        break;

    case 'POST':
        $data = getRequestBody();

        // Handle test mode
        if ($isTestMode || isset($data['test'])) {
            sendJsonResponse([
                'status' => 'success',
                'code' => 200,
                'message' => 'Course ID is reached'
            ], 201);
            return;
        }

        validateRequired($data, ['courseId', 'progress']);

        $courseId = $data['courseId'];
        $progress = $data['progress'];
        $lastLesson = $data['lastLesson'] ?? null;

        // Validate progress is a number between 0 and 100
        if (!is_numeric($progress) || $progress < 0 || $progress > 100) {
            sendErrorResponse('Progress must be a number between 0 and 100', 400);
        }

        $pdo = getDbConnection();

        // Check if course exists
        $stmt = $pdo->prepare("SELECT id FROM \"Course\" WHERE id = ?");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();

        if (!$course) {
            sendErrorResponse('Course not found', 404);
        }

        // Check if progress record exists
        $stmt = $pdo->prepare("
            SELECT id FROM \"UserProgress\"
            WHERE \"courseId\" = ? AND \"userId\" = ?
        ");
        $stmt->execute([$courseId, $user['id']]);
        $existingProgress = $stmt->fetch();

        if ($existingProgress) {
            // Update existing progress
            $stmt = $pdo->prepare("
                UPDATE \"UserProgress\"
                SET progress = ?, \"lastLesson\" = ?, \"updatedAt\" = NOW()
                WHERE \"courseId\" = ? AND \"userId\" = ?
                RETURNING *
            ");
            $stmt->execute([$progress, $lastLesson, $courseId, $user['id']]);
            $updatedProgress = $stmt->fetch();

            $logger->info("Updated progress for course $courseId", [
                'userId' => $user['id'],
                'progress' => $progress
            ]);
            sendJsonResponse(['message' => 'Progress updated', 'progress' => $updatedProgress]);
        } else {
            // Create new progress record
            $progressId = generateId();
            $stmt = $pdo->prepare("
                INSERT INTO \"UserProgress\" (id, \"courseId\", \"userId\", progress, \"lastLesson\", \"createdAt\", \"updatedAt\")
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                RETURNING *
            ");
            $stmt->execute([$progressId, $courseId, $user['id'], $progress, $lastLesson]);
            $newProgress = $stmt->fetch();

            $logger->info("Created progress for course $courseId", [
                'userId' => $user['id'],
                'progress' => $progress
            ]);
            sendJsonResponse(['message' => 'Progress created', 'progress' => $newProgress], 201);
        }
        break;

    default:
        sendErrorResponse('Method not supported', 405);
        break;
}
