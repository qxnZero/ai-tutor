<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/utils.php';

// For testing without authentication
if (isset($_GET['test'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Knowledge Test API is working!',
        'time' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Get the current user (will exit if not authenticated)
$user = requireAuth();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendJsonResponse(['message' => 'Method not allowed'], 405);
}

// Get request data
$data = getRequestBody();
validateRequired($data, ['lessonId']);

$lessonId = $data['lessonId'];

// Get the lesson content
$pdo = getDbConnection();
$stmt = $pdo->prepare("
    SELECT l.*, m.title as \"moduleTitle\", c.title as \"courseTitle\" 
    FROM \"Lesson\" l
    JOIN \"Module\" m ON l.\"moduleId\" = m.id
    JOIN \"Course\" c ON m.\"courseId\" = c.id
    WHERE l.id = ?
");
$stmt->execute([$lessonId]);
$lesson = $stmt->fetch();

if (!$lesson) {
    sendJsonResponse(['error' => 'Lesson not found'], 404);
}

// For this endpoint, we'll return mock data since we can't directly call Gemini API from PHP
// In a real implementation, you would integrate with the Gemini API using PHP cURL
$mockQuestions = [
    [
        'id' => '1',
        'question' => 'What is the main topic of this lesson?',
        'options' => [
            'Option A: ' . $lesson['title'],
            'Option B: Something else',
            'Option C: Another topic',
            'Option D: None of the above'
        ],
        'correctAnswer' => 0
    ],
    [
        'id' => '2',
        'question' => 'This lesson is part of which module?',
        'options' => [
            'Option A: A different module',
            'Option B: ' . $lesson['moduleTitle'],
            'Option C: An unrelated module',
            'Option D: None of the above'
        ],
        'correctAnswer' => 1
    ],
    [
        'id' => '3',
        'question' => 'Which course does this lesson belong to?',
        'options' => [
            'Option A: An unrelated course',
            'Option B: A different course',
            'Option C: ' . $lesson['courseTitle'],
            'Option D: None of the above'
        ],
        'correctAnswer' => 2
    ]
];

// In a production environment, you would call the Gemini API here
// For now, we'll return mock data
sendJsonResponse(['questions' => $mockQuestions]);
