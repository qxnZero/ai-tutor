<?php
/**
 * Authentication utilities for the PHP backend
 * Handles NextAuth session validation and user authentication
 */

/**
 * Get the current authenticated user from the NextAuth session
 * Returns the user data or null if not authenticated
 */
function getCurrentUser() {
    // Check for NextAuth session cookie
    $sessionToken = null;

    // Look for the NextAuth session token in cookies
    // NextAuth uses different cookie names based on environment
    if (isset($_COOKIE['next-auth.session-token'])) {
        $sessionToken = $_COOKIE['next-auth.session-token'];
    } elseif (isset($_COOKIE['__Secure-next-auth.session-token'])) {
        $sessionToken = $_COOKIE['__Secure-next-auth.session-token'];
    }

    if (!$sessionToken) {
        return null;
    }

    // Get database connection
    $pdo = getDbConnection();

    // Query the session from the database
    $stmt = $pdo->prepare("SELECT * FROM \"Session\" WHERE \"sessionToken\" = ? AND expires > NOW()");
    $stmt->execute([$sessionToken]);
    $session = $stmt->fetch();

    if (!$session) {
        return null;
    }

    // Get the user associated with the session
    $stmt = $pdo->prepare("SELECT * FROM \"User\" WHERE id = ?");
    $stmt->execute([$session['userId']]);
    $user = $stmt->fetch();

    return $user;
}

/**
 * Require authentication for an endpoint
 * Returns the user data or exits with a 401 Unauthorized response
 * Bypasses authentication in test mode or fallback mode
 */
function requireAuth() {
    // Check for test mode or fallback mode
    if (isset($_GET['test']) || isset($_GET['fallback'])) {
        // Return a mock user for testing
        return [
            'id' => 'test-user-id',
            'name' => 'Test User',
            'email' => 'test@example.com'
        ];
    }

    // Normal authentication flow
    $user = getCurrentUser();

    if (!$user) {
        // If fallback mode is enabled globally, return a mock user
        if (function_exists('isFallbackMode') && isFallbackMode()) {
            return [
                'id' => 'fallback-user-id',
                'name' => 'Fallback User',
                'email' => 'fallback@example.com'
            ];
        }

        // Otherwise, return unauthorized error
        if (function_exists('sendErrorResponse')) {
            sendErrorResponse('Unauthorized', 401, 'Authentication required', 'UNAUTHORIZED');
        } else {
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized. Please sign in.']);
            exit;
        }
    }

    return $user;
}
