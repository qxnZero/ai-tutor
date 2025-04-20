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
 */
function requireAuth() {
    $user = getCurrentUser();
    
    if (!$user) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Please sign in.']);
        exit;
    }
    
    return $user;
}
