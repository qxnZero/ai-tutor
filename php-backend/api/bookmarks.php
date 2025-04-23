<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';

// For testing without authentication
if (isset($_GET['test'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Bookmarks API is working!',
        'time' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Get the current user (will exit if not authenticated)
$user = requireAuth();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get bookmark for a lesson or all bookmarks for the user
        $lessonId = $_GET['lessonId'] ?? null;
        
        $pdo = getDbConnection();
        
        if ($lessonId) {
            // Get specific bookmark
            $stmt = $pdo->prepare("SELECT * FROM \"Bookmark\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
            $stmt->execute([$lessonId, $user['id']]);
            $bookmark = $stmt->fetch();
            
            sendJsonResponse(['bookmark' => $bookmark]);
        } else {
            // Get all bookmarks for the user with lesson, module, and course info
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
        // Create a bookmark
        $data = getRequestBody();
        validateRequired($data, ['lessonId']);
        
        $lessonId = $data['lessonId'];
        
        $pdo = getDbConnection();
        
        // Check if the lesson exists
        $stmt = $pdo->prepare("SELECT * FROM \"Lesson\" WHERE id = ?");
        $stmt->execute([$lessonId]);
        $lesson = $stmt->fetch();
        
        if (!$lesson) {
            sendJsonResponse(['message' => 'Lesson not found'], 404);
        }
        
        // Check if bookmark already exists
        $stmt = $pdo->prepare("SELECT * FROM \"Bookmark\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
        $stmt->execute([$lessonId, $user['id']]);
        $existingBookmark = $stmt->fetch();
        
        if ($existingBookmark) {
            sendJsonResponse(['message' => 'Lesson already bookmarked', 'bookmark' => $existingBookmark]);
        } else {
            // Create new bookmark
            $bookmarkId = generateId();
            $stmt = $pdo->prepare("
                INSERT INTO \"Bookmark\" (id, \"lessonId\", \"userId\", \"createdAt\") 
                VALUES (?, ?, ?, NOW()) 
                RETURNING *
            ");
            $stmt->execute([$bookmarkId, $lessonId, $user['id']]);
            $newBookmark = $stmt->fetch();
            
            sendJsonResponse(['message' => 'Lesson bookmarked successfully', 'bookmark' => $newBookmark], 201);
        }
        break;
        
    case 'DELETE':
        // Delete a bookmark
        $bookmarkId = $_GET['id'] ?? null;
        
        if (!$bookmarkId) {
            sendJsonResponse(['message' => 'Bookmark ID is required'], 400);
        }
        
        $pdo = getDbConnection();
        
        // Check if bookmark exists and belongs to user
        $stmt = $pdo->prepare("SELECT * FROM \"Bookmark\" WHERE id = ?");
        $stmt->execute([$bookmarkId]);
        $bookmark = $stmt->fetch();
        
        if (!$bookmark) {
            sendJsonResponse(['message' => 'Bookmark not found'], 404);
        }
        
        if ($bookmark['userId'] !== $user['id']) {
            sendJsonResponse(['message' => 'Unauthorized'], 401);
        }
        
        // Delete the bookmark
        $stmt = $pdo->prepare("DELETE FROM \"Bookmark\" WHERE id = ?");
        $stmt->execute([$bookmarkId]);
        
        sendJsonResponse(['message' => 'Bookmark removed successfully']);
        break;
        
    default:
        sendJsonResponse(['message' => 'Method not allowed'], 405);
        break;
}
