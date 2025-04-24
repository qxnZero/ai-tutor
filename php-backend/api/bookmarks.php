<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';

// Check if we're in test mode
$isTestMode = isset($_GET['test']) && $_GET['test'] == '1';
$isFallbackMode = isset($_GET['fallback']) && $_GET['fallback'] == '1';

// Only require auth if not in test mode
$user = $isTestMode ? ['id' => 'test-user-id'] : requireAuth();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $lessonId = $_GET['lessonId'] ?? null;

        // Handle test mode
        if ($isTestMode) {
            if ($lessonId) {
                sendJsonResponse([
                    'bookmark' => [
                        'id' => 'bookmark-1',
                        'lessonId' => $lessonId,
                        'userId' => $user['id'],
                        'createdAt' => date('c')
                    ]
                ]);
            } else {
                sendJsonResponse([
                    'bookmarks' => [
                        [
                            'id' => 'bookmark-1',
                            'lessonId' => 'lesson-1',
                            'userId' => $user['id'],
                            'createdAt' => date('c'),
                            'lessonTitle' => 'Introduction to AI',
                            'moduleTitle' => 'AI Fundamentals',
                            'courseTitle' => 'AI for Beginners'
                        ],
                        [
                            'id' => 'bookmark-2',
                            'lessonId' => 'lesson-2',
                            'userId' => $user['id'],
                            'createdAt' => date('c', strtotime('-1 day')),
                            'lessonTitle' => 'Machine Learning Basics',
                            'moduleTitle' => 'Machine Learning',
                            'courseTitle' => 'AI for Beginners'
                        ]
                    ]
                ]);
            }
            return;
        }

        // Handle fallback mode
        if ($isFallbackMode) {
            if ($lessonId) {
                sendJsonResponse([
                    'bookmark' => null
                ]);
            } else {
                sendJsonResponse([
                    'bookmarks' => []
                ]);
            }
            return;
        }

        // Normal mode with database
        $pdo = getDbConnection();

        if ($lessonId) {
            $stmt = $pdo->prepare("SELECT * FROM \"Bookmark\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
            $stmt->execute([$lessonId, $user['id']]);
            $bookmark = $stmt->fetch();

            sendJsonResponse(['bookmark' => $bookmark]);
        } else {
            $stmt = $pdo->prepare("
                SELECT b.*, l.title as \"lessonTitle\", m.title as \"moduleTitle\", c.title as \"courseTitle\"
                FROM \"Bookmark\" b
                JOIN \"Lesson\" l ON b.\"lessonId\" = l.id
                JOIN \"Module\" m ON l.\"moduleId\" = m.id
                JOIN \"Course\" c ON m.\"courseId\" = c.id
                WHERE b.\"userId\" = ?
                ORDER BY b.\"createdAt\" DESC
            ");
            $stmt->execute([$user['id']]);
            $bookmarks = $stmt->fetchAll();

            sendJsonResponse(['bookmarks' => $bookmarks]);
        }
        break;

    case 'POST':
        $data = getRequestBody();
        validateRequired($data, ['lessonId']);

        $lessonId = $data['lessonId'];

        // Handle test mode
        if ($isTestMode || isset($data['test'])) {
            $bookmarkId = 'bookmark-' . uniqid();
            $newBookmark = [
                'id' => $bookmarkId,
                'lessonId' => $lessonId,
                'userId' => $user['id'],
                'createdAt' => date('c')
            ];

            sendJsonResponse(['message' => 'Bookmark created', 'bookmark' => $newBookmark], 201);
            return;
        }

        // Normal mode with database
        $pdo = getDbConnection();

        $stmt = $pdo->prepare("SELECT * FROM \"Lesson\" WHERE id = ?");
        $stmt->execute([$lessonId]);
        $lesson = $stmt->fetch();

        if (!$lesson) {
            sendJsonResponse(['message' => 'Lesson not found'], 404);
        }

        $stmt = $pdo->prepare("SELECT * FROM \"Bookmark\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
        $stmt->execute([$lessonId, $user['id']]);
        $existingBookmark = $stmt->fetch();

        if ($existingBookmark) {
            sendJsonResponse(['message' => 'Already bookmarked', 'bookmark' => $existingBookmark]);
        } else {
            $bookmarkId = generateId();
            $stmt = $pdo->prepare("
                INSERT INTO \"Bookmark\" (id, \"lessonId\", \"userId\", \"createdAt\")
                VALUES (?, ?, ?, NOW())
                RETURNING *
            ");
            $stmt->execute([$bookmarkId, $lessonId, $user['id']]);
            $newBookmark = $stmt->fetch();

            sendJsonResponse(['message' => 'Bookmark created', 'bookmark' => $newBookmark], 201);
        }
        break;

    case 'DELETE':
        $bookmarkId = $_GET['id'] ?? null;
        $lessonId = $_GET['lessonId'] ?? null;

        if (!$bookmarkId && !$lessonId) {
            sendJsonResponse(['message' => 'Bookmark ID or Lesson ID required'], 400);
        }

        // Handle test mode
        if ($isTestMode) {
            sendJsonResponse(['message' => 'Bookmark removed', 'isBookmarked' => false]);
            return;
        }

        // Normal mode with database
        $pdo = getDbConnection();

        if ($bookmarkId) {
            $stmt = $pdo->prepare("SELECT * FROM \"Bookmark\" WHERE id = ?");
            $stmt->execute([$bookmarkId]);
            $bookmark = $stmt->fetch();

            if (!$bookmark) {
                sendJsonResponse(['message' => 'Bookmark not found'], 404);
            }

            if ($bookmark['userId'] !== $user['id']) {
                sendJsonResponse(['message' => 'Unauthorized'], 401);
            }

            $stmt = $pdo->prepare("DELETE FROM \"Bookmark\" WHERE id = ?");
            $stmt->execute([$bookmarkId]);

            sendJsonResponse(['message' => 'Bookmark removed', 'isBookmarked' => false]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM \"Bookmark\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
            $stmt->execute([$lessonId, $user['id']]);
            $bookmark = $stmt->fetch();

            if (!$bookmark) {
                sendJsonResponse(['message' => 'Bookmark not found'], 404);
            }

            $stmt = $pdo->prepare("DELETE FROM \"Bookmark\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
            $stmt->execute([$lessonId, $user['id']]);

            sendJsonResponse(['message' => 'Bookmark removed', 'isBookmarked' => false]);
        }
        break;

    default:
        sendJsonResponse(['message' => 'Method not supported'], 405);
        break;
}
