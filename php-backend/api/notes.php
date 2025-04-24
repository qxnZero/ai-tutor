<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $lessonId = $_GET['lessonId'] ?? null;

        if (!$lessonId) {
            sendErrorResponse('Lesson ID is required', 400);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT * FROM \"Note\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
        $stmt->execute([$lessonId, $user['id']]);
        $note = $stmt->fetch();

        sendJsonResponse(['note' => $note]);
        break;

    case 'POST':
        $data = getRequestBody();
        validateRequired($data, ['lessonId', 'content']);

        $lessonId = $data['lessonId'];
        $content = $data['content'];

        $pdo = getDbConnection();

        $stmt = $pdo->prepare("SELECT * FROM \"Lesson\" WHERE id = ?");
        $stmt->execute([$lessonId]);
        $lesson = $stmt->fetch();

        if (!$lesson) {
            sendErrorResponse('Lesson not found', 404);
        }

        $stmt = $pdo->prepare("SELECT * FROM \"Note\" WHERE \"lessonId\" = ? AND \"userId\" = ?");
        $stmt->execute([$lessonId, $user['id']]);
        $existingNote = $stmt->fetch();

        if ($existingNote) {
            $stmt = $pdo->prepare("
                UPDATE \"Note\"
                SET content = ?, \"updatedAt\" = NOW()
                WHERE id = ?
                RETURNING *
            ");
            $stmt->execute([$content, $existingNote['id']]);
            $updatedNote = $stmt->fetch();

            sendJsonResponse(['message' => 'Note updated', 'note' => $updatedNote]);
        } else {
            $noteId = generateId();
            $stmt = $pdo->prepare("
                INSERT INTO \"Note\" (id, content, \"lessonId\", \"userId\", \"createdAt\", \"updatedAt\")
                VALUES (?, ?, ?, ?, NOW(), NOW())
                RETURNING *
            ");
            $stmt->execute([$noteId, $content, $lessonId, $user['id']]);
            $newNote = $stmt->fetch();

            sendJsonResponse(['message' => 'Note created', 'note' => $newNote], 201);
        }
        break;

    case 'DELETE':
        $noteId = $_GET['id'] ?? null;

        if (!$noteId) {
            sendErrorResponse('Note ID is required', 400);
        }

        $pdo = getDbConnection();

        $stmt = $pdo->prepare("SELECT * FROM \"Note\" WHERE id = ?");
        $stmt->execute([$noteId]);
        $note = $stmt->fetch();

        if (!$note) {
            sendErrorResponse('Note not found', 404);
        }

        if ($note['userId'] !== $user['id']) {
            sendErrorResponse('Unauthorized', 403);
        }

        $stmt = $pdo->prepare("DELETE FROM \"Note\" WHERE id = ?");
        $stmt->execute([$noteId]);

        sendJsonResponse(['message' => 'Note deleted']);
        break;

    default:
        sendErrorResponse('Method not supported', 405);
        break;
}
