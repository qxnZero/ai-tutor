<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';

// For testing without authentication
if (isset($_GET['test'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Notes API is working!',
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
        // Get note for a lesson
        $lessonId = $_GET['lessonId'] ?? null;
        
        if (!$lessonId) {
            sendJsonResponse(['message' => 'Lesson ID is required'], 400);
        }
        
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT * FROM \"Note\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
        $stmt->execute([$lessonId, $user['id']]);
        $note = $stmt->fetch();
        
        sendJsonResponse(['note' => $note]);
        break;
        
    case 'POST':
        // Create or update a note
        $data = getRequestBody();
        validateRequired($data, ['lessonId', 'content']);
        
        $lessonId = $data['lessonId'];
        $content = $data['content'];
        
        $pdo = getDbConnection();
        
        // Check if the lesson exists
        $stmt = $pdo->prepare("SELECT * FROM \"Lesson\" WHERE id = ?");
        $stmt->execute([$lessonId]);
        $lesson = $stmt->fetch();
        
        if (!$lesson) {
            sendJsonResponse(['message' => 'Lesson not found'], 404);
        }
        
        // Check if note already exists
        $stmt = $pdo->prepare("SELECT * FROM \"Note\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
        $stmt->execute([$lessonId, $user['id']]);
        $existingNote = $stmt->fetch();
        
        if ($existingNote) {
            // Update existing note
            $stmt = $pdo->prepare("
                UPDATE \"Note\" 
                SET content = ?, \"updatedAt\" = NOW() 
                WHERE id = ? 
                RETURNING *
            ");
            $stmt->execute([$content, $existingNote['id']]);
            $updatedNote = $stmt->fetch();
            
            sendJsonResponse(['message' => 'Note updated successfully', 'note' => $updatedNote]);
        } else {
            // Create new note
            $noteId = generateId();
            $stmt = $pdo->prepare("
                INSERT INTO \"Note\" (id, content, \"lessonId\", \"userId\", \"createdAt\", \"updatedAt\") 
                VALUES (?, ?, ?, ?, NOW(), NOW()) 
                RETURNING *
            ");
            $stmt->execute([$noteId, $content, $lessonId, $user['id']]);
            $newNote = $stmt->fetch();
            
            sendJsonResponse(['message' => 'Note created successfully', 'note' => $newNote], 201);
        }
        break;
        
    case 'DELETE':
        // Delete a note
        $noteId = $_GET['id'] ?? null;
        
        if (!$noteId) {
            sendJsonResponse(['message' => 'Note ID is required'], 400);
        }
        
        $pdo = getDbConnection();
        
        // Check if note exists and belongs to user
        $stmt = $pdo->prepare("SELECT * FROM \"Note\" WHERE id = ?");
        $stmt->execute([$noteId]);
        $note = $stmt->fetch();
        
        if (!$note) {
            sendJsonResponse(['message' => 'Note not found'], 404);
        }
        
        if ($note['userId'] !== $user['id']) {
            sendJsonResponse(['message' => 'Unauthorized'], 401);
        }
        
        // Delete the note
        $stmt = $pdo->prepare("DELETE FROM \"Note\" WHERE id = ?");
        $stmt->execute([$noteId]);
        
        sendJsonResponse(['message' => 'Note deleted successfully']);
        break;
        
    default:
        sendJsonResponse(['message' => 'Method not allowed'], 405);
        break;
}
