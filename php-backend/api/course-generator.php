<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log the request with [PHP] prefix
$requestTime = date('Y-m-d H:i:s');
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
error_log("[PHP] $requestTime - $requestMethod $requestUri - Course Generator API");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// For testing without authentication
if (isset($_GET['test'])) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Course Generator API is working!',
        'time' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the request body
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON in request body']);
    exit;
}

// Extract parameters
$topic = $data['topic'] ?? '';
$difficulty = $data['difficulty'] ?? 'Beginner';
$additionalDetails = $data['additionalDetails'] ?? false;
$details = $data['details'] ?? '';

if (empty($topic)) {
    http_response_code(400);
    echo json_encode(['error' => 'Topic is required']);
    exit;
}

// Log the request parameters
error_log("[PHP] Course generation request - Topic: $topic, Difficulty: $difficulty");

// Function to fix and parse JSON from Gemini API
function fixAndParseJson($jsonString) {
    // Log the raw response length
    error_log("[PHP] Raw response length: " . strlen($jsonString));
    
    // Try to parse as-is first
    $decoded = json_decode($jsonString, true);
    if ($decoded !== null) {
        return $decoded;
    }
    
    // Extract JSON from markdown code blocks
    if (preg_match('/```(?:json)?\n([\s\S]*?)\n```/', $jsonString, $matches) || 
        preg_match('/```([\s\S]*?)```/', $jsonString, $matches)) {
        $extractedJson = trim($matches[1]);
        $decoded = json_decode($extractedJson, true);
        if ($decoded !== null) {
            return $decoded;
        }
    }
    
    // Find the outermost JSON object
    $startBrace = strpos($jsonString, '{');
    $endBrace = strrpos($jsonString, '}');
    
    if ($startBrace !== false && $endBrace !== false && $endBrace > $startBrace) {
        $jsonSubstring = substr($jsonString, $startBrace, $endBrace - $startBrace + 1);
        $decoded = json_decode($jsonSubstring, true);
        if ($decoded !== null) {
            return $decoded;
        }
        
        // Try to fix common JSON issues
        // Replace unescaped newlines in strings
        $fixedJson = preg_replace_callback('/"([^"\\\\]*(\\\\.[^"\\\\]*)*)"/', function($matches) {
            return str_replace("\n", "\\n", $matches[0]);
        }, $jsonSubstring);
        
        $decoded = json_decode($fixedJson, true);
        if ($decoded !== null) {
            return $decoded;
        }
        
        // More aggressive fixing - try to fix unclosed arrays and objects
        $fixedJson = $jsonSubstring;
        
        // Count opening and closing braces/brackets
        $openBraces = substr_count($fixedJson, '{');
        $closeBraces = substr_count($fixedJson, '}');
        $openBrackets = substr_count($fixedJson, '[');
        $closeBrackets = substr_count($fixedJson, ']');
        
        // Add missing closing braces/brackets
        if ($openBraces > $closeBraces) {
            $fixedJson .= str_repeat('}', $openBraces - $closeBraces);
        }
        if ($openBrackets > $closeBrackets) {
            $fixedJson .= str_repeat(']', $openBrackets - $closeBrackets);
        }
        
        $decoded = json_decode($fixedJson, true);
        if ($decoded !== null) {
            return $decoded;
        }
    }
    
    // If all else fails, try to build a valid JSON structure from the response
    // This is a last resort and may not always work correctly
    if (preg_match_all('/"title":\s*"([^"]+)"/', $jsonString, $titleMatches) &&
        preg_match_all('/"description":\s*"([^"]+)"/', $jsonString, $descMatches) &&
        preg_match_all('/"modules":\s*\[([\s\S]*?)\]/', $jsonString, $moduleMatches)) {
        
        // Construct a minimal valid JSON structure
        $reconstructedJson = [
            'title' => $titleMatches[1][0] ?? 'Generated Course',
            'description' => $descMatches[1][0] ?? 'A course generated with AI',
            'modules' => []
        ];
        
        // Try to extract module information
        if (preg_match_all('/{([\s\S]*?)(?=},\s*{|}\s*\])/', $moduleMatches[1][0] . '}', $individualModules)) {
            foreach ($individualModules[0] as $moduleJson) {
                // Extract module title
                if (preg_match('/"title":\s*"([^"]+)"/', $moduleJson, $modTitle)) {
                    $module = [
                        'title' => $modTitle[1],
                        'description' => 'Module description',
                        'lessons' => []
                    ];
                    
                    // Extract module description
                    if (preg_match('/"description":\s*"([^"]+)"/', $moduleJson, $modDesc)) {
                        $module['description'] = $modDesc[1];
                    }
                    
                    // Try to extract lessons
                    if (preg_match('/"lessons":\s*\[([\s\S]*?)\]/', $moduleJson, $lessonMatch)) {
                        if (preg_match_all('/{([\s\S]*?)(?=},\s*{|}\s*\])/', $lessonMatch[1] . '}', $individualLessons)) {
                            foreach ($individualLessons[0] as $lessonJson) {
                                // Extract lesson title
                                if (preg_match('/"title":\s*"([^"]+)"/', $lessonJson, $lesTitle)) {
                                    $lesson = [
                                        'title' => $lesTitle[1],
                                        'content' => 'Lesson content',
                                        'summary' => 'Lesson summary',
                                        'exercises' => []
                                    ];
                                    
                                    // Extract other lesson fields
                                    if (preg_match('/"content":\s*"([^"]+)"/', $lessonJson, $lesContent)) {
                                        $lesson['content'] = $lesContent[1];
                                    }
                                    if (preg_match('/"summary":\s*"([^"]+)"/', $lessonJson, $lesSummary)) {
                                        $lesson['summary'] = $lesSummary[1];
                                    }
                                    
                                    $module['lessons'][] = $lesson;
                                }
                            }
                        }
                    }
                    
                    $reconstructedJson['modules'][] = $module;
                }
            }
        }
        
        return $reconstructedJson;
    }
    
    // If we get here, we couldn't parse the JSON
    throw new Exception("Failed to parse JSON from the response");
}

// Mock function to simulate calling Gemini API
// In a real implementation, you would call the actual Gemini API
function mockGeminiApiCall($topic, $difficulty, $additionalDetails) {
    // Create a simple course structure
    $courseData = [
        'title' => "Learning $topic for $difficulty",
        'description' => "A comprehensive course on $topic designed for $difficulty level students.",
        'modules' => [
            [
                'title' => "Introduction to $topic",
                'description' => "Learn the basics of $topic",
                'lessons' => [
                    [
                        'title' => "Getting Started with $topic",
                        'content' => "This is the content for the first lesson.",
                        'summary' => "A brief introduction to $topic",
                        'exercises' => [
                            'Exercise 1' => "Try to implement a simple $topic example",
                            'Exercise 2' => "Explain the core concepts of $topic"
                        ]
                    ],
                    [
                        'title' => "Core Concepts",
                        'content' => "This is the content for the second lesson.",
                        'summary' => "Understanding the fundamentals",
                        'exercises' => [
                            'Exercise 1' => "Implement a more complex $topic example",
                            'Exercise 2' => "Compare different approaches"
                        ]
                    ]
                ]
            ],
            [
                'title' => "Advanced $topic",
                'description' => "Dive deeper into $topic",
                'lessons' => [
                    [
                        'title' => "Advanced Techniques",
                        'content' => "This is the content for the advanced lesson.",
                        'summary' => "Mastering advanced concepts",
                        'exercises' => [
                            'Exercise 1' => "Solve a complex problem using $topic",
                            'Exercise 2' => "Optimize your solution"
                        ]
                    ]
                ]
            ]
        ]
    ];
    
    return $courseData;
}

try {
    // In a real implementation, you would call the Gemini API here
    // For now, we'll use a mock function
    $courseData = mockGeminiApiCall($topic, $difficulty, $additionalDetails ? $details : null);
    
    // Return the course data
    echo json_encode([
        'status' => 'success',
        'data' => $courseData
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
    error_log("[PHP] Error generating course: " . $e->getMessage());
}
