<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';

// For testing without authentication
if (isset($_GET['test'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'User Progress API is working!',
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
        // Get progress for a course
        $courseId = $_GET['courseId'] ?? null;
        
        if (!$courseId) {
            sendJsonResponse(['message' => 'Course ID is required'], 400);
        }
        
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT * FROM \"UserProgress\" WHERE \"courseId\" = ? AND \"userId\" = ?");
        $stmt->execute([$courseId, $user['id']]);
        $progress = $stmt->fetch();
        
        sendJsonResponse(['progress' => $progress]);
        break;
        
    case 'POST':
        // Update progress for a course
        $data = getRequestBody();
        validateRequired($data, ['courseId', 'progress']);
        
        $courseId = $data['courseId'];
        $progress = $data['progress'];
        $lastLesson = $data['lastLesson'] ?? null;
        
        $pdo = getDbConnection();
        
        // Check if progress record exists
        $stmt = $pdo->prepare("SELECT * FROM \"UserProgress\" WHERE \"courseId\" = ? AND \"userId\" = ?");
        $stmt->execute([$courseId, $user['id']]);
        $existingProgress = $stmt->fetch();
        
        if ($existingProgress) {
            // Update existing progress
            $stmt = $pdo->prepare("
                UPDATE \"UserProgress\" 
                SET progress = ?, \"lastLesson\" = ?, \"updatedAt\" = NOW() 
                WHERE id = ? 
                RETURNING *
            ");
            $stmt->execute([$progress, $lastLesson, $existingProgress['id']]);
            $updatedProgress = $stmt->fetch();
            
            sendJsonResponse(['progress' => $updatedProgress]);
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
            
            sendJsonResponse(['progress' => $newProgress]);
        }
        break;
        
    default:
        sendJsonResponse(['message' => 'Method not allowed'], 405);
        break;
}
